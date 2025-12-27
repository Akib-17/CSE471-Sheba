"""
init_db.py - Database Initialization Script
Run this file to create database tables and populate with sample data

Usage: python init_db.py
"""

from datetime import datetime, timedelta
import sys
import os

# Add the current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import Flask app and database
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Create Flask app instance
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local_service.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

# Initialize database
db = SQLAlchemy(app)

# Define Models
class ServiceProvider(db.Model):
    __tablename__ = 'service_providers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    phone = db.Column(db.String(20))
    service_type = db.Column(db.String(50))
    rating = db.Column(db.Float, default=0.0)
    total_bookings = db.Column(db.Integer, default=0)
    is_premium = db.Column(db.Boolean, default=False)
    location = db.Column(db.String(200))
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Promotion(db.Model):
    __tablename__ = 'promotions'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.id'))
    promotion_type = db.Column(db.String(50))
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')
    price = db.Column(db.Float)
    impressions = db.Column(db.Integer, default=0)
    clicks = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    provider = db.relationship('ServiceProvider', backref='promotions')

class Booking(db.Model):
    __tablename__ = 'bookings'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.id'))
    user_id = db.Column(db.Integer)
    service_type = db.Column(db.String(50))
    amount = db.Column(db.Float)
    status = db.Column(db.String(20))
    booking_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    provider = db.relationship('ServiceProvider', backref='bookings')

class Admin(db.Model):
    __tablename__ = 'admins'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


