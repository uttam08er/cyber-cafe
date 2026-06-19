from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Request, Service, User
from utils.helpers import success_response, error_response, generate_request_number, paginate_query
from utils.decorators import admin_required
from datetime import datetime,timedelta, date

requests_bp = Blueprint('requests', __name__, url_prefix='/api/requests')


@requests_bp.route('/', methods=['POST'])
@jwt_required()
def create_request():
    """Create a new service request."""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    if not data:
        return jsonify(*error_response('No data provided'))

    service_id = data.get('service_id')
    if not service_id:
        return jsonify(*error_response('service_id is required'))

    service = Service.query.get(service_id)
    if not service or not service.is_active:
        return jsonify(*error_response('Service not found', 404))

    quantity = int(data.get('quantity', 1))
    total_price = service.price * quantity

    req = Request(
        request_number=generate_request_number(),
        user_id=current_user_id,
        service_id=service_id,
        notes=data.get('notes', ''),
        quantity=quantity,
        total_price=total_price,
        status=Request.STATUS_PENDING,
    )

    db.session.add(req)
    db.session.commit()
    return jsonify(*success_response(
        req.to_dict(include_service=True),
        'Request submitted successfully',
        201
    ))


@requests_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_requests():

    """Get all requests for the current user."""
    current_user_id = int(get_jwt_identity())
    page = int(request.args.get('page', 1))
    status_filter = request.args.get('status')

    query = Request.query.filter_by(user_id=current_user_id)
    if status_filter:
        query = query.filter_by(status=status_filter)

    query = query.order_by(Request.created_at.desc())
    paginated = paginate_query(query, page, status_field=Request.status)

    return jsonify(*success_response({
        'requests': [r.to_dict(include_service=True) for r in paginated['items']],
        'pagination': {k: v for k, v in paginated.items() if k != 'items'}
    }))


@requests_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_request(request_id):
    """Get a single request (user can only see their own)."""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)

    req = Request.query.get(request_id)
    if not req:
        return jsonify(*error_response('Request not found', 404))

    # Only admin or request owner can view
    if user.role != 'admin' and req.user_id != current_user_id:
        return jsonify(*error_response('Access denied', 403))

    return jsonify(*success_response(req.to_dict(include_service=True, include_user=user.role == 'admin')))


@requests_bp.route('/<int:request_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_request(request_id):
    """Cancel a pending request."""
    current_user_id = int(get_jwt_identity())
    req = Request.query.get(request_id)

    if not req:
        return jsonify(*error_response('Request not found', 404))
    
    if req.user_id != int(current_user_id):
        return jsonify(*error_response('Access denied', 403))

    if req.status not in [Request.STATUS_PENDING]:
        return jsonify(*error_response('Only pending requests can be cancelled'))

    req.status = Request.STATUS_CANCELLED
    db.session.commit()
    return jsonify(*success_response(req.to_dict(), 'Request cancelled'))


# ─── Admin routes ────────────────────────────────────────────────────────────

@requests_bp.route('/admin/all', methods=['GET'])
@jwt_required()
@admin_required
def admin_get_all_requests():
    """Admin: get all requests with filters."""
    page = int(request.args.get('page', 1))
    date_filter = request.args.get('date')
    status_filter = request.args.get('status')
    service_filter = request.args.get('service_id')

    query = Request.query
    if date_filter:
        try:
            selected_date = datetime.strptime(date_filter, "%Y-%m-%d")
            next_day = selected_date + timedelta(days=1)

            query = query.filter(
                Request.created_at >= selected_date,
                Request.created_at < next_day
            )        
        except ValueError:
            pass
    if status_filter:
        query = query.filter_by(status=status_filter)
    if service_filter:
        query = query.filter_by(service_id=int(service_filter))

    query = query.order_by(Request.created_at.desc())
    paginated = paginate_query(query, page, per_page=20)

    return jsonify(*success_response({
        'requests': [r.to_dict(include_service=True, include_user=True) for r in paginated['items']],
        'pagination': {k: v for k, v in paginated.items() if k != 'items'}
    }))


@requests_bp.route('/admin/<int:request_id>/status', methods=['PUT'])
@jwt_required()
@admin_required
def admin_update_status(request_id):
    """Admin: update request status."""
    current_user_id = int(get_jwt_identity())
    req = Request.query.get(request_id)
    if not req:
        return jsonify(*error_response('Request not found', 404))

    data = request.get_json()
    new_status = data.get('status')
    if new_status not in Request.VALID_STATUSES:
        return jsonify(*error_response(f'Invalid status. Must be one of: {", ".join(Request.VALID_STATUSES)}'))

    req.status = new_status
    req.processed_by = current_user_id
    if data.get('admin_notes'):
        req.admin_notes = data['admin_notes']
    if new_status == Request.STATUS_COMPLETED:
        req.completed_at = datetime.utcnow()

    db.session.commit()
    return jsonify(*success_response(req.to_dict(include_service=True, include_user=True), 'Status updated'))
