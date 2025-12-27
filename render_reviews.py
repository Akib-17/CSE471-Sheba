from app import create_app
from models import Review
from flask import render_template
app = create_app()
with app.app_context():
    reviews = Review.query.filter_by(provider_id=1).all()
    html = render_template('reviews.html', reviews=reviews, avg_rating=round(sum(r.rating for r in reviews)/len(reviews),2) if reviews else 0, provider_id=1)
    with open('rendered_reviews.html','w', encoding='utf-8') as f:
        f.write(html)
    print('WROTE rendered_reviews.html')
