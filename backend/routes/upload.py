import os
import uuid
from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models import Request, User
from utils.helpers import success_response, error_response, allowed_file
from utils.decorators import admin_required
from datetime import datetime

upload_bp = Blueprint('upload', __name__, url_prefix='/api/upload')


def get_upload_path():
    """Get and ensure upload directory exists."""
    upload_folder = current_app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    return upload_folder

@upload_bp.route('/request/<int:request_id>', methods=['POST'])
@jwt_required()
def upload_file_for_request(request_id):
    """Upload a file and attach it to a request."""
    current_user_id = int(get_jwt_identity())
   
    req = Request.query.get(request_id)

    if not req:
        return jsonify(*error_response('Request not found', 404))
    
    if 'file' not in request.files:
        return jsonify(*error_response('No file part in the request'))

    file = request.files['file']
    if file.filename == '':
        return jsonify(*error_response('No file selected'))

    if not allowed_file(file.filename):
        allowed = ', '.join(current_app.config.get('ALLOWED_EXTENSIONS', []))
        return jsonify(*error_response(f'File type not allowed. Allowed types: {allowed}'))

    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)

    max_size = current_app.config.get('MAX_CONTENT_LENGTH', 10 * 1024 * 1024)
    if file_size > max_size:
        return jsonify(*error_response(f'File too large. Maximum size: {max_size // (1024*1024)}MB'))

    original_filename = secure_filename(file.filename)
    ext = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else 'bin'
    unique_filename = f"{uuid.uuid4().hex}_{int(datetime.utcnow().timestamp())}.{ext}"

    upload_path = get_upload_path()
    save_path = os.path.join(upload_path, unique_filename)
    file.save(save_path)

    if req.file_path:
        old_path = os.path.join(upload_path, req.file_path)
        if os.path.exists(old_path):
            os.remove(old_path)

    user_role = User.query.with_entities(User.role).filter_by(id=current_user_id).scalar()
    
    req.file_name = original_filename
    req.file_path = unique_filename
    req.file_size = file_size
    req.file_type = ext
    req.file_uploaded_by = user_role
    db.session.commit()

    return jsonify(*success_response(
        {
            'file_name': original_filename,
            'file_size': file_size,
            'file_type': ext,
        },
        'File uploaded successfully',
        201
    ))


@upload_bp.route('/admin/download/<int:request_id>', methods=['GET'])
@jwt_required()
@admin_required
def admin_download_user_file(request_id):
    """
    Admin downloads the file uploaded by the user.
    Only available when file_uploaded_by = 'user'.
    """
    req = Request.query.get(request_id)
    if not req:
        return error_response('Request not found', 404)
    if not req.file_path:
        return error_response('No file attached to this request', 404)

    return send_from_directory(
        current_app.config['UPLOAD_FOLDER'],
        req.file_path,
        as_attachment=True,
        download_name=req.file_name or req.file_path,
    )

@upload_bp.route('/file/<int:request_id>', methods=['GET'])
@jwt_required()
def serve_file(request_id):
    """Serve an uploaded file (authenticated users only)."""
    current_user_id = int(get_jwt_identity())  
    user = User.query.get(current_user_id)   
 
    if not user:
        return jsonify(*error_response('User not found', 404))
    
    req = Request.query.get(request_id)
    if not req:
        return error_response('Request not found', 404)
    
    if not req.file_path:
        return error_response('No file attached to this request', 404)
 
    return send_from_directory(
        current_app.config['UPLOAD_FOLDER'],
        req.file_path,
        as_attachment=True,         
        download_name=req.file_name,  
    )

@upload_bp.route('/delete/<int:request_id>', methods=['DELETE'])
@jwt_required()
def delete_file(request_id):
    """Delete an uploaded file from a request."""
    req = Request.query.get(request_id)

    if not req:
        return jsonify(*error_response('Request not found', 404))

    if not req.file_path:
        return jsonify(*error_response('No file attached to this request'))

    upload_folder = current_app.config['UPLOAD_FOLDER']
    file_path = os.path.join(upload_folder, req.file_path)
    if os.path.exists(file_path):
        os.remove(file_path)

    req.file_name = None
    req.file_path = None
    req.file_size = None
    req.file_type = None
    req.file_uploaded_by = None
    db.session.commit()

    return jsonify(*success_response(message='File deleted successfully'))
