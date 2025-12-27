from app import create_app
from app import db
from models import Review

app = create_app()
with app.app_context():
    print('DB URI:', app.config['SQLALCHEMY_DATABASE_URI'])
    reviews = Review.query.all()
    print('REVIEW COUNT:', len(reviews))
    for r in reviews:
        print(r.id, r.provider_id, r.rating, r.comment)
