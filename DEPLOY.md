# Deploying menu3d

Backend + Postgres run on a VPS via Docker, fronted by Caddy for automatic
HTTPS. The three frontends (`admin`, `super-admin`, `customer`) each deploy
to Vercel as separate projects.

## 1. Backend (VPS)

Requirements: a VPS with Docker + the Docker Compose plugin installed, and a
domain (e.g. `api.yourdomain.com`) with its DNS A record pointed at the VPS's
IP - Caddy needs that to work before it can issue a certificate.

```bash
git clone <this repo> menu3d && cd menu3d

# Root env (Caddy + Postgres)
cp .env.example .env
# edit .env: set DOMAIN and a real POSTGRES_PASSWORD

# Backend env (Django)
cp backend/.env.example backend/.env
# edit backend/.env - required:
#   SECRET_KEY            (generate: python -c "import secrets; print(secrets.token_urlsafe(50))")
#   DEBUG=False
#   ALLOWED_HOSTS          e.g. api.yourdomain.com
#   CORS_ALLOWED_ORIGINS   the 3 Vercel URLs from step 2, comma-separated, no trailing slash
#   FRONTEND_BASE_URL      the customer app's URL (baked into every table's QR code)
#   CLOUDFLARE_*           R2 bucket for uploaded images (required whenever DEBUG=False)
#   AISTUDIO_TOKEN         3daistudio.com API token
# DATABASE_URL is set for you by docker-compose.yml - leave it blank here.

docker compose up -d --build
docker compose exec backend python manage.py createsuperuser
```

Migrations and `collectstatic` run automatically on container start
(`backend/entrypoint.sh`). The API is now live at `https://<DOMAIN>/`.

Redeploying after a code change:

```bash
git pull
docker compose up -d --build backend
```

Note: `backend` isn't published to the host — only Caddy (ports 80/443) is.
That's what makes it safe for gunicorn to speak plain HTTP internally.

## 2. Frontends (Vercel)

Create three separate Vercel projects from this repo, one per app, each with
its **Root Directory** set accordingly:

| Vercel project | Root Directory        |
|-----------------|------------------------|
| menu3d-admin    | `frontend/admin`       |
| menu3d-super-admin | `frontend/super-admin` |
| menu3d-customer | `frontend/customer`    |

For each project, set the environment variable:

```
NEXT_PUBLIC_API_URL=https://<DOMAIN>
```

(the same `DOMAIN` from step 1's root `.env`). This is inlined at build time,
so redeploy on Vercel after changing it.

Once you have the three `*.vercel.app` (or custom) URLs, go back to
`backend/.env` on the VPS and set `CORS_ALLOWED_ORIGINS` to those exact
origins, then `docker compose up -d backend` to pick up the change - cookie
auth will 401 silently otherwise (blocked by CORS, not a login bug).

## 3. First-time checks

- `https://<DOMAIN>/health/` returns `{"status": "ok"}`.
- Log into the admin app; if it hangs on "loading", check the browser's
  network tab for CORS errors first (see step 2's last paragraph).
- `docker compose logs -f backend` for gunicorn/Django errors.
- `docker compose logs -f caddy` if the certificate isn't issuing (usually a
  DNS or port 80/443 firewall issue).
