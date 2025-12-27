from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class ServiceProvider(db.Model):
    __tablename__ = 'service_providers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    service_type = db.Column(db.String(50))
    rating = db.Column(db.Float, default=0.0)
    total_bookings = db.Column(db.Integer, default=0)
    is_premium = db.Column(db.Boolean, default=False)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'service_type': self.service_type,
            'rating': self.rating,
            'total_bookings': self.total_bookings,
            'is_premium': self.is_premium
        }


class Promotion(db.Model):
    __tablename__ = 'promotions'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.id'), nullable=False)
    promotion_type = db.Column(db.String(50), nullable=False)  # 'featured' or 'banner'
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, active, expired
    price = db.Column(db.Float, nullable=False)
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    provider = db.relationship('ServiceProvider', backref='promotions')
    
    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'provider_name': self.provider.name,
            'promotion_type': self.promotion_type,
            'title': self.title,
            'description': self.description,
            'start_date': self.start_date.strftime('%Y-%m-%d'),
            'end_date': self.end_date.strftime('%Y-%m-%d'),
            'status': self.status,
            'price': self.price,
            'impressions': self.impressions,
            'clicks': self.clicks
        }


class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.id'), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    service_type = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    service_date = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    
    provider = db.relationship('ServiceProvider', backref='bookings')
    
    def to_dict(self):
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'user_id': self.user_id,
            'service_type': self.service_type,
            'amount': self.amount,
            'status': self.status,
            'booking_date': self.booking_date.strftime('%Y-%m-%d %H:%M:%S')
        }


class Admin(db.Model):
    __tablename__ = 'admins'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)