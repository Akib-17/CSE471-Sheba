import urllib.request
url='http://127.0.0.1:5000/'
with urllib.request.urlopen(url, timeout=5) as r:
    print('STATUS', r.status)
    print(r.read().decode())
