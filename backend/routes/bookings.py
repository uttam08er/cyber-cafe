from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Booking, User, BookingSettings
from utils.helpers import success_response, error_response, generate_booking_number, paginate_query
from utils.decorators import admin_required
from datetime import datetime, date, time
import re

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')

def parse_time(time_str):
    """Parse HH:MM time string to time object."""
    match = re.match(r'^(\d{1,2}):(\d{2})$', time_str)
    if not match:
        return None
    h, m = int(match.group(1)), int(match.group(2))
    if not (0 <= h <= 23 and 0 <= m <= 59):
        return None
    return time(h, m)


# ─── Booking Settings (admin) ─────────────────────────────────────────────────

@bookings_bp.route('/settings', methods=['GET'])
@jwt_required()
def get_booking_settings():
    """Get current booking settings. Accessible to all authenticated users
    so the booking page can display live price / hours."""
    settings = BookingSettings.get()
    return jsonify(*success_response(settings.to_dict()))


@bookings_bp.route('/settings', methods=['PUT'])
@jwt_required()
@admin_required
def update_booking_settings():
    """Admin: update booking settings."""
    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    settings = BookingSettings.get()

    # Validate and apply each field
    if 'max_computers' in data:
        v = int(data['max_computers'])
        if not 1 <= v <= 100:
            return jsonify(*error_response('max_computers must be between 1 and 100'))
        settings.max_computers = v

    if 'price_per_hour' in data:
        v = float(data['price_per_hour'])
        if v < 0:
            return jsonify(*error_response('price_per_hour cannot be negative'))
        settings.price_per_hour = v

    if 'opening_hour' in data:
        v = int(data['opening_hour'])
        if not 0 <= v <= 23:
            return jsonify(*error_response('opening_hour must be 0-23'))
        settings.opening_hour = v

    if 'closing_hour' in data:
        v = int(data['closing_hour'])
        if not 0 <= v <= 23:
            return jsonify(*error_response('closing_hour must be 0-23'))
        settings.closing_hour = v

    if 'opening_hour' in data or 'closing_hour' in data:
        if settings.opening_hour >= settings.closing_hour:
            return jsonify(*error_response('closing_hour must be after opening_hour'))

    if 'max_hours_per_booking' in data:
        v = int(data['max_hours_per_booking'])
        if not 1 <= v <= 12:
            return jsonify(*error_response('max_hours_per_booking must be 1-12'))
        settings.max_hours_per_booking = v

    db.session.commit()
    return jsonify(*success_response(settings.to_dict(), 'Booking settings updated'))


# ─── Public / User routes ─────────────────────────────────────────────────────

@bookings_bp.route('/available', methods=['GET'])
@jwt_required()
def get_available_slots():
    """Get available computer slots for a given date."""
    # ── Read live settings from DB instead of hardcoded constants
    s = BookingSettings.get()

    booking_date_str = request.args.get('date')
    if not booking_date_str:
        return jsonify(*error_response('date parameter required (YYYY-MM-DD)'))

    try:
        booking_date = date.fromisoformat(booking_date_str)
    except ValueError:
        return jsonify(*error_response('Invalid date format. Use YYYY-MM-DD'))

    if booking_date < date.today():
        return jsonify(*error_response('Cannot book past dates'))

    booked = Booking.query.filter_by(
        booking_date=booking_date,
        status=Booking.STATUS_CONFIRMED
    ).all()

    occupied = {i: [] for i in range(1, s.max_computers + 1)}
    for b in booked:
        if b.computer_number in occupied:
            occupied[b.computer_number].append((b.start_time, b.end_time))

    slots = []
    for hour in range(s.opening_hour, s.closing_hour):
        slot_start = time(hour, 0)
        slot_end   = time(hour + 1, 0)
        available_computers = []
        for pc in range(1, s.max_computers + 1):
            is_free = all(
                not (slot_start < bet and slot_end > bst)
                for bst, bet in occupied[pc]
            )
            if is_free:
                available_computers.append(pc)
        slots.append({
            'start_time':          slot_start.strftime('%H:%M'),
            'end_time':            slot_end.strftime('%H:%M'),
            'available_computers': available_computers,
            'available_count':     len(available_computers),
        })

    return jsonify(*success_response({
        'date':           booking_date_str,
        'slots':          slots,
        'price_per_hour': float(s.price_per_hour),
    }))


