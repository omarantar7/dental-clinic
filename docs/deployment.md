# Deployment (CI/CD)

This documents what `.github/workflows/deploy.yml` does and exactly which
GitHub secrets/variables need to exist for it to run. It covers two servers:
**production** (`dental-clinic.cc`, DigitalOcean) and **sandbox**
(`sandbox.dental-clinic.cc`, Oracle Cloud) — both amd64.

> **Naming note:** the GitHub Environment for the production server is named
> `env` (not `production`) in this repo's Settings. Everywhere below that
> says "the `env` environment," that's the production server's environment.

> **Current status:** the sandbox server isn't provisioned yet, so
> `deploy-sandbox` is temporarily disabled (`if: false` in the workflow) and
> `deploy-production` depends only on `build`, not on sandbox succeeding.
> Everything else below (jobs, secrets, files) is written for the intended
> steady state once sandbox exists — see the `TODO` comments in
> `deploy.yml` for exactly what to flip back on.

## How the pipeline works

**"Build once, promote."** The image is never rebuilt per environment — the
exact same artifact that runs on sandbox is later deployed to production.

Trigger: push to `main`, or manually via `workflow_dispatch` (optionally
targeting a specific commit `sha`, e.g. for redeploying an older build).

Jobs run in this order:

1. **`lint`** — `npm ci` + `npm run lint`. Everything else depends on this passing.
2. **`build`** — builds two images from the same `Dockerfile` and pushes both
   to GHCR, tagged with a 12-char commit SHA:
   - `ghcr.io/omarantar7/dental-clinic:<sha>` (the `runner` stage) — what the
     `app` service in `docker-compose.yaml` runs.
   - `ghcr.io/omarantar7/dental-clinic:builder-<sha>` (the `builder` stage) —
     what the `migrate` service runs. It needs the full `node_modules`
     (including the `prisma` CLI) that the slim `runner` image deliberately
     doesn't have.
3. **`deploy-sandbox`** — deploys the SHA built above to the sandbox server,
   automatically, no approval needed.