def init_database():
    """Initialize database with tables and sample data"""
    
    print("\n" + "="*60)
    print("🚀 Starting Database Initialization...")
    print("="*60 + "\n")
    
    with app.app_context():
        # Drop all existing tables (fresh start)
        print("🗑️  Dropping existing tables (if any)...")
        db.drop_all()
        print("✅ Old tables dropped successfully!\n")
        
        # Create all tables
        print("📊 Creating new database tables...")
        db.create_all()
        print("✅ Database tables created successfully!\n")
        
        # Add sample service providers
        print("👥 Adding sample service providers...")
        providers = [
            ServiceProvider(
                name='Quick Fix Plumbing',
                email='quickfix@email.com',
                phone='01712345678',
                service_type='Plumber',
                rating=4.8,
                total_bookings=156,
                is_premium=True,
                location='Dhanmondi, Dhaka',
                description='Professional plumbing services with 10+ years experience'
            ),
            ServiceProvider(
                name='Pro Electrical Works',
                email='proelectric@email.com',
                phone='01812345678',
                service_type='Electrician',
                rating=4.7,
                total_bookings=142,
                is_premium=True,
                location='Gulshan, Dhaka',
                description='Expert electrical installations and repairs'
            ),
            ServiceProvider(
                name='Cool Air AC Services',
                email='coolair@email.com',
                phone='01912345678',
                service_type='AC Repair',
                rating=4.6,
                total_bookings=128,
                is_premium=True,
                location='Banani, Dhaka',
                description='AC installation, servicing and repair specialists'
            ),
            ServiceProvider(
                name='Master Carpenter',
                email='mastercarpenter@email.com',
                phone='01612345678',
                service_type='Carpenter',
                rating=4.5,
                total_bookings=98,
                is_premium=True,
                location='Mirpur, Dhaka',
                description='Custom furniture and carpentry work'
            ),
            ServiceProvider(
                name='Elite Barber Shop',
                email='elitebarber@email.com',
                phone='01512345678',
                service_type='Barber',
                rating=4.9,
                total_bookings=187,
                is_premium=True,
                location='Uttara, Dhaka',
                description='Premium grooming and styling services'
            )
        ]
        
        for provider in providers:
            db.session.add(provider)
        
        db.session.commit()
        print(f"✅ Added {len(providers)} service providers!\n")
        
        # Add sample promotions
        print("📢 Adding sample promotions...")
        promotions = [
            Promotion(
                provider_id=1,
                promotion_type='featured',
                title='Winter Plumbing Special',
                description='Get 20% off on all plumbing services this winter season',
                start_date=datetime(2025, 11, 1),
                end_date=datetime(2025, 12, 31),
                status='active',
                price=5000.00,
                impressions=1250,
                clicks=89
            ),
            Promotion(
                provider_id=2,
                promotion_type='banner',
                title='Expert Electrical Solutions',
                description='Professional electrical services at your doorstep',
                start_date=datetime(2025, 11, 10),
                end_date=datetime(2025, 11, 30),
                status='active',
                price=3000.00,
                impressions=890,
                clicks=45
            ),
            Promotion(
                provider_id=3,
                promotion_type='featured',
                title='AC Maintenance Package',
                description='Complete AC servicing and maintenance at discounted rates',
                start_date=datetime(2025, 11, 15),
                end_date=datetime(2025, 12, 15),
                status='active',
                price=4000.00,
                impressions=567,
                clicks=34
            ),
            Promotion(
                provider_id=4,
                promotion_type='banner',
                title='Custom Furniture Deals',
                description='Special discounts on custom furniture and woodwork',
                start_date=datetime(2025, 10, 1),
                end_date=datetime(2025, 10, 31),
                status='expired',
                price=2500.00,
                impressions=450,
                clicks=28
            ),
            Promotion(
                provider_id=5,
                promotion_type='featured',
                title='Premium Grooming Services',
                description='VIP grooming packages now available',
                start_date=datetime(2025, 11, 20),
                end_date=datetime(2025, 12, 20),
                status='pending',
                price=2000.00,
                impressions=0,
                clicks=0
            )
        ]
        
        for promotion in promotions:
            db.session.add(promotion)
        
        db.session.commit()
        print(f"✅ Added {len(promotions)} promotions!\n")
        
        # Add sample bookings
        print("📅 Adding sample bookings...")
        bookings = [
            Booking(
                provider_id=1,
                user_id=101,
                service_type='Plumber',
                amount=1500.00,
                status='completed',
                booking_date=datetime(2025, 11, 1, 10, 30)
            ),
            Booking(
                provider_id=1,
                user_id=102,
                service_type='Plumber',
                amount=2500.00,
                status='completed',
                booking_date=datetime(2025, 11, 5, 9, 15)
            ),
            Booking(
                provider_id=2,
                user_id=103,
                service_type='Electrician',
                amount=3000.00,
                status='completed',
                booking_date=datetime(2025, 11, 3, 14, 20)
            ),
            Booking(
                provider_id=3,
                user_id=104,
                service_type='AC Repair',
                amount=4000.00,
                status='completed',
                booking_date=datetime(2025, 11, 7, 11, 0)
            ),
            Booking(
                provider_id=4,
                user_id=105,
                service_type='Carpenter',
                amount=5500.00,
                status='completed',
                booking_date=datetime(2025, 11, 10, 16, 45)
            ),
            Booking(
                provider_id=5,
                user_id=106,
                service_type='Barber',
                amount=800.00,
                status='completed',
                booking_date=datetime(2025, 11, 12, 13, 30)
            ),
            Booking(
                provider_id=1,
                user_id=107,
                service_type='Plumber',
                amount=1800.00,
                status='pending',
                booking_date=datetime(2025, 11, 20, 8, 0)
            ),
            Booking(
                provider_id=2,
                user_id=108,
                service_type='Electrician',
                amount=2200.00,
                status='confirmed',
                booking_date=datetime(2025, 11, 21, 10, 0)
            ),
            # Add more recent bookings for better revenue trends
            Booking(
                provider_id=3,
                user_id=109,
                service_type='AC Repair',
                amount=3500.00,
                status='completed',
                booking_date=datetime.utcnow() - timedelta(days=5)
            ),
            Booking(
                provider_id=4,
                user_id=110,
                service_type='Carpenter',
                amount=4200.00,
                status='completed',
                booking_date=datetime.utcnow() - timedelta(days=3)
            ),
            Booking(
                provider_id=5,
                user_id=111,
                service_type='Barber',
                amount=1200.00,
                status='completed',
                booking_date=datetime.utcnow() - timedelta(days=1)
            )
        ]
        
        for booking in bookings:
            db.session.add(booking)
        
        db.session.commit()
        print(f"✅ Added {len(bookings)} bookings!\n")
        
        # Add admin user
        print("👤 Creating admin user...")
        admin = Admin(
            username='admin',
            email='admin@localservice.com',
            password_hash='admin123'  # In production, use proper password hashing!
        )
        
        db.session.add(admin)
        db.session.commit()
        print("✅ Admin user created!\n")
        
        # Print summary
        print("="*60)
        print("🎉 Database Initialization Complete!")
        print("="*60)
        print("\n📊 Summary:")
        print(f"   ✓ {len(providers)} Service Providers")
        print(f"   ✓ {len(promotions)} Promotions")
        print(f"   ✓ {len(bookings)} Bookings")
        print(f"   ✓ 1 Admin User")
        print("\n📁 Database File:")
        print(f"   Location: {os.path.abspath('local_service.db')}")
        print("\n🔐 Admin Credentials:")
        print("   Username: admin")
        print("   Password: admin123")
        print("\n🚀 Next Steps:")
        print("   1. Run: python app.py")
        print("   2. Visit: http://localhost:5000/admin/promotions")
        print("   3. Or visit: http://localhost:5000/admin/analytics")
        print("\n💡 Tips:")
        print("   - To reset database: Delete local_service.db and run this script again")
        print("   - Use DB Browser for SQLite to view/edit data")
        print("   - Backup: Just copy local_service.db file")
        print("="*60 + "\n")


if __name__ == '__main__':
    try:
        init_database()
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\nTroubleshooting:")
        print("1. Make sure Flask and Flask-SQLAlchemy are installed")
        print("2. Check if local_service.db is not open in another program")
        print("3. Run: pip install Flask Flask-SQLAlchemy")
        sys.exit(1)
