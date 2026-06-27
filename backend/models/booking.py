from extensions import db
from datetime import datetime, timezone


def utcnow():
    return datetime.now(timezone.utc)


class Booking(db.Model):
    """Computer slot booking model."""
    __tablename__ = 'bookings'

    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_COMPLETED = 'completed'
    STATUS_NO_SHOW = 'no_show'
    STATUS_PAID = True

    id = db.Column(db.Integer, primary_key=True)
    booking_number = db.Column(db.String(20), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    computer_number = db.Column(db.Integer, nullable=True)
    booking_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    duration_hours = db.Column(db.Numeric(5, 2), nullable=False)

    price_per_hour = db.Column(db.Numeric(10, 2), default=30.0)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)

    status = db.Column(db.String(20), default=STATUS_CONFIRMED)
    purpose = db.Column(db.String(200), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    is_paid = db.Column(db.Boolean, default=False, nullable=False)

    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    def to_dict(self, include_user=False):
        data = {
            'id': self.id,
            'booking_number': self.booking_number,
            'user_id': self.user_id,
            'computer_number': self.computer_number,
            'booking_date': self.booking_date.isoformat() if self.booking_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'duration_hours': float(self.duration_hours) if self.duration_hours is not None else None,
            'price_per_hour': float(self.price_per_hour) if self.price_per_hour is not None else None,
            'total_price': float(self.total_price) if self.total_price is not None else None,
            'status': self.status,
            'purpose': self.purpose,
            'notes': self.notes,
            'is_paid': self.is_paid,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_user and self.user:
            data['user'] = self.user.to_dict()
        return data

    def __repr__(self):
        return f'<Booking {self.booking_number}>'
