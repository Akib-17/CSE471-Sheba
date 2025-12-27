from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import Config

try:
    from flask_cors import CORS
except Exception:
    CORS = None

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)

    # enable CORS if flask-cors is installedp
    if CORS is not None:
        # Allow all origins, all methods, and Content-Type + Authorization headers
        CORS(
            app,
            resources={r"/*": {"origins": "*"}},
            supports_credentials=True,
            allow_headers=["Content-Type", "Authorization"],
            methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
        )

    # ensure models are registered and tables exist whenever the app is created
    with app.app_context():
        try:
            from models import Review  # noqa: F401
        except Exception:
            pass
        db.create_all()

    from reviews.routes import reviews_bp
    app.register_blueprint(reviews_bp, url_prefix="/reviews")

    @app.route("/")
    def index():
        return "Module 2: Review & Rating System"

    return app

if __name__ == "__main__":
    app = create_app()
    # ensure database tables exist when running locally
    with app.app_context():
        try:
            from models import Review  # noqa: F401
        except Exception:
            pass
        db.create_all()

    # Run Flask app on port 5000
    app.run(debug=True, use_reloader=False, host="127.0.0.1", port=5000)
