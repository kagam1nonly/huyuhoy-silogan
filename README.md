# Huyuhoy Silogan

Decoupled full-stack food ordering platform.

- Frontend: React + Vite + Tailwind
- Backend: Django + Django REST Framework
- Target production DB: PostgreSQL (Render Postgres or Supabase)

## Project Structure

- frontend: Vite app (customer and admin UI)
- backend: Django API and models
- docs/notes: project notes and SQL references
- render.yaml: Render blueprint (backend + postgres)

## Local Development

### 1) Backend

```powershell
Set-Location backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py runserver
```

Backend API runs on http://127.0.0.1:8000/api.

### 2) Frontend

```powershell
Set-Location frontend
npm install
"VITE_API_BASE_URL=http://127.0.0.1:8000/api" | Set-Content .env
npm run dev
```

Frontend runs on http://localhost:5173.

## Environment Variables (Backend)

Use backend/.env.example as baseline.

Required for production:

- DJANGO_SECRET_KEY
- DJANGO_DEBUG=False
- DJANGO_ALLOWED_HOSTS (comma-separated hosts)
- FRONTEND_URL and/or FRONTEND_URLS
- DATABASE_URL (Postgres URI)
- DJANGO_MEDIA_ROOT=/var/data/media (for persistent uploaded meal images on Render)

Recommended if you do not use Render Persistent Disk:

- CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
- CLOUDINARY_MEDIA_FOLDER=huyuhoy/meal_images

Optional security overrides (already supported in settings.py):

- SESSION_COOKIE_SECURE
- CSRF_COOKIE_SECURE
- SESSION_COOKIE_SAMESITE
- CSRF_COOKIE_SAMESITE
- SECURE_SSL_REDIRECT
- SECURE_HSTS_SECONDS
- SECURE_HSTS_INCLUDE_SUBDOMAINS
- SECURE_HSTS_PRELOAD

Optional keepalive protection:

- KEEPALIVE_TOKEN (required if you want to restrict /api/keepalive/ calls)

## Deployment

### Render

The repository includes render.yaml for backend + postgres.

Backend build command:

- pip install -r requirements.txt
- python manage.py migrate
- python manage.py collectstatic --noinput

After first deploy, verify env vars and create a superuser:

```powershell
python manage.py createsuperuser
```

Important for meal image persistence:

- Add a Render Persistent Disk to the backend service.
- Use mount path `/var/data`.
- Set `DJANGO_MEDIA_ROOT=/var/data/media`.

Without a persistent disk, uploaded meal images can disappear after restart/redeploy.

Alternative (free tier friendly):

- Use Cloudinary storage for media uploads by setting `CLOUDINARY_URL`.
- When configured, Django uploads meal images to Cloudinary instead of local Render filesystem.

### Frontend Hosting

Deploy frontend as a static site (Render Static Site or Vercel).
Set:

- VITE_API_BASE_URL=https://your-backend-domain/api

For SPA routing, configure rewrite:

- /* -> /index.html

## Supabase PostgreSQL (Alternative)

1. Create Supabase project.
2. Copy pooled postgres URI.
3. Set backend DATABASE_URL to Supabase URI.
4. Ensure DJANGO_DEBUG=False and correct host/origin settings.
5. Run migrations:

```powershell
python manage.py migrate
```

## Keepalive Automation (Render + Supabase)

This repository includes [keepalive workflow](.github/workflows/keepalive.yml) that runs every 10 minutes and can ping:

- your Render backend keepalive endpoint
- your Supabase auth health endpoint

Backend endpoint added:

- GET /api/keepalive/

If `KEEPALIVE_TOKEN` is set in backend env, callers must send header:

- `X-Keepalive-Token: <token>`

Configure these GitHub Actions repository secrets:

- `RENDER_KEEPALIVE_URL` (example: `https://your-backend.onrender.com/api/keepalive/`)
- `KEEPALIVE_TOKEN` (match backend env `KEEPALIVE_TOKEN`)
- `SUPABASE_PROJECT_URL` (example: `https://xyzcompany.supabase.co`)
- `SUPABASE_ANON_KEY` (optional but recommended)

## Safety Review Archive

Unexpected files were copied (not deleted) to:

- docs/review-pending/2026-03-28-unexpected-files

You can review and remove this folder later once confirmed.

## Notes

- SQL reference files were reorganized to docs/notes/sql.
- Local sqlite database file should not be committed.

## Interviews 

What to mention in interviews
Migration story: took a vanilla JS app and migrated to React + Tailwind. Emphasize:
Why React/Tailwind: component reusability, maintainability, faster styling workflow.
How you kept API surface stable while migrating (i.e., backend API kept same endpoints so frontend could be migrated in phases).
Testing & CI: mention Django unit tests (describe tests in tests.py), and that you run frontend builds in CI to detect regressions.
DevOps/Deployment: mention Render/Heroku-style setup, Procfile, and use of env vars for secrets and DB config.
Security: show you ran npm audit and are aware of vite/esbuild advisories and how you'd handle major upgrades (branch, test, roll out carefully).
Performance: Vite build is already producing optimized bundles. Optionally describe caching or image CDN (Cloudinary option).
Suggested talking points / quick answers
Q: "How did you migrate the frontend?"
A: "I ported views incrementally to React components, introduced Tailwind for utility-first styling, and kept the backend API unchanged to allow progressive migration."
Q: "How do you handle media?"
A: "Local filesystem for dev; Cloudinary for production via CLOUDINARY_URL. Media storage switches based on env var."
Q: "How to run tests in CI?"
A: "Install requirements, set DJANGO_DEBUG=True or provide test secrets, run migrations to an in-memory or ephemeral DB, run manage.py test."