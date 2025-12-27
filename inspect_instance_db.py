import sqlite3, os
p = 'instance/data.db'
print('abs path', os.path.abspath(p), 'exists', os.path.exists(p))
if os.path.exists(p):
    conn = sqlite3.connect(p)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    print('tables:', cur.fetchall())
    conn.close()
else:
    print('no file')
