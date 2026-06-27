from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models import Service, Request
from utils.helpers import success_response, error_response
from utils.decorators import admin_required

services_bp = Blueprint('services', __name__, url_prefix='/api/services')


@services_bp.route('/', methods=['GET'])
def get_services():
    """Get all active services (public endpoint)."""
    category = request.args.get('category')
    query = Service.query

    query = query.filter_by(is_active=True)

    if category:
        query = query.filter_by(category=category)

    services = query.order_by(Service.name).all()
    return jsonify(*success_response([s.to_dict() for s in services]))


@services_bp.route('/all', methods=['GET'])
@jwt_required()
@admin_required
def get_all_services():
    """Admin: get all services including inactive ones."""
    services = Service.query.order_by(Service.name).all()
    return jsonify(*success_response([s.to_dict() for s in services]))


@services_bp.route('/<int:service_id>', methods=['GET'])
def get_service(service_id):
    """Get a single service by ID."""
    service = Service.query.get(service_id)
    if not service or not service.is_active:
        return jsonify(*error_response('Service not found', 404))
    return jsonify(*success_response(service.to_dict()))


@services_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_service():
    """Admin: Create a new service."""
    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    required = ['name', 'price']
    for field in required:
        if field not in data:
            return jsonify(*error_response(f'Field {field} is required'))

    import re
    slug = re.sub(r'[^a-z0-9]+', '-', data['name'].lower()).strip('-')
    base_slug = slug
    counter = 1
    while Service.query.filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1

    service = Service(
        name=data['name'].strip(),
        slug=slug,
        description=data.get('description', ''),
        price=float(data['price']),
        price_unit=data.get('price_unit', 'per page'),
        category=data.get('category', 'general'),
        icon=data.get('icon', 'document'),
        is_active=data.get('is_active', True),
        requires_upload=data.get('requires_upload', False),
        turnaround_time=data.get('turnaround_time', '1-2 hours'),
    )

    db.session.add(service)
    db.session.commit()
    return jsonify(*success_response(service.to_dict(), 'Service created', 201))


@services_bp.route('/<int:service_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_service(service_id):
    """Admin: Update a service."""
    service = Service.query.get(service_id)
    if not service:
        return jsonify(*error_response('Service not found', 404))

    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    updatable = ['name', 'description', 'price', 'price_unit', 'category',
                 'icon', 'is_active', 'requires_upload', 'turnaround_time']
    for field in updatable:
        if field in data:
            setattr(service, field, data[field])

    db.session.commit()
    return jsonify(*success_response(service.to_dict(), 'Service updated'))


@services_bp.route('/<int:service_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_service(service_id):
    """Admin: Delete (deactivate) a service."""
    service = Service.query.get(service_id)
    if not service:
        return jsonify(*error_response('Service not found', 404))

    request_count = Request.query.filter(
        Request.service_id == service_id,
    ).count()

    if request_count > 0:
        return jsonify(*error_response(
            f'Cannot delete this service — {request_count} requests are linked to it. '
            f'Deactivate it instead to hide it from users while preserving history.',
            409  # 409 Conflict
        ))

    db.session.delete(service)
    db.session.commit()
    return jsonify(*success_response('Service deleted', 200))
