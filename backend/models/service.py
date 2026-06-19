from extensions import db
from datetime import datetime, timezone


def utcnow():
    return datetime.now(timezone.utc)


class Service(db.Model):
    """Service model — represents cyber café services like printing, scanning, etc."""
    __tablename__ = 'services'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=False, default=0.0)
    price_unit = db.Column(db.String(30), default='per page')
    category = db.Column(db.String(50), nullable=True)
    icon = db.Column(db.String(50), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    requires_upload = db.Column(db.Boolean, default=False)
    turnaround_time = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=utcnow)
    updated_at = db.Column(db.DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    requests = db.relationship('Request', backref='service', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'slug': self.slug,
            'description': self.description,
            'price': float(self.price) if self.price is not None else 0.0,
            'price_unit': self.price_unit,
            'category': self.category,
            'icon': self.icon,
            'is_active': self.is_active,
            'requires_upload': self.requires_upload,
            'turnaround_time': self.turnaround_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f'<Service {self.name}>'
