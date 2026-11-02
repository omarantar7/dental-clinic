#!/usr/bin/env bash
# Run on the server by the CI deploy job, after docker-compose.yaml, nginx/,
# and .env have already been synced into this same directory.
# Expects GHCR_USERNAME and GHCR_PAT in the environment.
set -euo pipefail
cd "$(dirname "$0")"

# Shared with the droplet-wide nginx; docker-compose.yaml declares it external
docker network create web >/dev/null 2>&1 || true

echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
docker compose pull migrate app
docker compose up -d --remove-orphans

# Our own nginx only exists in the "standalone" profile; on the shared droplet
# the chefbey nginx resolves this app per request, so it needs no reload
if [ -n "$(docker ps -q --filter name=^dental-clinic-nginx$)" ]; then
  docker compose exec -T nginx nginx -t
  docker compose exec -T nginx nginx -s reload
fi

# Every deploy pulls new SHA-tagged images (the builder one is large); drop the
# ones no container uses anymore so they don't fill the shared droplet's disk
docker image prune -af
