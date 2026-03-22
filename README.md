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

Legacy server-rendered UI files are preserved for reference in:

- `frontend/legacy-ui/templates/` (old Django HTML templates)
- `frontend/legacy-ui/css/` (old CSS)
- `frontend/legacy-ui/js/` (old vanilla JS)

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

- Frontend: Vercel (`frontend/`)
- Backend: Render (`backend/`)

Recommended rollout: deploy now as **beta/staging**, then continue UI polish.

## Deployment Env Checklist

Frontend (Vercel):

- `VITE_API_BASE_URL=https://your-render-api-domain/api`

Backend (Render):

- `FRONTEND_URL=https://your-vercel-domain`

This keeps CORS + CSRF trusted origins aligned for cross-domain frontend/backend communication.

Database migration and final production DB setup can be handled after API + frontend integration is complete.

## Deploy Now (Beta/Staging)

### 1) Deploy Backend to Render

Create a new **Web Service** from the `backend/` directory and set:

- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn huyuhoy.wsgi`

Set Render environment variables:

- `DJANGO_SECRET_KEY=<long-random-secret>`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS=<your-render-service>.onrender.com`
- `FRONTEND_URL=https://<your-vercel-app>.vercel.app`
- `SESSION_COOKIE_SECURE=True`
- `CSRF_COOKIE_SECURE=True`
- `SESSION_COOKIE_SAMESITE=None`
- `CSRF_COOKIE_SAMESITE=None`
- `SECURE_SSL_REDIRECT=True`
- `SECURE_HSTS_SECONDS=31536000`
- `SECURE_HSTS_INCLUDE_SUBDOMAINS=True`
- `SECURE_HSTS_PRELOAD=True`
- `DATABASE_URL=<render-postgres-internal-or-external-url>`

Then run migrations in Render Shell:

- `python manage.py migrate`
- `python manage.py collectstatic --noinput`
- `python manage.py createsuperuser`

### 2) Deploy Frontend to Vercel

Create a new Vercel project from the `frontend/` directory and set:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Set Vercel environment variables:

- `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api`

### 3) Smoke Test on Live URLs

- Signup/login as customer
- Place order
- Submit payment
- Login as staff
- Approve order/payment in `/admin/orders` and `/admin/payments`
