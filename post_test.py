import json, urllib.request
url='http://127.0.0.1:5000/reviews/add'
data = json.dumps({"user_id":1,"provider_id":1,"rating":4,"comment":"From test script"}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type':'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req, timeout=5) as r:
        print('STATUS', r.status)
        body=r.read().decode('utf-8')
        print('BODY', body)
except Exception as e:
    # attempt to show HTTP error body if available
    try:
        import urllib.error
        if isinstance(e, urllib.error.HTTPError):
            print('HTTP STATUS', e.code)
            print('HTTP BODY', e.read().decode('utf-8'))
        else:
            print('ERR', repr(e))
    except Exception:
        print('ERR', repr(e))