@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    """Create a new computer slot booking."""
    current_user_id = int(get_jwt_identity())
    s = BookingSettings.get()          # ── live settings

    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    for field in ['booking_date', 'start_time', 'end_time']:
        if field not in data:
            return jsonify(*error_response(f'{field} is required'))

    try:
        booking_date = date.fromisoformat(data['booking_date'])
    except ValueError:
        return jsonify(*error_response('Invalid date format. Use YYYY-MM-DD'))

    if booking_date < date.today():
        return jsonify(*error_response('Cannot book past dates'))

    start_time = parse_time(data['start_time'])
    end_time   = parse_time(data['end_time'])
    if not start_time or not end_time:
        return jsonify(*error_response('Invalid time format. Use HH:MM'))

    if start_time >= end_time:
        return jsonify(*error_response('End time must be after start time'))

    if start_time.hour < s.opening_hour or end_time.hour > s.closing_hour:
        return jsonify(*error_response(
            f'Bookings only available {s.opening_hour:02d}:00 – {s.closing_hour:02d}:00'
        ))

    duration_hours = (
        datetime.combine(booking_date, end_time) -
        datetime.combine(booking_date, start_time)
    ).seconds / 3600

    if duration_hours > s.max_hours_per_booking:
        return jsonify(*error_response(
            f'Maximum booking duration is {s.max_hours_per_booking} hours'
        ))

    requested_pc = data.get('computer_number')
    if requested_pc:
        requested_pc = int(requested_pc)
        conflict = Booking.query.filter_by(
            booking_date=booking_date,
            computer_number=requested_pc,
            status=Booking.STATUS_CONFIRMED
        ).filter(
            Booking.start_time < end_time,
            Booking.end_time > start_time
        ).first()
        if conflict:
            return jsonify(*error_response(
                f'Computer {requested_pc} is not available at this time'
            ))
        computer_number = requested_pc
    else:
        computer_number = None
        for pc in range(1, s.max_computers + 1):
            conflict = Booking.query.filter_by(
                booking_date=booking_date,
                computer_number=pc,
                status=Booking.STATUS_CONFIRMED
            ).filter(
                Booking.start_time < end_time,
                Booking.end_time > start_time
            ).first()
            if not conflict:
                computer_number = pc
                break
        if not computer_number:
            return jsonify(*error_response('No computers available for this time slot'))

    total_price = duration_hours * float(s.price_per_hour)

    booking = Booking(
        booking_number=generate_booking_number(),
        user_id=current_user_id,
        computer_number=computer_number,
        booking_date=booking_date,
        start_time=start_time,
        end_time=end_time,
        duration_hours=duration_hours,
        price_per_hour=float(s.price_per_hour),
        total_price=total_price,
        purpose=data.get('purpose', ''),
        notes=data.get('notes', ''),
        status=Booking.STATUS_CONFIRMED,
    )

    db.session.add(booking)
    db.session.commit()
    return jsonify(*success_response(booking.to_dict(), 'Booking confirmed!', 201))


@bookings_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_bookings():
    """Get all bookings for the current user."""
    current_user_id = int(get_jwt_identity())
    page = int(request.args.get('page', 1))

    query = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.created_at.desc())
    paginated = paginate_query(query, page)

    return jsonify(*success_response({
        'bookings': [b.to_dict() for b in paginated['items']],
        'pagination': {k: v for k, v in paginated.items() if k != 'items'}
    }))


@bookings_bp.route('/<int:booking_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_booking(booking_id):
    """Cancel a booking."""
    current_user_id = int(get_jwt_identity())
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify(*error_response('Booking not found', 404))
    if booking.user_id != current_user_id:
        return jsonify(*error_response('Access denied', 403))
    if booking.status != Booking.STATUS_CONFIRMED:
        return jsonify(*error_response('Only confirmed bookings can be cancelled'))

    booking.status = Booking.STATUS_CANCELLED
    db.session.commit()
    return jsonify(*success_response(booking.to_dict(), 'Booking cancelled'))


# ─── Admin routes ─────────────────────────────────────────────────────────────

@bookings_bp.route('/admin/all', methods=['GET'])
@jwt_required()
@admin_required
def admin_get_all_bookings():
    """Admin: get all bookings."""
    page          = int(request.args.get('page', 1))
    date_filter   = request.args.get('date')
    status_filter = request.args.get('status')

    query = Booking.query
    if date_filter:
        try:
            query = query.filter_by(booking_date=date.fromisoformat(date_filter))
        except ValueError:
            pass
    if status_filter:
        query = query.filter_by(status=status_filter)

    query = query.order_by(Booking.booking_date.desc(), Booking.start_time.asc())
    paginated = paginate_query(query, page, per_page=20)

    return jsonify(*success_response({
        'bookings': [b.to_dict(include_user=True) for b in paginated['items']],
        'pagination': {k: v for k, v in paginated.items() if k != 'items'}
    }))

@bookings_bp.route('/admin/<int:booking_id>/toggle-paid', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_booking_paid(booking_id):
    """Admin: Mark paid or not paid bookings."""
    booking = Booking.query.get(int(booking_id))
    if not booking:
        return jsonify(*error_response('Booking not found', 404))
    booking.is_paid = not booking.is_paid  
    print(booking.is_paid)
    db.session.commit()
    action = 'paid' if booking.is_paid else 'unpaid'
    return jsonify(*success_response(booking.to_dict(), f'User {action}'))   
