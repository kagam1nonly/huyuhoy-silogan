# Huyuhoy Silogan - Audit and Restructure (Phase 1)

## Project Summary
Huyuhoy Silogan is a school food-ordering platform built with business owner consent. The repository uses a decoupled architecture:
- Frontend: React (Vite) + Tailwind CSS
- Backend: Django + Django REST Framework
- Database target: PostgreSQL (Supabase in production direction)

## Current Repository Layout
- `backend/` API service, Django project, app modules, migrations, deployment env examples
- `frontend/` React client app, pages/components/UI atoms
- `docs/notes/` project notes and SQL references for migration/deployment
- `render.yaml` deployment blueprint for Render services

## Cleanup Completed
1. Removed unused public assets from `frontend/public/assets/`.
2. Moved SQL note files from legacy location to docs:
   - `docs/notes/sql/MySQL-Queries.sql`
   - `docs/notes/sql/Postgres-Queries.txt`
   - `docs/notes/sql/Supabase-Postgres-Functions.sql`
3. Removed empty legacy folder `backend/sql/`.
4. Added root `.gitignore` for environment files, local DB artifacts, and build output.

## Suggested Professional Structure

```
/
  backend/
    food/
    huyuhoy/
    manage.py
    requirements.txt
  frontend/
    src/
      api/
      components/
      pages/
    public/
    package.json
  docs/
    notes/
      sql/
      AUDIT-AND-RESTRUCTURE.md
  render.yaml
  README.md
  .gitignore
```

## Next Recommended Phase
- Deployment readiness hardening:
  - Django production settings (`DEBUG=False`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`)
  - Backend `DATABASE_URL` for Supabase
  - Final README refresh with setup/deploy instructions
