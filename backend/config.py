import os
from pathlib import Path

basedir = Path(__file__).resolve().parent

class Config:
    # Existing config
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + str(basedir / 'instance' / 'app.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-dev-secret'
    # Mail configuration (Gmail SMTP for demo)
    MAIL_SERVER = os.environ.get('MAIL_SERVER') or 'smtp.gmail.com'
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 587)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') == 'True' or True
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME') or 'aninda.sarkar11@gmail.com'
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD') or '8116577977739828'
    MAIL_DEFAULT_SENDER = os.environ.get('MAIL_DEFAULT_SENDER') or 'aninda.sarkar11@gmail.com'
    MAIL_USER_SENDER = os.environ.get('MAIL_USER_SENDER') or '"ServiceHub Users" <aninda.sarkar11@gmail.com>'
    MAIL_PROVIDER_SENDER = os.environ.get('MAIL_PROVIDER_SENDER') or '"ServiceHub Providers" <aninda.sarkar11@gmail.com>'