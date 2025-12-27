from app import create_app
app=create_app()
with app.test_client() as c:
    res = c.post('/reviews/add', json={'user_id':1,'provider_id':1,'rating':5,'comment':'tc test'})
    print('STATUS', res.status_code)
    print(res.get_data(as_text=True))
