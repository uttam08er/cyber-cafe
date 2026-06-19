from extensions import db
from datetime import datetime, timezone


def utcnow():
    return datetime.now(timezone.utc)


class BookingSettings(db.Model):
    __tablename__ = 'booking_settings'

    id              = db.Column(db.Integer, primary_key=True)
    max_computers   = db.Column(db.Integer,  nullable=False, default=10)
    price_per_hour  = db.Column(db.Numeric(10, 2), nullable=False, default=30.0)
    opening_hour    = db.Column(db.Integer,  nullable=False, default=8)   # 0-23
    closing_hour    = db.Column(db.Integer,  nullable=False, default=22)  # 0-23
    max_hours_per_booking = db.Column(db.Integer, nullable=False, default=4)
    updated_at      = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    def to_dict(self):
        return {
            'max_computers':        self.max_computers,
            'price_per_hour':       float(self.price_per_hour),
            'opening_hour':         self.opening_hour,
            'closing_hour':         self.closing_hour,
            'max_hours_per_booking': self.max_hours_per_booking,
            'updated_at':           self.updated_at.isoformat() if self.updated_at else None,
        }

    @classmethod
    def get(cls):
        """Always returns the single settings row, creating it if absent."""
        settings = cls.query.get(1)
        if not settings:
            settings = cls(id=1)
            db.session.add(settings)
            db.session.commit()
        return settings