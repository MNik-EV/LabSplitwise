#!/bin/sh
set -e

has_oidc() {
  [ -n "$AUTH_SECRET" ] && [ -n "$AUTH_AUTHENTIK_ISSUER" ] && \
  [ -n "$AUTH_AUTHENTIK_ID" ] && [ -n "$AUTH_AUTHENTIK_SECRET" ]
}

if [ "$AUTH_DISABLED" = "true" ]; then
  echo "SSO disabled (AUTH_DISABLED=true) — open access"
elif has_oidc; then
  echo "SSO enabled — Authentik OIDC"
elif [ "$AUTH_DISABLED" = "false" ]; then
  echo "ERROR: AUTH_DISABLED=false but OIDC env vars are incomplete"
  echo "Set AUTH_SECRET, AUTH_AUTHENTIK_ISSUER, AUTH_AUTHENTIK_ID, AUTH_AUTHENTIK_SECRET"
  exit 1
else
  echo "SSO not configured — running with open access (set OIDC env vars to enable Authentik)"
fi

echo "Waiting for database..."
until node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.\$queryRaw\`SELECT 1\`
  .then(() => prisma.\$disconnect())
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
"; do
  echo "Database not ready — retrying in 2s..."
  sleep 2
done

echo "Running pre-deploy..."
tsx prisma/pre-deploy.ts

echo "Applying database schema..."
prisma db push --accept-data-loss

echo "Starting LabSplitwise..."
exec node server.js
