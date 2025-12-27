from app import create_app
from app import db
from models import Review

app = create_app()
with app.app_context():
    r = Review(user_id=1, provider_id=1, rating=5, comment='Test review')
    db.session.add(r)
    db.session.commit()
    print('added id', r.id)
