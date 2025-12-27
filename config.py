
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "devkey")
    # Default to a local SQLite DB for easier local testing. Set DATABASE_URL
    # in your environment to override (e.g. a MySQL/Postgres URI).
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL",
        "sqlite:///data.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
