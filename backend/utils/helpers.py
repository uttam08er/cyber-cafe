import os
import uuid
from datetime import datetime
from flask import current_app


def generate_request_number():
    """Generate unique request number like REQ-2024-00001."""
    from models import Request
    year = datetime.utcnow().year
    count = Request.query.filter(
        Request.request_number.like(f'REQ-{year}-%')
    ).count()
    return f'REQ-{year}-{str(count + 1).zfill(5)}'


def generate_booking_number():
    """Generate unique booking number like BKG-2024-00001."""
    from models import Booking
    year = datetime.utcnow().year
    count = Booking.query.filter(
        Booking.booking_number.like(f'BKG-{year}-%')
    ).count()
    return f'BKG-{year}-{str(count + 1).zfill(5)}'


def allowed_file(filename):
    """Check if the file extension is allowed."""
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in current_app.config.get('ALLOWED_EXTENSIONS', {'pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'})


def secure_filename_custom(filename):
    """Generate a secure unique filename."""
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else 'bin'
    unique_name = f"{uuid.uuid4().hex}_{int(datetime.utcnow().timestamp())}.{ext}"
    return unique_name


def format_file_size(size_bytes):
    """Format file size in human-readable format."""
    if size_bytes < 1024:
        return f"{size_bytes} B"
    elif size_bytes < 1024 * 1024:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 * 1024):.1f} MB"


def paginate_query(query, page, per_page=10, status_field=None):
    """Helper to paginate SQLAlchemy queries."""
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    if status_field is not None:
        pending_total    = query.filter(status_field == 'pending').count()
        processing_total = query.filter(status_field == 'processing').count()
        completed_total  = query.filter(status_field == 'completed').count()
    else:
        pending_total    = 0
        processing_total = 0
        completed_total  = 0
    return {
        'items': paginated.items,
        'total': paginated.total,
        'pending_total':pending_total,
        'processing_total':processing_total,
        'completed_total':completed_total,
        'pages': paginated.pages,
        'current_page': paginated.page,
        'per_page': per_page,
        'has_next': paginated.has_next,
        'has_prev': paginated.has_prev,
    }


def success_response(data=None, message='Success', status_code=200):
    """Standard success response."""
    response = {'success': True, 'message': message}
    if data is not None:
        response['data'] = data
    return response, status_code


def error_response(message='An error occurred', status_code=400, errors=None):
    """Standard error response."""
    response = {'success': False, 'message': message}
    if errors:
        response['errors'] = errors
    return response, status_code
