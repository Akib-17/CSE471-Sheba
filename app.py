from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
from sqlalchemy import func, desc
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///local_service.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

db = SQLAlchemy(app)

# Models
class ServiceProvider(db.Model):
    __tablename__ = 'service_providers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    service_type = db.Column(db.String(50))
    rating = db.Column(db.Float, default=0.0)
    total_bookings = db.Column(db.Integer, default=0)
    is_premium = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Promotion(db.Model):
    __tablename__ = 'promotions'
    id = db.Column(db.Integer, primary_key=True)
    provider_id = db.Column(db.Integer, db.ForeignKey('service_providers.id'))
    promotion_type = db.Column(db.String(50))  # 'featured', 'banner'
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    start_date = db.Column(db.DateTime, nullable=False)
    end_date = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, active, expired
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
    
    def set_password(self, password):
        """Hash and set the password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check if the provided password matches the hash"""
        return check_password_hash(self.password_hash, password)

# Root route
@app.route('/')
def index():
    """Home page - redirect to admin login"""
    return redirect(url_for('admin_login'))

# Admin login route
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    """Admin login page"""
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            return render_template('admin_login.html', error='Please provide both email and password')
        
        # Check admin in database
        admin = Admin.query.filter_by(email=email).first()
        
        if admin and admin.check_password(password):
            session['admin_id'] = admin.id
            session['admin_email'] = admin.email
            return redirect(url_for('promotions_dashboard'))
        else:
            return render_template('admin_login.html', error='Invalid email or password')
    
    # If already logged in, redirect to dashboard
    if 'admin_id' in session:
        return redirect(url_for('promotions_dashboard'))
    
    return render_template('admin_login.html')

# Admin logout route
@app.route('/admin/logout')
def admin_logout():
    """Admin logout"""
    session.pop('admin_id', None)
    return redirect(url_for('admin_login'))

# Routes for Promotion Management
@app.route('/admin/promotions')
def promotions_dashboard():
    """Display promotion management dashboard"""
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))
    
    promotions = Promotion.query.order_by(desc(Promotion.created_at)).all()
    return render_template('promotion.html', promotions=promotions)

@app.route('/admin/promotions/create', methods=['GET', 'POST'])
def create_promotion():
    """Create new promotion for service provider"""
    if request.method == 'POST':
        if 'admin_id' not in session:
            return jsonify({'success': False, 'message': 'Unauthorized'}), 401
        
        data = request.json
        
        try:
            promotion = Promotion(
                provider_id=int(data['provider_id']),
                promotion_type=data['promotion_type'],
                title=data['title'],
                description=data['description'],
                start_date=datetime.strptime(data['start_date'], '%Y-%m-%d'),
                end_date=datetime.strptime(data['end_date'], '%Y-%m-%d'),
                price=float(data['price']),
                status='active'
            )
            
            db.session.add(promotion)
            db.session.commit()
            
            return jsonify({
                'success': True, 
                'message': 'Promotion created successfully',
                'promotion': {
                    'id': promotion.id,
                    'provider_id': promotion.provider_id,
                    'provider_name': promotion.provider.name if promotion.provider else 'Unknown',
                    'promotion_type': promotion.promotion_type,
                    'title': promotion.title,
                    'description': promotion.description,
                    'start_date': promotion.start_date.strftime('%Y-%m-%d'),
                    'end_date': promotion.end_date.strftime('%Y-%m-%d'),
                    'status': promotion.status,
                    'price': promotion.price,
                    'impressions': promotion.impressions,
                    'clicks': promotion.clicks
                }
            })
        except Exception as e:
            db.session.rollback()
            return jsonify({'success': False, 'message': f'Error creating promotion: {str(e)}'}), 400
    
    providers = ServiceProvider.query.filter_by(is_premium=True).all()
    return render_template('promotion.html', providers=providers)

@app.route('/admin/promotions/list')
def list_promotions():
    """Get all promotions as JSON"""
    if 'admin_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    promotions = Promotion.query.order_by(desc(Promotion.created_at)).all()
    
    return jsonify({
        'success': True,
        'promotions': [
            {
                'id': p.id,
                'provider_id': p.provider_id,
                'provider_name': p.provider.name if p.provider else 'Unknown',
                'promotion_type': p.promotion_type,
                'title': p.title,
                'description': p.description,
                'start_date': p.start_date.strftime('%Y-%m-%d'),
                'end_date': p.end_date.strftime('%Y-%m-%d'),
                'status': p.status,
                'price': p.price,
                'impressions': p.impressions,
                'clicks': p.clicks,
                'created_at': p.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } for p in promotions
        ]
    })

