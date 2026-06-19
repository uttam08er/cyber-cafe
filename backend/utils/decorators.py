from functools import wraps
from flask_jwt_extended import get_jwt_identity
from flask import jsonify
from models import User


def admin_required(f):
    """Decorator to require admin role for a route."""
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'message': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated


def active_user_required(f):
    """Decorator to require the user account to be active."""
    @wraps(f)
    def decorated(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or not user.is_active:
            return jsonify({'success': False, 'message': 'Account is deactivated'}), 403
        return f(*args, **kwargs)
    return decorated
