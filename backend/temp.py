# from flask import Blueprint, request, jsonify
# from flask_jwt_extended import jwt_required, get_jwt_identity
# from extensions import db
# from models import Booking, User
# from utils.helpers import success_response, error_response, generate_booking_number, paginate_query
# from utils.decorators import admin_required
# from datetime import datetime, date, time
# import re

# bookings_bp = Blueprint('bookings', __name__, url_prefix='/api/bookings')

# PRICE_PER_HOUR = 30.0   # ₹30 per hour
# MAX_COMPUTERS = 10       # number of PCs available
# OPENING_HOUR = 8         # 8 AM
# CLOSING_HOUR = 22        # 10 PM


# def parse_time(time_str):
#     """Parse HH:MM time string to time object."""
#     match = re.match(r'^(\d{1,2}):(\d{2})$', time_str)
#     if not match:
#         return None
#     h, m = int(match.group(1)), int(match.group(2))
#     if not (0 <= h <= 23 and 0 <= m <= 59):
#         return None
#     return time(h, m)


# @bookings_bp.route('/available', methods=['GET'])
# @jwt_required()
# def get_available_slots():
#     """Get available computer slots for a given date."""
#     booking_date_str = request.args.get('date')
#     if not booking_date_str:
#         return jsonify(*error_response('date parameter required (YYYY-MM-DD)'))

#     try:
#         booking_date = date.fromisoformat(booking_date_str)
#     except ValueError:
#         return jsonify(*error_response('Invalid date format. Use YYYY-MM-DD'))

#     if booking_date < date.today():
#         return jsonify(*error_response('Cannot book past dates'))

#     # Get confirmed bookings for this date
#     booked = Booking.query.filter_by(
#         booking_date=booking_date,
#         status=Booking.STATUS_CONFIRMED
#     ).all()

#     # Build slot occupancy map: computer -> list of (start, end) tuples
#     occupied = {i: [] for i in range(1, MAX_COMPUTERS + 1)}
#     for b in booked:
#         occupied[b.computer_number].append((b.start_time, b.end_time))

#     # Build hourly time slots
#     slots = []
#     for hour in range(OPENING_HOUR, CLOSING_HOUR):
#         slot_start = time(hour, 0)
#         slot_end = time(hour + 1, 0)
#         available_computers = []
#         for pc in range(1, MAX_COMPUTERS + 1):
#             # Check if this PC is free for this slot
#             is_free = True
#             for (bst, bet) in occupied[pc]:
#                 # Overlap: slot_start < bet AND slot_end > bst
#                 if slot_start < bet and slot_end > bst:
#                     is_free = False
#                     break
#             if is_free:
#                 available_computers.append(pc)
#         slots.append({
#             'start_time': slot_start.strftime('%H:%M'),
#             'end_time': slot_end.strftime('%H:%M'),
#             'available_computers': available_computers,
#             'available_count': len(available_computers),
#         })

#     return jsonify(*success_response({
#         'date': booking_date_str,
#         'slots': slots,
#         'price_per_hour': PRICE_PER_HOUR,
#     }))


# @bookings_bp.route('/', methods=['POST'])
# @jwt_required()
# def create_booking():
#     """Create a new computer slot booking."""
#     current_user_id = get_jwt_identity()
#     data = request.get_json()
#     if not data:
#         return jsonify(*error_response('No data provided'))

#     # Validate required fields
#     required = ['booking_date', 'start_time', 'end_time']
#     for field in required:
#         if field not in data:
#             return jsonify(*error_response(f'{field} is required'))

#     try:
#         booking_date = date.fromisoformat(data['booking_date'])
#     except ValueError:
#         return jsonify(*error_response('Invalid date format. Use YYYY-MM-DD'))

#     if booking_date < date.today():
#         return jsonify(*error_response('Cannot book past dates'))

#     start_time = parse_time(data['start_time'])
#     end_time = parse_time(data['end_time'])
#     if not start_time or not end_time:
#         return jsonify(*error_response('Invalid time format. Use HH:MM'))

#     if start_time >= end_time:
#         return jsonify(*error_response('End time must be after start time'))

#     if start_time.hour < OPENING_HOUR or end_time.hour > CLOSING_HOUR:
#         return jsonify(*error_response(f'Bookings only available {OPENING_HOUR}:00 - {CLOSING_HOUR}:00'))

#     # Calculate duration
#     duration_hours = (
#         datetime.combine(booking_date, end_time) - datetime.combine(booking_date, start_time)
#     ).seconds / 3600

#     if duration_hours > 4:
#         return jsonify(*error_response('Maximum booking duration is 4 hours'))

