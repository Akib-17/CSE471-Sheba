from . import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    # Added email field for notifications (optional)
    email = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Profile fields
    role = db.Column(db.String(20), default='user')  # 'user' or 'provider'
    name = db.Column(db.String(200), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    skills = db.Column(db.Text, nullable=True)  # comma-separated list
    service_area = db.Column(db.String(200), nullable=True)
    profile_photo = db.Column(db.String(500), nullable=True)  # URL to photo
    # Partner-specific fields
    nid = db.Column(db.String(50), nullable=True)
    partner_category = db.Column(db.String(100), nullable=True)
    partner_locations = db.Column(db.Text, nullable=True)  # comma-separated, up to 3
    fee_min = db.Column(db.Integer, nullable=True)
    fee_max = db.Column(db.Integer, nullable=True)
    provider_unique_id = db.Column(db.String(50), unique=True, nullable=True)  # e.g., PROV-001
    
    # Premium Membership fields
    is_premium = db.Column(db.Boolean, default=False)
    subscription_expiry = db.Column(db.DateTime, nullable=True)

    # Rating fields
    rating_average = db.Column(db.Float, default=0.0)
    rating_count = db.Column(db.Integer, default=0)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        skills = self.skills.split(',') if self.skills else []
        partner_locations = self.partner_locations.split(',') if self.partner_locations else []
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'created_at': self.created_at.isoformat(),
            'role': self.role,
            'location': self.location,
            'skills': skills,
            'service_area': self.service_area,
            'profile_photo': self.profile_photo,
            'nid': self.nid,
            'partner_category': self.partner_category,
            'partner_locations': partner_locations,
            'fee_min': self.fee_min,
            'fee_max': self.fee_max,
            'provider_unique_id': self.provider_unique_id,
            'is_premium': self.is_premium,
            'is_premium': self.is_premium,
            'subscription_expiry': self.subscription_expiry.isoformat() if self.subscription_expiry else None,
            'rating_average': self.rating_average,
            'rating_count': self.rating_count,
        }

class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, accepted, rejected, completed
    rating = db.Column(db.Integer, nullable=True)
    review = db.Column(db.Text, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('service_requests', lazy=True))
    provider = db.relationship('User', foreign_keys=[provider_id], backref=db.backref('assigned_requests', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'provider_id': self.provider_id,
            'provider_unique_id': self.provider.provider_unique_id if self.provider else None,
            'category': self.category,
            'description': self.description,
            'status': self.status,
            'rating': self.rating,
            'review': self.review,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat()
        }

class Notification(db.Model):
    __tablename__ = 'notification'
    id = db.Column(db.Integer, primary_key=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    recipient = db.relationship('User', backref=db.backref('notifications', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'recipient_id': self.recipient_id,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat()
        }

class Item(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }


class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    provider = db.relationship('User', backref=db.backref('services', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'provider_username': self.provider.username if self.provider else None,
            'provider_unique_id': self.provider.provider_unique_id if self.provider else None,
            'title': self.title,
            'category': self.category,
            'description': self.description,
            'price': self.price,
            'created_at': self.created_at.isoformat()
        }


class Complaint(db.Model):
    __tablename__ = 'complaint'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)  # Optional - if complaint is about a provider
    service_request_id = db.Column(db.Integer, db.ForeignKey('service_request.id'), nullable=True)  # Optional - link to service request
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, reviewed, resolved
    admin_response = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = db.relationship('User', foreign_keys=[user_id], backref=db.backref('complaints', lazy=True))
    provider = db.relationship('User', foreign_keys=[provider_id], backref=db.backref('complaints_against', lazy=True))
    service_request = db.relationship('ServiceRequest', backref=db.backref('complaints', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'user_username': self.user.username if self.user else None,
            'provider_id': self.provider_id,
            'provider_username': self.provider.username if self.provider else None,
            'provider_unique_id': self.provider.provider_unique_id if self.provider else None,
            'service_request_id': self.service_request_id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'admin_response': self.admin_response,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Warning(db.Model):
    __tablename__ = 'warning'
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaint.id'), nullable=False)
    provider_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    admin_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    complaint = db.relationship('Complaint', backref=db.backref('warnings', lazy=True))
    provider = db.relationship('User', foreign_keys=[provider_id], backref=db.backref('warnings_received', lazy=True))
    admin = db.relationship('User', foreign_keys=[admin_id])

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'complaint_title': self.complaint.title if self.complaint else None,
            'provider_id': self.provider_id,
            'provider_username': self.provider.username if self.provider else None,
            'admin_id': self.admin_id,
            'admin_username': self.admin.username if self.admin else None,
            'message': self.message,
            'created_at': self.created_at.isoformat()
        }

class ChatMessage(db.Model):
    __tablename__ = 'chat_message'
    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaint.id'), nullable=True)
    service_request_id = db.Column(db.Integer, db.ForeignKey('service_request.id'), nullable=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    complaint = db.relationship('Complaint', backref=db.backref('messages', lazy=True, cascade="all, delete-orphan"))
    service_request = db.relationship('ServiceRequest', backref=db.backref('messages', lazy=True, cascade="all, delete-orphan"))
    sender = db.relationship('User', foreign_keys=[sender_id])

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'service_request_id': self.service_request_id,
            'sender_id': self.sender_id,
            'sender_username': self.sender.username if self.sender else 'Unknown',
            'sender_role': self.sender.role if self.sender else 'unknown',
            'message': self.message,
            'created_at': self.created_at.isoformat()
        }