@app.route('/admin/providers/list')
def list_providers():
    """Get all providers as JSON for dropdown"""
    if 'admin_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    providers = ServiceProvider.query.all()
    
    return jsonify({
        'success': True,
        'providers': [
            {
                'id': p.id,
                'name': p.name,
                'email': p.email,
                'service_type': p.service_type,
                'is_premium': p.is_premium
            } for p in providers
        ]
    })

@app.route('/admin/promotions/<int:id>/update', methods=['PUT'])
def update_promotion(id):
    """Update promotion status"""
    promotion = Promotion.query.get_or_404(id)
    data = request.json
    
    if 'status' in data:
        promotion.status = data['status']
    
    db.session.commit()
    return jsonify({'success': True, 'message': 'Promotion updated'})

@app.route('/admin/promotions/<int:id>/delete', methods=['DELETE'])
def delete_promotion(id):
    """Delete promotion"""
    if 'admin_id' not in session:
        return jsonify({'success': False, 'message': 'Unauthorized'}), 401
    
    promotion = Promotion.query.get_or_404(id)
    db.session.delete(promotion)
    db.session.commit()
    return jsonify({'success': True, 'message': 'Promotion deleted'})

# Routes for Analytics & Reports
@app.route('/admin/analytics')
def analytics_dashboard():
    """Main analytics dashboard"""
    if 'admin_id' not in session:
        return redirect(url_for('admin_login'))
    
    return render_template('analytics.html')

@app.route('/admin/analytics/data')
def get_analytics_data():
    """Get analytics data for dashboard"""
    
    # Most booked services
    most_booked = db.session.query(
        Booking.service_type,
        func.count(Booking.id).label('count')
    ).group_by(Booking.service_type).order_by(desc('count')).limit(10).all()
    
    # Top rated providers
    top_providers = ServiceProvider.query.order_by(
        desc(ServiceProvider.rating)
    ).limit(10).all()
    
    # Revenue trends (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    revenue_data = db.session.query(
        func.date(Booking.booking_date).label('date'),
        func.sum(Booking.amount).label('revenue')
    ).filter(
        Booking.booking_date >= thirty_days_ago
    ).group_by(func.date(Booking.booking_date)).all()
    
    # Total statistics
    total_bookings = Booking.query.count()
    total_revenue = db.session.query(func.sum(Booking.amount)).scalar() or 0
    total_providers = ServiceProvider.query.count()
    active_promotions = Promotion.query.filter_by(status='active').count()
    
    return jsonify({
        'most_booked_services': [
            {'service': item[0], 'count': item[1]} for item in most_booked
        ],
        'top_providers': [
            {
                'id': p.id,
                'name': p.name,
                'rating': p.rating,
                'bookings': p.total_bookings,
                'service_type': p.service_type
            } for p in top_providers
        ],
        'revenue_trends': [
            {'date': str(item[0]), 'revenue': float(item[1])} for item in revenue_data
        ],
        'statistics': {
            'total_bookings': total_bookings,
            'total_revenue': float(total_revenue),
            'total_providers': total_providers,
            'active_promotions': active_promotions
        }
    })

@app.route('/admin/analytics/export')
def export_report():
    """Export analytics report as JSON"""
    data = get_analytics_data().json
    return jsonify(data)

# Create database tables and initialize default admin
with app.app_context():
    db.create_all()
    
    # Create default admin if it doesn't exist
    admin = Admin.query.filter_by(email='admin@localservice.com').first()
    if not admin:
        default_admin = Admin(
            username='admin',
            email='admin@localservice.com'
        )
        default_admin.set_password('admin123')
        db.session.add(default_admin)
        db.session.commit()
        print("Default admin created: admin@localservice.com / admin123")
    
    # Create default service providers if they don't exist
    providers_data = [
        {
            'name': 'ABC Plumbing',
            'email': 'abc.plumbing@localservice.com',
            'service_type': 'Plumber',
            'is_premium': True
        },
        {
            'name': 'BRACU Barber',
            'email': 'bracu.barber@localservice.com',
            'service_type': 'Barber',
            'is_premium': True
        },
        {
            'name': 'Badda Electronics',
            'email': 'badda.electronics@localservice.com',
            'service_type': 'Electrician',
            'is_premium': True
        }
    ]
    
    for provider_data in providers_data:
        # Check if provider exists by name
        existing_provider = ServiceProvider.query.filter_by(name=provider_data['name']).first()
        if not existing_provider:
            provider = ServiceProvider(
                name=provider_data['name'],
                email=provider_data['email'],
                service_type=provider_data['service_type'],
                is_premium=provider_data['is_premium'],
                rating=4.5,
                total_bookings=0
            )
            db.session.add(provider)
            print(f"Created provider: {provider_data['name']}")
    
    db.session.commit()

if __name__ == '__main__':
    app.run(debug=True)