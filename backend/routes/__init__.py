from .auth import auth_bp
from .services import services_bp
from .requests import requests_bp
from .upload import upload_bp
from .bookings import bookings_bp
from .admin import admin_bp
from .contact import contact_bp
from .updates import updates_bp

__all__ = [
    'auth_bp',
    'services_bp',
    'requests_bp',
    'upload_bp',
    'bookings_bp',
    'admin_bp',
    'contact_bp',
    'updates_bp',
]