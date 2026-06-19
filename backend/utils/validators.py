import re


def validate_email(email):
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not email or not re.match(pattern, email):
        return False, 'Invalid email address format'
    return True, None


def validate_password(password):
    """
    Validate password strength:
    - Minimum 8 characters
    - At least one uppercase
    - At least one lowercase
    - At least one digit
    """
    if not password or len(password) < 8:
        return False, 'Password must be at least 8 characters long'
    if not re.search(r'[A-Z]', password):
        return False, 'Password must contain at least one uppercase letter'
    if not re.search(r'[a-z]', password):
        return False, 'Password must contain at least one lowercase letter'
    if not re.search(r'\d', password):
        return False, 'Password must contain at least one digit'
    return True, None


def validate_phone(phone):
    """Validate phone number (10-15 digits, optionally with + prefix)."""
    if not phone:
        return True, None  # phone is optional
    pattern = r'^\+?[0-9]{10,15}$'
    if not re.match(pattern, phone):
        return False, 'Invalid phone number format'
    return True, None


def validate_required_fields(data, required_fields):
    """Check that all required fields are present and non-empty."""
    missing = []
    for field in required_fields:
        if field not in data or not str(data[field]).strip():
            missing.append(field)
    if missing:
        return False, f"Missing required fields: {', '.join(missing)}"
    return True, None
