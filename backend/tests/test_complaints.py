import pytest
from app import create_app, db
from app.models import User, Complaint, Warning


@pytest.fixture
def app():
    app = create_app('config.Config')
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI='sqlite:///:memory:',
        SECRET_KEY='test-secret',
    )
    with app.app_context():
        db.create_all()
        # seed users - use different usernames than demo data
        u = User(username='test_user', role='user')
        u.set_password('pw')
        p = User(username='test_provider', role='provider', partner_category='electrician', provider_unique_id='PROV-001')
        p.set_password('pw')
        admin = User(username='test_admin', role='admin')
        admin.set_password('admin123')
        db.session.add_all([u, p, admin])
        db.session.commit()
    yield app
    with app.app_context():
        db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


def login(client, username, password):
    return client.post('/api/v1/auth/login', json={'username': username, 'password': password})


def test_user_can_create_complaint_with_provider_unique_id(client, app):
    login(client, 'test_user', 'pw')
    res = client.post('/api/v1/complaints', json={
        'title': 'Bad service',
        'description': 'late and rude',
        'provider_unique_id': 'PROV-001'
    })
    assert res.status_code == 201
    data = res.get_json()
    assert data['provider_unique_id'] == 'PROV-001'


def test_admin_can_reply_and_warn_provider(client, app):
    # user creates complaint
    login(client, 'test_user', 'pw')
    res = client.post('/api/v1/complaints', json={
        'title': 'Bad service',
        'description': 'late and rude',
        'provider_unique_id': 'PROV-001'
    })
    cid = res.get_json()['id']

    # admin replies
    login(client, 'test_admin', 'admin123')
    res2 = client.post(f'/api/v1/complaints/{cid}/reply', json={'response': 'We are looking into it'})
    assert res2.status_code == 200
    assert res2.get_json()['status'] == 'reviewed'

    # admin warns provider
    res3 = client.post(f'/api/v1/complaints/{cid}/warn_provider', json={'message': 'Please improve or risk suspension'})
    assert res3.status_code == 201
    warning = res3.get_json()
    assert warning['provider_id'] is not None


def test_provider_can_list_warnings(client, app):
    # prepare warning
    with app.app_context():
        # Get actual user IDs from the test database
        test_user = User.query.filter_by(username='test_user').first()
        test_provider = User.query.filter_by(username='test_provider').first()
        test_admin = User.query.filter_by(username='test_admin').first()

        c = Complaint(user_id=test_user.id, provider_id=test_provider.id, title='x', description='y')
        db.session.add(c)
        db.session.commit()
        w = Warning(complaint_id=c.id, provider_id=test_provider.id, admin_id=test_admin.id, message='m')
        db.session.add(w)
        db.session.commit()

    login(client, 'test_provider', 'pw')
    res = client.get('/api/v1/warnings')
    assert res.status_code == 200
    assert len(res.get_json()) >= 1
