from extensions import db
from datetime import datetime, timezone


def utcnow():
    return datetime.now(timezone.utc)


class Request(db.Model):
    """Service request model — tracks user service requests."""
    __tablename__ = 'requests'

    STATUS_PENDING = 'pending'
    STATUS_PROCESSING = 'processing'
    STATUS_COMPLETED = 'completed'
    STATUS_REJECTED = 'rejected'
    STATUS_CANCELLED = 'cancelled'

    VALID_STATUSES = [STATUS_PENDING, STATUS_PROCESSING, STATUS_COMPLETED, STATUS_REJECTED, STATUS_CANCELLED]

    FILE_BY_USER  = 'user'
    FILE_BY_ADMIN = 'admin'

    id = db.Column(db.Integer, primary_key=True)
    request_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id', ondelete='RESTRICT'), nullable=False)
    status = db.Column(db.String(20), default=STATUS_PENDING, nullable=False)

    notes = db.Column(db.Text, nullable=True)
    quantity = db.Column(db.Integer, default=1)
    total_price = db.Column(db.Numeric(10, 2), nullable=True)

    file_name = db.Column(db.String(255), nullable=True)
    file_path = db.Column(db.String(500), nullable=True)
    file_size = db.Column(db.BigInteger, nullable=True)  
    file_type = db.Column(db.String(50), nullable=True)
    file_uploaded_by = db.Column(db.String(10),  nullable=True) 


    admin_notes = db.Column(db.Text, nullable=True)
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)

    payment_status = db.Column(db.String(20), default='unpaid')
    payment_id = db.Column(db.String(100), nullable=True)

    created_at = db.Column(db.DateTime(timezone=True), default=utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    processor = db.relationship('User', foreign_keys=[processed_by])

    def to_dict(self, include_user=False, include_service=False):
        data = {
            'id': self.id,
            'request_number': self.request_number,
            'user_id': self.user_id,
            'service_id': self.service_id,
            'status': self.status,
            'notes': self.notes,
            'quantity': self.quantity,
            'total_price': float(self.total_price) if self.total_price is not None else None,
            'file_name': self.file_name,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'file_type': self.file_type,
            'file_uploaded_by': self.file_uploaded_by,  
            'admin_notes': self.admin_notes,
            'payment_status': self.payment_status,
            'payment_id': self.payment_id,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_user and self.user:
            data['user'] = self.user.to_dict()
        if include_service and self.service:
            data['service'] = self.service.to_dict()
        return data

    def __repr__(self):
        return f'<Request {self.request_number}>'
