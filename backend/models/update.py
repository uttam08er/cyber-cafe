from extensions import db
from datetime import datetime, timezone
def utcnow():
    return datetime.now(timezone.utc)


class Update(db.Model):
    """Daily updates / notifications model."""
    __tablename__ = 'updates'

    CAT_GOVERNMENT  = 'Govt Forms'
    CAT_JOBS        = 'Jobs'
    CAT_ADMIT_CARD  = 'Admit Cards'
    CAT_RESULTS     = 'Results'
    CAT_SERVICES    = 'Services'
    CAT_NOTICE      = 'Impt Notice'
    ALL_CATEGORIES  = [CAT_GOVERNMENT, CAT_JOBS, CAT_ADMIT_CARD, CAT_RESULTS, CAT_SERVICES, CAT_NOTICE]

    id           = db.Column(db.Integer,     primary_key=True)
    title        = db.Column(db.String(200), nullable=False)
    description  = db.Column(db.Text,        nullable=False)
    category     = db.Column(db.String(50),  nullable=False, index=True)
    is_important = db.Column(db.Boolean,     default=False,  nullable=False, index=True)
    is_pinned    = db.Column(db.Boolean,     default=False,  nullable=False, index=True)
    is_active    = db.Column(db.Boolean,     default=True,   nullable=False, index=True)
    link         = db.Column(db.String(500), nullable=True)   
    expires_at   = db.Column(db.DateTime,    nullable=True)  
    created_at   = db.Column(db.DateTime,    default=utcnow, nullable=False)
    updated_at   = db.Column(db.DateTime,    default=utcnow, onupdate=utcnow, nullable=False)

    def is_new(self):
        """Returns True if posted within last 3 days."""
        delta = datetime.utcnow() - self.created_at
        return delta.days < 3

    def is_expired(self):
        """Returns True if update has passed its expiry date."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at

    def is_new(self):
        """True if posted within the last 3 days."""
        return (datetime.utcnow() - self.created_at).days < 3
 
    def is_expired(self):
        """True if the update has passed its expiry date."""
        if self.expires_at is None:
            return False
        return datetime.utcnow() > self.expires_at

    def to_dict(self):
        return {
            'id':           self.id,
            'title':        self.title,
            'description':  self.description,
            'category':     self.category,
            'is_important': self.is_important,
            'is_pinned':    self.is_pinned,
            'is_active':    self.is_active,
            'link':         self.link,
            'expires_at':   self.expires_at.isoformat() if self.expires_at else None,
            'is_new':       self.is_new(),
            'is_expired':   self.is_expired(),
            'created_at':   self.created_at.isoformat() if self.created_at else None,
            'updated_at':   self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f'<Update {self.id} {self.title!r}>'