#     # Find available computer
#     requested_pc = data.get('computer_number')
#     if requested_pc:
#         requested_pc = int(requested_pc)
#         # Check if requested PC is available
#         conflict = Booking.query.filter_by(
#             booking_date=booking_date,
#             computer_number=requested_pc,
#             status=Booking.STATUS_CONFIRMED
#         ).filter(
#             Booking.start_time < end_time,
#             Booking.end_time > start_time
#         ).first()
#         if conflict:
#             return jsonify(*error_response(f'Computer {requested_pc} is not available at this time'))
#         computer_number = requested_pc
#     else:
#         # Auto-assign first available PC
#         computer_number = None
#         for pc in range(1, MAX_COMPUTERS + 1):
#             conflict = Booking.query.filter_by(
#                 booking_date=booking_date,
#                 computer_number=pc,
#                 status=Booking.STATUS_CONFIRMED
#             ).filter(
#                 Booking.start_time < end_time,
#                 Booking.end_time > start_time
#             ).first()
#             if not conflict:
#                 computer_number = pc
#                 break
#         if not computer_number:
#             return jsonify(*error_response('No computers available for this time slot'))

#     total_price = duration_hours * PRICE_PER_HOUR

#     booking = Booking(
#         booking_number=generate_booking_number(),
#         user_id=current_user_id,
#         computer_number=computer_number,
#         booking_date=booking_date,
#         start_time=start_time,
#         end_time=end_time,
#         duration_hours=duration_hours,
#         price_per_hour=PRICE_PER_HOUR,
#         total_price=total_price,
#         purpose=data.get('purpose', ''),
#         notes=data.get('notes', ''),
#         status=Booking.STATUS_CONFIRMED,
#     )

#     db.session.add(booking)
#     db.session.commit()
#     return jsonify(*success_response(booking.to_dict(), 'Booking confirmed!', 201))


# @bookings_bp.route('/my', methods=['GET'])
# @jwt_required()
# def get_my_bookings():
#     """Get all bookings for the current user."""
#     current_user_id = get_jwt_identity()
#     page = int(request.args.get('page', 1))

#     query = Booking.query.filter_by(user_id=current_user_id).order_by(Booking.created_at.desc())
#     paginated = paginate_query(query, page)

#     return jsonify(*success_response({
#         'bookings': [b.to_dict() for b in paginated['items']],
#         'pagination': {k: v for k, v in paginated.items() if k != 'items'}
#     }))


# @bookings_bp.route('/<int:booking_id>/cancel', methods=['POST'])
# @jwt_required()
# def cancel_booking(booking_id):
#     """Cancel a booking."""
#     current_user_id = get_jwt_identity()
#     booking = Booking.query.get(booking_id)
#     if not booking:
#         return jsonify(*error_response('Booking not found', 404))
#     if booking.user_id != int(current_user_id):
#         return jsonify(*error_response('Access denied', 403))
#     if booking.status != Booking.STATUS_CONFIRMED:
#         return jsonify(*error_response('Only confirmed bookings can be cancelled'))

#     booking.status = Booking.STATUS_CANCELLED
#     db.session.commit()
#     return jsonify(*success_response(booking.to_dict(), 'Booking cancelled'))


# @bookings_bp.route('/admin/all', methods=['GET'])
# @jwt_required()
# @admin_required
# def admin_get_all_bookings():
#     """Admin: get all bookings."""
#     page = int(request.args.get('page', 1))
#     date_filter = request.args.get('date')
#     status_filter = request.args.get('status')

#     query = Booking.query
#     if date_filter:
#         try:
#             query = query.filter_by(booking_date=date.fromisoformat(date_filter))
#         except ValueError:
#             pass
#     if status_filter:
#         query = query.filter_by(status=status_filter)

#     query = query.order_by(Booking.booking_date.desc(), Booking.start_time.asc())
#     paginated = paginate_query(query, page, per_page=20)

#     return jsonify(*success_response({
#         'bookings': [b.to_dict(include_user=True) for b in paginated['items']],
#         'pagination': {k: v for k, v in paginated.items() if k != 'items'}
#     }))

# @bookings_bp.route('/booking/<int:booking_id>/toggle-active', methods=['PUT'])
# # @jwt_required()
# @admin_required
# def toggle_user_paid(booking_id):
#     """Admin: Activate or deactivate a user."""
#     booking = Booking.query.get(int(booking_id))
#     print(booking)
#     if booking_id != booking:
#         return jsonify(*error_response('Cannot change payment status'))
#     # user = User.query.get(booking.user_id)  
#     # if not user:
#     #     return jsonify(*error_response('User not found', 404))

#     booking.is_paid = not booking.is_paid
#     db.session.commit()
#     action = 'paid' if booking.is_paid else 'unpaid'
#     return jsonify(*success_response(booking.to_dict(), f'Booking {action}'))



