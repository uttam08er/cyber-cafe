import random
import string
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity
)
from extensions import db
from models import User
from models.otp import OTP
from utils.validators import validate_email, validate_password, validate_phone, validate_required_fields
from utils.helpers import success_response, error_response
from utils.email import send_otp_email

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

OTP_EXPIRY_MINUTES   = 10  
OTP_COOLDOWN_SECONDS = 60  


def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP."""
    return ''.join(random.choices(string.digits, k=length))



@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user account."""
    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    valid, msg = validate_required_fields(data, ['full_name', 'email', 'password'])
    if not valid:
        return jsonify(*error_response(msg))

    valid, msg = validate_email(data['email'])
    if not valid:
        return jsonify(*error_response(msg))

    valid, msg = validate_password(data['password'])
    if not valid:
        return jsonify(*error_response(msg))

    if data.get('phone'):
        valid, msg = validate_phone(data['phone'])
        if not valid:
            return jsonify(*error_response(msg))

    if User.query.filter_by(email=data['email'].lower()).first():
        return jsonify(*error_response('Email address already registered', 409))

    user = User(
        full_name=data['full_name'].strip(),
        email=data['email'].lower().strip(),
        phone=data.get('phone', '').strip() or None,
        role='user'
    )
    user.set_password(data['password'])

    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))  
    refresh_token = create_refresh_token(identity=str(user.id))

    return jsonify(*success_response(
        {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
        },
        'Registration successful',
        201
    ))


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT tokens."""
    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    valid, msg = validate_required_fields(data, ['email', 'password'])
    if not valid:
        return jsonify(*error_response(msg))

    user = User.query.filter_by(email=data['email'].lower().strip()).first()

    if not user or not user.check_password(data['password']):
        return jsonify(*error_response('Invalid email or password', 401))

    if not user.is_active:
        return jsonify(*error_response('Account has been deactivated. Contact support.', 403))

    access_token = create_access_token(identity=str(user.id))   
    refresh_token = create_refresh_token(identity=str(user.id)) 

    return jsonify(*success_response(
        {
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
        },
        'Login successful'
    ))


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Get a new access token using refresh token."""
    current_user_id = get_jwt_identity()         
    user = User.query.get(int(current_user_id))   
    if not user or not user.is_active:
        return jsonify(*error_response('User not found or inactive', 404))

    new_token = create_access_token(identity=str(current_user_id)) 
    return jsonify(*success_response({'access_token': new_token}, 'Token refreshed'))


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get the current authenticated user's profile."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))  
    if not user:
        return jsonify(*error_response('User not found', 404))
    if not user.is_active:
        return jsonify(*error_response('Account has been deactivated. Contact support.', 403))
    return jsonify(*success_response(user.to_dict()))


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update current user's profile."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))  
    if not user:
        return jsonify(*error_response('User not found', 404))

    data = request.get_json()
    if not data:
        return jsonify(*error_response('No data provided'))

    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'phone' in data:
        if data['phone']:
            valid, msg = validate_phone(data['phone'])
            if not valid:
                return jsonify(*error_response(msg))
        user.phone = data['phone'].strip() or None

    db.session.commit()
    return jsonify(*success_response(user.to_dict(), 'Profile updated'))


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """Change current user's password."""
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))  
    if not user:
        return jsonify(*error_response('User not found', 404))

    data = request.get_json()
    valid, msg = validate_required_fields(data, ['current_password', 'new_password'])
    if not valid:
        return jsonify(*error_response(msg))

    if not user.check_password(data['current_password']):
        return jsonify(*error_response('Current password is incorrect', 401))

    valid, msg = validate_password(data['new_password'])
    if not valid:
        return jsonify(*error_response(msg))

    user.set_password(data['new_password'])
    db.session.commit()
    return jsonify(*success_response(message='Password changed successfully'))


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """
    User submits email → OTP is generated and emailed.
    Always returns generic success to prevent email enumeration.
    """
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    email = data.get('email', '').lower().strip()
    valid, msg = validate_email(email)
    if not valid:
        return error_response(msg)

    generic_msg = (
        'If an account with that email exists, '
        'an OTP has been sent. Check your inbox and spam folder.'
    )
    
    user = User.query.filter_by(email=email, is_active=True).first()
    if not user:
        return error_response(message="No account found with this email.",
        status_code=404)

    recent = (
        OTP.query
        .filter_by(email=email, is_used=False)
        .filter(OTP.created_at > datetime.utcnow() - timedelta(seconds=OTP_COOLDOWN_SECONDS))
        .first()
    )
    if recent:
        return error_response(
            f'Please wait {OTP_COOLDOWN_SECONDS} seconds before requesting another OTP.', 429
        )

    OTP.query.filter_by(email=email, is_used=False).delete()
    db.session.flush()

    code = _generate_otp()
    otp  = OTP(
        email      = email,
        code       = code,
        expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES),
    )
    db.session.add(otp)
    db.session.commit()

    sent = send_otp_email(to_email=email, otp_code=code, full_name=user.full_name)
    if not sent:
        db.session.delete(otp)
        db.session.commit()
        return error_response(
            'Failed to send OTP. Please try again later.', 500
        )

    return success_response(message=generic_msg)



@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    """
    User submits email + OTP → returns a short-lived reset_token (valid 15 min).
    """
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    valid, msg = validate_required_fields(data, ['email', 'otp'])
    if not valid:
        return error_response(msg)

    email = data['email'].lower().strip()
    code  = str(data['otp']).strip()

    otp = (
        OTP.query
        .filter_by(email=email, is_used=False)
        .order_by(OTP.created_at.desc())
        .first()
    )

    if not otp or not otp.is_valid():
        return error_response('OTP is invalid or has expired. Please request a new one.', 400)

    if otp.code != code:
        return error_response('Incorrect OTP. Please try again.', 400)

    otp.is_used = True
    db.session.commit()

    reset_token = create_access_token(
        identity          = email,
        expires_delta     = timedelta(minutes=15),
        additional_claims = {'purpose': 'password_reset'},
    )

    return success_response(
        {'reset_token': reset_token},
        'OTP verified. Use the reset token to set your new password.'
    )



@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """
    User submits reset_token + new_password → password is updated.
    """
    data = request.get_json()
    if not data:
        return error_response('No data provided')

    valid, msg = validate_required_fields(data, ['reset_token', 'new_password'])
    if not valid:
        return error_response(msg)

    from flask_jwt_extended import decode_token
    try:
        decoded = decode_token(data['reset_token'])
    except Exception:
        return error_response(
            'Reset token is invalid or has expired. Please start over.', 400
        )

    if decoded.get('purpose') != 'password_reset':
        return error_response('Invalid reset token.', 400)

    email = decoded.get('sub')
    if not email:
        return error_response('Invalid reset token.', 400)

    valid, msg = validate_password(data['new_password'])
    if not valid:
        return error_response(msg)

    user = User.query.filter_by(email=email, is_active=True).first()
    if not user:
        return error_response('User not found.', 404)

    user.set_password(data['new_password'])
    db.session.commit()

    return success_response(
        message='Password reset successfully. You can now log in with your new password.'
    )
