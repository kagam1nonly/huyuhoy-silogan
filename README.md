## Huyuhoy Silogan (Decoupled Architecture)

This repository is now split into a modern, decoupled setup:

- `backend/` → Django + Django REST Framework API
- `frontend/` → React + Tailwind CSS (Vite)

## Repository Structure

- `backend/manage.py` Django entry point
- `backend/food/` Django app (models + serializers + API views)
- `backend/food/api_urls.py` API routes
- `frontend/src/` React application source
- `frontend/public/assets/` migrated static image assets

## Backend (Django + DRF)

API base path: `/api/`

Current endpoints:

- `GET /api/health/`
- `GET /api/meals/`
- `GET /api/orders/` (auth)
- `POST /api/orders/` (auth)
- `GET /api/orders/{number}/` (auth)
- `POST /api/orders/{order_number}/cancel/` (auth)
- `POST /api/orders/{order_number}/payment/gcash/` (auth)

Admin endpoints (staff only):

- `GET /api/admin/orders/`
- `POST /api/admin/orders/{id}/action/`
- `GET /api/admin/payments/`
- `POST /api/admin/payments/{id}/confirm/`
- `DELETE /api/admin/payments/{id}/`

## Frontend (React + Tailwind)

The frontend is initialized with React + Vite + Tailwind v4.

Legacy server-rendered UI files were removed after migration to keep the repository clean and maintainable.

Set API URL in:

- `frontend/.env` with `VITE_API_BASE_URL=http://127.0.0.1:8000/api`

Set backend frontend-origin in:

- `backend/.env` with `FRONTEND_URL=http://localhost:5173` (local)
- Production example: `FRONTEND_URL=https://your-frontend.vercel.app`

## Local Development

Backend:

1. `cd backend`
2. `pip install -r requirements.txt`
3. `python manage.py runserver`

Frontend:

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Deployment Targets

- Frontend: Render Static Site (`frontend/`)
- Backend: Render Web Service (`backend/`)
- Database: Render PostgreSQL

Recommended rollout: deploy now as **beta/staging**, then continue UI polish.

## Deploy on Render from scratch (backend + frontend + DB)

This repo includes a Render Blueprint at `render.yaml` for backend + database.

### Render Free Postgres limits (important)

Render Free Postgres is great for demos, but it has strict limits:

- Expires **30 days** after creation
- **1 GB** storage cap
- **No backups** on free tier
- Only one free Postgres per workspace

After expiration, there is a short grace period to upgrade, then data is deleted.

### 1) Push your latest code to GitHub

Render will deploy from your connected GitHub repository.

### 2) Create services from Blueprint

1. Open Render dashboard.
2. Click **New +** → **Blueprint**.
3. Select this repository and branch.
4. Confirm creation of:
	- `huyuhoy-postgres` (PostgreSQL)
	- `huyuhoy-backend` (Django web service)

### 3) Create frontend static site on Render

1. Click **New +** → **Static Site**.
2. Connect the same repository.
3. Configure:
	- Root Directory: `frontend`
	- Build Command: `npm ci && npm run build`
	- Publish Directory: `dist`
4. Add environment variable:
	- `VITE_API_BASE_URL=https://<your-backend-domain>.onrender.com/api`
5. Add rewrite rule for SPA routing:
	- Source: `/*`
	- Destination: `/index.html`
	- Action: `Rewrite`

### Render-first (no DB yet) quick setup

If Postgres is not ready yet, you can deploy backend on Render using temporary SQLite.

In Render backend service, use **Environment > Add from .env** and paste from:

- `backend/.env.render.no-db.example`

Important:

- Replace `DJANGO_ALLOWED_HOSTS` with your backend Render domain
- Replace `FRONTEND_URL` with your Vercel URL
- Keep `DJANGO_USE_SQLITE=True` for now
- Ensure `DATABASE_URL` is unset/blank while using SQLite mode

When your database is ready (Render Postgres or Supabase), set `DATABASE_URL`, set `DJANGO_USE_SQLITE=False`, then run:

- `python manage.py migrate`

Use this template when switching to managed Postgres:

- `backend/.env.render.postgres.example`

### 4) Wait for first deploy to finish

The backend build already runs:

- `pip install -r requirements.txt`
- `python manage.py collectstatic --noinput`

Then run migration once in Render Shell:

- `python manage.py migrate`

### 5) Update real service URLs (important)

After first deploy, Render gives final `.onrender.com` domains. Update env vars in Render:

Backend (`huyuhoy-backend`):

- `DJANGO_ALLOWED_HOSTS=<your-backend-domain>.onrender.com`
- `FRONTEND_URL=https://<your-frontend-domain>.onrender.com`

Then manually trigger redeploy for both services.

### 6) Create admin account once

Open backend service shell and run:

- `python manage.py createsuperuser`

### 7) Smoke Test on live URLs

- Signup/login as customer
- Place order
- Submit payment
- Login as staff
- Approve order/payment in `/admin/orders` and `/admin/payments`

## Recommended long-term showcase setup

If you want auto-sleep/auto-wake but no 30-day expiry, keep Render web service and use an external free Postgres provider (for example Supabase or Neon).

1. Create the Postgres project in provider dashboard.
2. Copy the PostgreSQL connection string.
3. In Render backend env:
	- set `DJANGO_USE_SQLITE=False`
	- set `DATABASE_URL=<provider-postgres-url>`
4. Redeploy backend.
5. Run `python manage.py migrate` in Render Shell.

## Supabase setup from scratch (recommended for portfolio)

### 1) Create Supabase project

1. Go to Supabase dashboard and create a new project.
2. Wait until database status is ready.
3. Save the database password you created.

### 2) Copy Supabase Postgres connection string

1. Open **Project Settings** → **Database**.
2. Find **Connection string** and select **Transaction pooler** (recommended for hosted apps).
3. Copy URI format similar to:
	- `postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres`

### 3) Configure Render backend env

Use **Environment → Add from .env** and paste from:

- `backend/.env.render.supabase.example`

Then replace values:

- `DATABASE_URL` with your Supabase URI
- `FRONTEND_URL` with your Vercel URL
- `DJANGO_SECRET_KEY` with your generated secret

Important:

- Keep `DJANGO_USE_SQLITE=False`
- Ensure old `DATABASE_URL` values are removed/replaced

### 4) Deploy and migrate

1. Redeploy backend service on Render.
2. Open Render Shell and run:
	- `python manage.py migrate`
3. (Optional) Create admin user:
	- `python manage.py createsuperuser`

### 5) Verify

- `GET /api/health/` returns `{"status":"ok"}`
- From frontend, test signup/login and order flow