4. **`deploy-production`** — deploys the *same* SHA to production. This job
   only becomes available after `deploy-sandbox` succeeds, **and** requires a
   manual approval click (see [Required reviewer](#required-reviewer-on-env)
   below) — that gate is configured in GitHub's UI, not in the workflow file.

Each deploy job (`deploy-sandbox` / `deploy-production`) does the same four
things, just against different servers/secrets:

1. Stage `docker-compose.yaml`, `nginx/*.conf`, `nginx/init-letsencrypt.sh`,
   `deploy/remote-deploy.sh`, and a freshly-generated `.env` (built from that
   environment's GitHub secrets/variables) into a local staging folder.
2. `rsync` that folder to `/opt/dental-clinic/` on the target server over SSH.
   Nothing else from the repo (source code, `node_modules`, `.git`) ever
   touches the server — it only pulls prebuilt images from GHCR.
3. SSH in and run `deploy/remote-deploy.sh`, which logs into GHCR, does
   `docker compose pull migrate app`, `docker compose up -d --remove-orphans`
   (this also runs the one-off `migrate` service, which the `app` service
   waits on), and reloads nginx (`nginx -t && nginx -s reload` — needed
   because compose won't restart nginx just from the bind-mounted config file
   changing on disk).
4. A plain `curl -f https://<domain>/` smoke test.

## Required GitHub configuration

### Environments

Create two **GitHub Environments** (Settings → Environments): `sandbox` and
`env` (the latter is the production server's environment — see the naming
note above). Same secret *names* in both, different values — the workflow
doesn't branch on environment name anywhere, it just resolves whichever
environment the job references.

### Repository-level secrets/variables

Identical across both environments, so they live once at the repo level
(Settings → Secrets and variables → Actions), not duplicated per-environment:

| Name | Type | Purpose |
|---|---|---|
| `GHCR_PAT` | Secret | A GitHub PAT (classic, `read:packages` scope) used by **both servers** to `docker login ghcr.io` and pull the image. Not the same credential CI itself uses to *push* (that's the automatic `GITHUB_TOKEN`). |
| `GHCR_USERNAME` | Variable | The GitHub username paired with `GHCR_PAT` (e.g. `omarantar7`). Not sensitive, so it's a variable, not a secret. |

### Per-environment secrets/variables

Create all of these in **both** the `sandbox` and `env` environments,
with different values in each:

| Name | Type | Notes |
|---|---|---|
| `SSH_HOST` | Secret | IP/hostname of that environment's server (Oracle box for sandbox, DigitalOcean droplet for production) |
| `SSH_USER` | Secret | SSH user the workflow logs in as |
| `SSH_KEY` | Secret | Private key whose matching public key is authorized on that server |
| `SSH_PORT` | Secret | SSH port (e.g. `22`) |
| `POSTGRES_USER` | Secret | DB user for that environment's Postgres |
| `POSTGRES_PASSWORD` | Secret | DB password — **use a different password per environment** |
| `POSTGRES_DB` | Secret | DB name (e.g. `dental_clinic` / `dental_clinic_sandbox`) |
| `JWT_SECRET_KEY` | Secret | Auth token signing secret — **must be distinct per environment**, otherwise a sandbox leak can forge valid production auth tokens |
| `TOKEN_EXPIRATION` | Secret | e.g. `15m` |
| `REFRESH_TOKEN_EXPIRATION` | Secret | e.g. `7d` |
| `OTP_EXPIRATION_MINUTES` | Secret | e.g. `10` |
| `RESEND_API_KEY` | Secret | Recommend a distinct key for sandbox so test runs don't send real email from the production sender identity |
| `RESEND_FROM_EMAIL` | Secret | Same recommendation as above |
| `R2_ENDPOINT` | Secret | Cloudflare R2 endpoint URL |
| `R2_ACCESS_KEY_ID` | Secret | R2 credential |
| `R2_SECRET_ACCESS_KEY` | Secret | R2 credential |
| `R2_BUCKET_NAME` | Secret | Both environments currently share the **same** bucket (see `R2_KEY_PREFIX` below) |
| `R2_KEY_PREFIX` | Secret | `sandbox` in the `sandbox` environment, **empty/unset** in `env` — namespaces uploaded object keys so both environments can safely share one R2 bucket without colliding |
| `NGINX_CONF_FILE` | Variable | `production.conf` for `env`, `sandbox.conf` for `sandbox` — selects which file in `nginx/` that server's nginx container mounts. Not sensitive, so it's a variable. |

`DATABASE_URL` and `NODE_ENV` are **not** secrets — `docker-compose.yaml`
builds `DATABASE_URL` itself from the three `POSTGRES_*` values, and
`NODE_ENV` is hardcoded to `production` in the compose file.

### Required reviewer on env

Settings → Environments → `env` → **Required reviewers** → add
yourself (or whoever should approve production deploys). This is the actual
mechanism that pauses `deploy-production` for a manual click — nothing in
`deploy.yml` expresses it. Do **not** add this rule to the `sandbox`
environment; it should deploy automatically.

## Server prerequisites (one-time, per server)

Before the first CI-driven deploy, on **each** server:

1. Create `/opt/dental-clinic/`, owned by whichever user `SSH_USER` logs in as.
2. Install `docker`, the `docker compose` v2 plugin, and `rsync`.
3. Run the TLS bootstrap once by hand (see [nginx/init-letsencrypt.sh](../nginx/init-letsencrypt.sh)):
   ```bash
   # production:
   CERTBOT_EMAIL=you@example.com ./nginx/init-letsencrypt.sh dental-clinic.cc www.dental-clinic.cc

   # sandbox:
   CERTBOT_EMAIL=you@example.com ./nginx/init-letsencrypt.sh sandbox.dental-clinic.cc
   ```
   This is intentionally manual and outside CI — it only needs to run once per
   server, after which the `certbot` service in `docker-compose.yaml` keeps
   the certificate renewed automatically.

## Related files

- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) — the workflow itself
- [`deploy/remote-deploy.sh`](../deploy/remote-deploy.sh) — what actually runs on the server
- [`docker-compose.yaml`](../docker-compose.yaml) — the 5 services (`postgres`, `migrate`, `app`, `nginx`, `certbot`)
- [`nginx/production.conf`](../nginx/production.conf), [`nginx/sandbox.conf`](../nginx/sandbox.conf) — per-domain nginx config
- [`nginx/init-letsencrypt.sh`](../nginx/init-letsencrypt.sh) — one-time TLS bootstrap
- [`.env.example`](../.env.example) — documents every runtime env var

## Rollback

Trigger the workflow manually (`workflow_dispatch`) with `sha` set to an
older commit. This re-deploys whatever image was already built and pushed for
that commit (GHCR images aren't rebuilt or deleted by this pipeline) — it does
**not** rebuild, so rollback is fast and uses the exact artifact that was
previously running.
