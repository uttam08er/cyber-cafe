from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extensions import db
from models import Contact
from utils.helpers import success_response, error_response
from utils.validators import validate_email, validate_required_fields
from utils.decorators import admin_required

contact_bp = Blueprint('contact', __name__, url_prefix='/api/contact')


@contact_bp.route('/', methods=['POST'])
def submit_contact():
    """Public: Submit a contact/inquiry form."""
    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    valid, msg = validate_required_fields(data, ['name', 'email', 'subject', 'message'])
    if not valid:
        return jsonify(*error_response(msg))

    valid, msg = validate_email(data['email'])
    if not valid:
        return jsonify(*error_response(msg))

    if len(data['message'].strip()) < 10:
        return jsonify(*error_response('Message must be at least 10 characters long'))

    contact = Contact(
        name=data['name'].strip(),
        email=data['email'].lower().strip(),
        phone=data.get('phone', '').strip() or None,
        subject=data['subject'].strip(),
        message=data['message'].strip(),
    )
    db.session.add(contact)
    db.session.commit()

    return jsonify(*success_response(
        {'id': contact.id},
        'Your message has been received! We will get back to you soon.',
        201
    ))


@contact_bp.route('/admin/all', methods=['GET'])
@jwt_required()
@admin_required
def admin_get_contacts():
    """Admin: Get all contact messages."""
    page = int(request.args.get('page', 1))
    is_read = request.args.get('is_read')

    query = Contact.query
    if is_read is not None:
        query = query.filter_by(is_read=is_read.lower() == 'true')

    query = query.order_by(Contact.created_at.desc())
    from utils.helpers import paginate_query
    paginated = paginate_query(query, page, per_page=20)

    return jsonify(*success_response({
        'contacts': [c.to_dict() for c in paginated['items']],
        'pagination': {k: v for k, v in paginated.items() if k != 'items'}
    }))


@contact_bp.route('/admin/<int:contact_id>/read', methods=['PUT'])
@jwt_required()
@admin_required
def mark_as_read(contact_id):
    """Admin: Mark a contact message as read."""
    contact = Contact.query.get(contact_id)
    if not contact:
        return jsonify(*error_response('Contact not found', 404))
    contact.is_read = True
    db.session.commit()
    return jsonify(*success_response(contact.to_dict(), 'Marked as read'))
