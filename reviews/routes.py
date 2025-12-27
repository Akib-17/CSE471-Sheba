
from flask import Blueprint, request, jsonify, render_template, current_app
import sqlite3
import os

reviews_bp = Blueprint("reviews", __name__, template_folder="../templates")


def _find_sqlite_path():
    uri = current_app.config.get('SQLALCHEMY_DATABASE_URI', '')
    candidates = []
    if uri and uri.startswith('sqlite:///'):
        candidates.append(uri.replace('sqlite:///', ''))
    candidates.append(os.path.join(current_app.instance_path, 'data.db'))
    candidates.append('data.db')
    for p in candidates:
        try:
            if not p:
                continue
            d = os.path.dirname(p)
            if d and not os.path.exists(d):
                try:
                    os.makedirs(d, exist_ok=True)
                except Exception:
                    pass
            if not os.path.exists(p):
                open(p, 'a').close()
            return p
        except Exception:
            continue
    return None


@reviews_bp.route("/add", methods=["POST"])
def add_review():
    print("✅ POST /reviews/add HIT")
    try:
        data = request.get_json(silent=True) or request.form.to_dict()
        if not data:
            return jsonify({"ok": False, "message": "No data provided"}), 400

        user_id = int(data.get('user_id', 0))
        provider_id = int(data.get('provider_id', 0))
        rating = int(data.get('rating', 0))
        comment = data.get('comment', '')

        if not (1 <= rating <= 5):
            return jsonify({"ok": False, "message": "Rating must be 1-5"}), 400

        dbpath = _find_sqlite_path()
        if not dbpath:
            return jsonify({"ok": False, "message": "No sqlite DB found"}), 500

        conn = sqlite3.connect(dbpath)
        cur = conn.cursor()
        
        # Ensure table exists
        cur.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                provider_id INTEGER NOT NULL,
                rating INTEGER NOT NULL,
                comment TEXT,
                created_at TEXT
            )
        """)
        conn.commit()
        
        cur.execute(
            "INSERT INTO reviews (user_id, provider_id, rating, comment, created_at) VALUES (?,?,?,?,datetime('now'))",
            (user_id, provider_id, rating, comment))
        conn.commit()
        last_id = cur.lastrowid
        conn.close()
        return jsonify({"ok": True, "message": "Review submitted", "id": last_id})
    except Exception as e:
        return jsonify({"ok": False, "message": f"Server error: {e}"}), 500


@reviews_bp.route("/provider/<int:provider_id>")
def provider_reviews(provider_id):
    try:
        dbpath = _find_sqlite_path()
        rows = []
        if dbpath and os.path.exists(dbpath):
            conn = sqlite3.connect(dbpath)
            cur = conn.cursor()
            # Ensure table exists
            cur.execute("""
                CREATE TABLE IF NOT EXISTS reviews (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    provider_id INTEGER NOT NULL,
                    rating INTEGER NOT NULL,
                    comment TEXT,
                    created_at TEXT
                )
            """)
            conn.commit()
            cur.execute(
                "SELECT id, user_id, provider_id, rating, comment, created_at FROM reviews WHERE provider_id=? ORDER BY created_at DESC",
                (provider_id,))
            rows = cur.fetchall()
            conn.close()

        reviews = []
        for r in rows:
            reviews.append(type('R', (), {
                'id': r[0],
                'user_id': r[1],
                'provider_id': r[2],
                'rating': r[3],
                'comment': r[4],
                'created_at': r[5]
            })())

        avg_rating = round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else 0
        return render_template('reviews.html', reviews=reviews, avg_rating=avg_rating, provider_id=provider_id)
    except Exception:
        return render_template('reviews.html', reviews=[], avg_rating=0, provider_id=provider_id)
