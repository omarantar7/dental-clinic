#!/usr/bin/env bash
# One-time bootstrap: run this once on each server (docker compose must already
# be usable, and DNS for the domain(s) passed in must already point at it).
#
#   CERTBOT_EMAIL=you@example.com ./nginx/init-letsencrypt.sh dental-clinic.cc www.dental-clinic.cc
#   CERTBOT_EMAIL=you@example.com ./nginx/init-letsencrypt.sh sandbox.dental-clinic.cc
#
# It creates a temporary self-signed cert so nginx can start, then requests the
# real Let's Encrypt certificate over HTTP-01 and reloads nginx with it.
# After this, the "certbot" service in docker-compose.yaml keeps it renewed.
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: CERTBOT_EMAIL=you@example.com $0 <domain> [additional-domain ...]" >&2
  exit 1
fi

domains=("$@")
cert_name="${domains[0]}"
rsa_key_size=4096

# Let's Encrypt uses this for renewal/expiry notices.
email="${CERTBOT_EMAIL:?Set CERTBOT_EMAIL in the environment before running}"

# Set STAGING=1 while testing so you hit Let's Encrypt's staging server instead
# of production (production has strict rate limits on retries).
staging="${STAGING:-0}"

domain_args=()
for d in "${domains[@]}"; do
  domain_args+=("-d" "$d")
done

echo "### Creating a dummy certificate for $cert_name ..."
docker compose run --rm --entrypoint sh certbot -c "
  mkdir -p /etc/letsencrypt/live/$cert_name &&
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout /etc/letsencrypt/live/$cert_name/privkey.pem \
    -out /etc/letsencrypt/live/$cert_name/fullchain.pem \
    -subj '/CN=localhost'
"

echo "### Starting nginx ..."
docker compose up --force-recreate -d nginx

echo "### Deleting the dummy certificate ..."
docker compose run --rm --entrypoint sh certbot -c "
  rm -rf /etc/letsencrypt/live/$cert_name &&
  rm -rf /etc/letsencrypt/archive/$cert_name &&
  rm -rf /etc/letsencrypt/renewal/$cert_name.conf
"

echo "### Requesting the real Let's Encrypt certificate for ${domains[*]} ..."
staging_arg=""
if [ "$staging" != "0" ]; then
  staging_arg="--staging"
fi

docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot \
  $staging_arg \
  --email "$email" \
  "${domain_args[@]}" \
  --rsa-key-size "$rsa_key_size" \
  --agree-tos \
  --non-interactive

echo "### Reloading nginx with the real certificate ..."
docker compose exec nginx nginx -s reload

echo "### Done."
