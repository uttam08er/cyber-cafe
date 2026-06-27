from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from datetime import datetime
from extensions import db
from models import Update
from utils.helpers import success_response, error_response, paginate_query
from utils.decorators import admin_required

updates_bp = Blueprint('updates', __name__, url_prefix='/api/updates')



@updates_bp.route('/', methods=['GET'])
def get_updates():
    """
    Public: Get all active, non-expired updates.
    Supports ?category=, ?search=, ?important=true, ?page=
    Pinned updates always appear first.
    """
    page      = int(request.args.get('page', 1))
    per_page  = int(request.args.get('per_page', 12))
    category  = request.args.get('category', '').strip()
    search    = request.args.get('search', '').strip()
    important = request.args.get('important', '').lower()

    query = Update.query.filter_by(is_active=True)

    query = query.filter(
        (Update.expires_at == None) | (Update.expires_at > datetime.utcnow())
    )

    if category:
        query = query.filter_by(category=category)

    if search:
        query = query.filter(
            (Update.title.ilike(f'%{search}%')) |
            (Update.description.ilike(f'%{search}%'))
        )

    if important == 'true':
        query = query.filter_by(is_important=True)

    query = query.order_by(Update.is_pinned.desc(), Update.created_at.desc())

    paginated = paginate_query(query, page, per_page=per_page)

    return jsonify(*success_response({
        'updates':    [u.to_dict() for u in paginated['items']],
        'pagination': {k: v for k, v in paginated.items() if k != 'items'},
        'categories': Update.ALL_CATEGORIES,
    }))


@updates_bp.route('/latest', methods=['GET'])
def get_latest_updates():
    """
    Public: Get latest 6 updates for homepage section.
    Returns pinned + important first, then newest.
    """
    updates = Update.query.filter_by(is_active=True).filter(
        (Update.expires_at == None) | (Update.expires_at > datetime.utcnow())
    ).order_by(
        Update.is_pinned.desc(),
        Update.is_important.desc(),
        Update.created_at.desc()
    ).limit(6).all()

    return jsonify(*success_response({
        'updates':    [u.to_dict() for u in updates],
        'categories': Update.ALL_CATEGORIES,
    }))


@updates_bp.route('/<int:update_id>', methods=['GET'])
def get_update(update_id):
    """Public: Get a single update by ID."""
    update = Update.query.filter_by(id=update_id, is_active=True).first()
    if not update:
        return jsonify(*error_response('Update not found', 404))
    return success_response(update.to_dict())



@updates_bp.route('/admin/all', methods=['GET'])
@jwt_required()
@admin_required
def admin_get_all():
    """Admin: Get all updates including inactive ones."""
    page     = int(request.args.get('page', 1))
    category = request.args.get('category', '').strip()

    query = Update.query
    if category:
        query = query.filter_by(category=category)

    query = query.order_by(Update.is_pinned.desc(), Update.created_at.desc())
    paginated = paginate_query(query, page, per_page=15)

    return jsonify(*success_response({
        'updates':    [u.to_dict() for u in paginated['items']],
        'pagination': {k: v for k, v in paginated.items() if k != 'items'},
        'categories': Update.ALL_CATEGORIES,
    }))


@updates_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_update():
    """Admin: Create a new update/notification."""
    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    for field in ['title', 'description', 'category']:
        if not data.get(field, '').strip():
            return jsonify(*error_response(f'Field "{field}" is required'))

    if data['category'] not in Update.ALL_CATEGORIES:
        return jsonify(*error_response(
            f'Invalid category. Must be one of: {", ".join(Update.ALL_CATEGORIES)}'
        ))

    expires_at = None
    if data.get('expires_at'):
        try:
            expires_at = datetime.fromisoformat(data['expires_at'].replace('Z', ''))
        except ValueError:
            return jsonify(*error_response('Invalid expires_at format. Use ISO 8601.'))
    update = Update(
        title        = data['title'].strip(),
        description  = data['description'].strip(),
        category     = data['category'],
        is_important = bool(data.get('is_important', False)),
        is_pinned    = bool(data.get('is_pinned', False)),
        is_active    = bool(data.get('is_active', True)),
        link         = (data.get('link') or '').strip() or None,
        expires_at   = expires_at,
    )
    db.session.add(update)
    db.session.commit()

    return jsonify(*success_response(update.to_dict(), 'Update created successfully', 201))


@updates_bp.route('/<int:update_id>', methods=['PUT'])
@jwt_required()
@admin_required
def edit_update(update_id):
    """Admin: Edit an existing update."""
    update = Update.query.get(int(update_id))
    if not update:
        return jsonify(*error_response('Update not found', 404))

    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))
    if 'title' in data and data['title'].strip():
        update.title = data['title'].strip()
    if 'description' in data and data['description'].strip():
        update.description = data['description'].strip()
    if 'category' in data:
        if data['category'] not in Update.ALL_CATEGORIES:
            return jsonify(*error_response(f'Invalid category.'))
        update.category = data['category']
    if 'is_important' in data:
        update.is_important = bool(data['is_important'])
    if 'is_pinned' in data:
        update.is_pinned = bool(data['is_pinned'])
    if 'is_active' in data:
        update.is_active = bool(data['is_active'])
    if 'link' in data and data['link']:
        update.link = str(data['link']).strip()
    else:
        update.link = None
    if 'expires_at' in data:
        if data['expires_at']:
            try:
                update.expires_at = datetime.fromisoformat(
                    data['expires_at'].replace('Z', '')
                )
            except ValueError:
                return jsonify(*error_response('Invalid expires_at format.'))
        else:
            update.expires_at = None

    db.session.commit()
    return jsonify(*success_response(update.to_dict(), 'Update saved'))


@updates_bp.route('/<int:update_id>/pin', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_pin(update_id):
    """Admin: Toggle pin status of an update."""
    update = Update.query.get(update_id)
    if not update:
        return jsonify(*error_response('Update not found', 404))
    update.is_pinned = not update.is_pinned
    db.session.commit()
    action = 'pinned' if update.is_pinned else 'unpinned'
    return jsonify(*success_response(update.to_dict(), f'Update {action}'))


@updates_bp.route('/<int:update_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_update(update_id):
    """Admin: Delete an update permanently."""
    update = Update.query.get(update_id)
    if not update:
        return jsonify(*error_response('Update not found', 404))
    db.session.delete(update)
    db.session.commit()
    return jsonify(*success_response(message='Update deleted'))