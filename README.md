# Review & Rating App — Local Setup

Quick steps to run locally (Windows PowerShell):

1. Create and activate a virtual environment:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

3. (Optional) Use the provided SQLite DB (default). To use a different DB set `DATABASE_URL`.

4. Run the app:

```powershell
$env:DATABASE_URL = "sqlite:///data.db"  # optional, config already defaults to sqlite
py -3 app.py
```

5. Open a provider page, for example:

http://127.0.0.1:5000/reviews/provider/1

Notes
- The app will create `data.db` in the project folder when using SQLite.
- If you have existing MySQL/Postgres, set `DATABASE_URL` to your connection string.
