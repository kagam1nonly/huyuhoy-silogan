# Deployment Guide: Render (Free Tier)

## Overview
This guide walks you through deploying Huyuhoy Silogan to Render with a free PostgreSQL database.

**Total time: ~30-40 minutes**
**Cost: FREE** (free tier for web app + free Postgres database)

---

## Prerequisites
- GitHub account
- Render account (free: https://render.com)
- Your code pushed to GitHub
- A new personal access token from GitHub (if needed)

---

## Step 1: Push Your Code to GitHub

1. Commit all changes:
```powershell
cd c:\Users\Thomas Mercines\OneDrive\Documents\GitHub\huyuhoy-silogan
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

2. Verify on GitHub that your repo has these **files at the project root**:
   - `Procfile` (tells Render how to run your app)
   - `requirements.txt` (includes `gunicorn`, `dj-database-url`, `psycopg2-binary`, `whitenoise`)
   - `huyuhoy/settings.py` (reads `DATABASE_URL` from env vars)

---

## Step 2: Create Render Account & Connect GitHub

1. Go to https://render.com and sign up (free).
2. Click **Dashboard** → **New** → **Web Service**.
3. Select **GitHub** and authorize Render to access your repos.
4. Search for and select `huyuhoy-silogan` repository.
5. Click **Connect**.

---

## Step 3: Configure Web Service on Render

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `huyuhoy-silogan` (or your preferred name) |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt && python manage.py collectstatic --noinput` |
| **Start Command** | `gunicorn huyuhoy.wsgi` |
| **Instance Type** | `Free` |

Click **Create Web Service**.

Render will start building. Wait ~2-3 minutes. You should see "Your service is live!" ✓

---

## Step 4: Create PostgreSQL Database on Render

1. From Render Dashboard, click **New** → **PostgreSQL**.
2. Configure:
   - **Name**: `huyuhoy-db` (or your choice)
   - **Database**: `huyuhoy_db`
   - **User**: `huyu_user`
   - **Region**: Pick closest to you
   - **Version**: PostgreSQL 15 (or latest)
   - **Instance Type**: `Free` ($0/month)

3. Click **Create Database**.

Wait ~1-2 minutes for the database to initialize. Copy the connection string (Internal Database URL) — you'll need it.

---

## Step 5: Connect Web Service to Database

1. Go back to your **Web Service** (huyuhoy-silogan).
2. Click **Environment**.
3. Add environment variables:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste the Internal Database URL from your PostgreSQL instance |
| `DEBUG` | `False` |
| `SECRET_KEY` | Generate a random string (or use a Django secret key generator) |
| `ALLOWED_HOSTS` | Your Render app URL (e.g., `huyuhoy-silogan.onrender.com`) |

**How to get values:**
- **DATABASE_URL**: Go to your PostgreSQL service page → click the connection info icon and copy the full URL.
- **SECRET_KEY**: Use `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` locally, then copy-paste.
- **ALLOWED_HOSTS**: Find your service URL on the Web Service page (e.g., `https://huyuhoy-silogan.onrender.com`), extract domain.

4. Click **Save Changes**.

Render will redeploy your app with the new env vars. Wait ~2-3 minutes.

---

## Step 6: Run Migrations

1. Go to your **Web Service** → click **Shell** tab (top right).
2. Run migrations to create Django tables:

```bash
python manage.py migrate
```

3. Create a superuser (admin account):

```bash
python manage.py createsuperuser
```

Follow prompts to set username, email, and password. Example:
```
Username: admin
Email: admin@example.com
Password: YourSecurePassword123
```

4. Test that migrations worked. In the shell, run:

```bash
python manage.py shell
from django.contrib.auth import get_user_model
User = get_user_model()
print(User.objects.all().count())
# Should print: 1 (your superuser)
```

---

## Step 7: Run Your Stored Procedures SQL

1. In the Render shell, run:

```bash
python -c "import psycopg2; print('Database connection OK')"
```

2. Copy the SQL file contents and execute them in a PostgreSQL client or:
   - Use pgAdmin connected to your Render database, or
   - If you have `psql` installed locally, connect and run the SQL file.

**Local option (from your Windows machine):**
```powershell
# Extract DB credentials from DATABASE_URL (format: postgres://user:pass@host:port/dbname)
$env:DATABASE_URL = "Your DATABASE_URL from Render"

# Install psql if missing, then:
psql $env:DATABASE_URL -f "huyuhoy\sql\postgres_queries.sql"
```

Alternatively, in Render shell, if you have the SQL file mounted or copy-pasted:
```bash
psql $DATABASE_URL < postgres_queries.sql
```

---

## Step 8: Test Your Deployed App

1. Go to your Web Service page. Click the URL (e.g., `https://huyuhoy-silogan.onrender.com`).
2. Verify the homepage loads.
3. Visit `/admin/` and log in with your superuser credentials.
4. Test the ordering flow:
   - Browse meals
   - Add to cart
   - Place an order
   - View order history

If anything fails, check **Logs** tab in Render for error messages.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Build fails** | Check Build Log. Usually missing dependency — add to `requirements.txt`. |
| **Database connection error** | Verify `DATABASE_URL` is in Environment variables and matches Postgres service. |
| **404 errors on static files** | Run `python manage.py collectstatic --noinput` locally to ensure `staticfiles/` exists and is committed. |
| **"Please log in" on `/admin/`** | You forgot to run `createsuperuser` — run it again in Shell. |
| **"no such table" errors** | Migrations didn't run. Execute `python manage.py migrate` in Shell. |

---

## Quick Reference: Render Commands

### In Shell (from Web Service page):
```bash
# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Check migrations status
python manage.py showmigrations

# Test database connection
python manage.py shell
```

### Local (from your Windows machine):
```powershell
# Set DB URL from Render
$env:DATABASE_URL = "Your DATABASE_URL"

# Test connection
python manage.py dbshell

# Run SQL file
psql $env:DATABASE_URL -f "huyuhoy\sql\postgres_queries.sql"
```

---

## Next Steps
- Monitor app in Render Dashboard.
- Set up custom domain (optional, paid feature).
- Configure email (update EMAIL settings in `settings.py` if needed).
- Back up your database regularly.

---

## Support
- Render docs: https://render.com/docs
- Django docs: https://docs.djangoproject.com
- PostgreSQL docs: https://www.postgresql.org/docs/

Enjoy your deployed app! 🚀
