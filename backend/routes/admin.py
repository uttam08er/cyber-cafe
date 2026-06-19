from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import func
from extensions import db
from models import User, Service, Request, Booking, Contact
from utils.helpers import success_response, error_response, paginate_query
from utils.decorators import admin_required
from datetime import datetime, date, timedelta

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')


def calc_trend(this_period, last_period):
    """
    Calculate percentage change between two periods.

    Returns an integer:
      +12  → up 12%   → frontend shows green TrendingUp
      -5   → down 5%  → frontend shows red TrendingDown
       0   → no change
       100 → last period was 0, this period has data (new activity)
       0   → both periods are 0 (no change)

    Formula: ((this - last) / last) * 100
    """
    if last_period == 0:
        return 100 if this_period > 0 else 0
    return round(((this_period - last_period) / last_period) * 100)


@admin_bp.route('/dashboard', methods=['GET'])
@jwt_required()
@admin_required
def get_dashboard():
    """Admin: Get dashboard analytics and summary stats."""
    today = date.today()
    print(today)
    week_ago       = today - timedelta(days=7)

    # ── Date ranges for trend comparison ──────────────────────────────────────
    # This month  = last 30 days  (today-30  →  today)
    # Last month  = prior 30 days (today-60  →  today-30)
    # Trend = ((this_month - last_month) / last_month) * 100
    this_month_start = today - timedelta(days=30)
    last_month_start = today - timedelta(days=60)
    last_month_end   = today - timedelta(days=30)  # = this_month_start

    # ── User stats ────────────────────────────────────────────────────────────
    total_users    = User.query.filter_by(role='user').count()
    new_users_week = User.query.filter(
        User.role == 'user',
        User.created_at >= week_ago
    ).count()

    # New users this month vs last month → trend
    new_users_this_month = User.query.filter(
        User.role == 'user',
        User.created_at >= this_month_start
    ).count()
    new_users_last_month = User.query.filter(
        User.role == 'user',
        User.created_at >= last_month_start,
        User.created_at < last_month_end
    ).count()
    users_trend = calc_trend(new_users_this_month, new_users_last_month)

    # ── Request stats ─────────────────────────────────────────────────────────
    total_requests      = Request.query.count()
    pending_requests    = Request.query.filter_by(status=Request.STATUS_PENDING).count()
    processing_requests = Request.query.filter_by(status=Request.STATUS_PROCESSING).count()
    completed_requests  = Request.query.filter_by(status=Request.STATUS_COMPLETED).count()

    requests_this_month = Request.query.filter(
        Request.created_at >= this_month_start
    ).count()
    requests_last_month = Request.query.filter(
        Request.created_at >= last_month_start,
        Request.created_at < last_month_end
    ).count()
    requests_trend = calc_trend(requests_this_month, requests_last_month)

    # ── Booking stats ─────────────────────────────────────────────────────────
    total_bookings    = Booking.query.count()
    upcoming_bookings = Booking.query.filter(
        Booking.booking_date >= today,
        Booking.status == Booking.STATUS_CONFIRMED
    ).count()

    bookings_this_month = Booking.query.filter(
        Booking.created_at >= this_month_start,
        Booking.status != Booking.STATUS_CANCELLED
    ).count()
    bookings_last_month = Booking.query.filter(
        Booking.created_at >= last_month_start,
        Booking.created_at < last_month_end,
        Booking.status != Booking.STATUS_CANCELLED
    ).count()
    bookings_trend = calc_trend(bookings_this_month, bookings_last_month)

    # ── Revenue ───────────────────────────────────────────────────────────────
    request_revenue = db.session.query(
        func.sum(Request.total_price)
    ).filter(Request.status == Request.STATUS_COMPLETED).scalar() or 0

    booking_revenue = db.session.query(
        func.sum(Booking.total_price)
    ).filter(Booking.is_paid == Booking.STATUS_PAID).scalar() or 0

    # Revenue this month vs last month → trend
    revenue_this_month = (
        db.session.query(func.sum(Request.total_price)).filter(
            Request.status == Request.STATUS_COMPLETED,
            Request.created_at >= this_month_start
        ).scalar() or 0
    ) + (
        db.session.query(func.sum(Booking.total_price)).filter(
            Booking.status != Booking.STATUS_CANCELLED,
            Booking.created_at >= this_month_start
        ).scalar() or 0
    )
    revenue_last_month = (
        db.session.query(func.sum(Request.total_price)).filter(
            Request.status == Request.STATUS_COMPLETED,
            Request.created_at >= last_month_start,
            Request.created_at < last_month_end
        ).scalar() or 0
    ) + (
        db.session.query(func.sum(Booking.total_price)).filter(
            Booking.status != Booking.STATUS_CANCELLED,
            Booking.created_at >= last_month_start,
            Booking.created_at < last_month_end
        ).scalar() or 0
    )
    revenue_trend = calc_trend(float(revenue_this_month), float(revenue_last_month))

    # ── Misc ──────────────────────────────────────────────────────────────────
    unread_contacts = Contact.query.filter_by(is_read=False).count()
    recent_requests = Request.query.order_by(Request.created_at.desc()).limit(5).all()

    service_stats = db.session.query(
        Service.name,
        func.count(Request.id).label('request_count')
    ).join(Request, Request.service_id == Service.id)\
     .group_by(Service.id)\
     .order_by(func.count(Request.id).desc())\
     .limit(5).all()

    status_distribution = db.session.query(
        Request.status,
        func.count(Request.id).label('count')
    ).group_by(Request.status).all()

    daily_requests = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = Request.query.filter(
            func.date(Request.created_at) == day
        ).count()
        daily_requests.append({'date': day.isoformat(), 'count': count})

    return jsonify(*success_response({
        'users': {
            'total':            total_users,
            'new_this_week':    new_users_week,
            'new_this_month':   new_users_this_month,
            'trend':            users_trend,       # ✅ NEW — % change vs last month
        },
        'requests': {
            'total':            total_requests,
            'pending':          pending_requests,
            'processing':       processing_requests,
            'completed':        completed_requests,
            'this_month':       requests_this_month,
            'trend':            requests_trend,    # ✅ NEW — % change vs last month
        },
        'bookings': {
            'total':            total_bookings,
            'upcoming':         upcoming_bookings,
            'this_month':       bookings_this_month,
            'trend':            bookings_trend,    # ✅ NEW — % change vs last month
        },
        'revenue': {
            'from_requests':    round(float(request_revenue), 2),
            'from_bookings':    round(float(booking_revenue), 2),
            'total':            round(float(request_revenue) + float(booking_revenue), 2),
            'this_month':       round(float(revenue_this_month), 2),
            'trend':            revenue_trend,     # ✅ NEW — % change vs last month
        },
        'unread_contacts': unread_contacts,
        'recent_requests': [r.to_dict(include_service=True, include_user=True) for r in recent_requests],
        'service_popularity': [{'name': s.name, 'count': s.request_count} for s in service_stats],
        'status_distribution': [{'status': s.status, 'count': s.count} for s in status_distribution],
        'daily_requests': daily_requests,
    }))


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_users():
    """Admin: Get all users with pagination and search."""
    page   = int(request.args.get('page', 1))
    search = request.args.get('search', '')

    query = User.query.filter_by(role='user')
    if search:
        query = query.filter(
            (User.full_name.ilike(f'%{search}%')) |
            (User.email.ilike(f'%{search}%'))     |
            (User.phone.ilike(f'%{search}%'))
        )

    query = query.order_by(User.created_at.desc())
    paginated = paginate_query(query, page, per_page=20)

    users_data = []
    for user in paginated['items']:
        u = user.to_dict()
        u['request_count'] = Request.query.filter_by(user_id=user.id).count()
        u['booking_count']  = Booking.query.filter_by(user_id=user.id).count()
        users_data.append(u)

    return jsonify(*success_response({
        'users': users_data,
        'pagination': {k: v for k, v in paginated.items() if k != 'items'}
    }))


@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_user(user_id):
    """Admin: Get a specific user's details."""
    user = User.query.get(user_id)
    if not user:
        return jsonify(*error_response('User not found', 404))

    u = user.to_dict()
    u['requests'] = [r.to_dict(include_service=True) for r in user.requests[-10:]]
    u['bookings']  = [b.to_dict() for b in user.bookings[-5:]]
    return jsonify(*success_response(u))


@admin_bp.route('/users/<int:user_id>/toggle-active', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_active(user_id):
    """Admin: Activate or deactivate a user."""
    current_user_id = int(get_jwt_identity())
    if user_id == current_user_id:
        return jsonify(*error_response('Cannot deactivate your own account'))

    user = User.query.get(user_id)
    if not user:
        return jsonify(*error_response('User not found', 404))

    user.is_active = not user.is_active
    db.session.commit()
    action = 'activated' if user.is_active else 'deactivated'
    return jsonify(*success_response(user.to_dict(), f'User {action}'))