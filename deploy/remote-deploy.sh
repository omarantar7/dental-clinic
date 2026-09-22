#!/usr/bin/env bash
# Run on the server by the CI deploy job, after docker-compose.yaml, nginx/,
# and .env have already been synced into this same directory.
# Expects GHCR_USERNAME and GHCR_PAT in the environment.
set -euo pipefail
cd "$(dirname "$0")"

echo "$GHCR_PAT" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
docker compose pull migrate app
docker compose up -d --remove-orphans
docker compose exec -T nginx nginx -t
docker compose exec -T nginx nginx -s reload
