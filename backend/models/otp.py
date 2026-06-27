from extensions import db
from datetime import datetime


class OTP(db.Model):
    """
    Stores one-time passwords for password reset.
    Each record is tied to an email address.
    A new OTP always invalidates any previous OTP for the same email.
    """
    __tablename__ = 'otps'

    id         = db.Column(db.Integer,     primary_key=True)
    email      = db.Column(db.String(150), nullable=False, index=True)
    code       = db.Column(db.String(6),   nullable=False)        
    is_used    = db.Column(db.Boolean,     nullable=False, default=False)
    expires_at = db.Column(db.DateTime,    nullable=False)      
    created_at = db.Column(db.DateTime,    nullable=False, default=datetime.utcnow)

    def is_valid(self):
        """Return True if OTP is not used and not expired."""
        return not self.is_used and datetime.utcnow() < self.expires_at

    def to_dict(self):
        return {
            'id':         self.id,
            'email':      self.email,
            'is_used':    self.is_used,
            'expires_at': self.expires_at.isoformat(),
            'created_at': self.created_at.isoformat(),
        }

    def __repr__(self):
        return f'<OTP email={self.email} used={self.is_used}>'
