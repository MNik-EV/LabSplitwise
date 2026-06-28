#!/bin/sh
set -e

if [ "$AUTH_DISABLED" != "true" ]; then
  if [ -z "$AUTH_SECRET" ]; then
    echo "ERROR: AUTH_SECRET is required when AUTH_DISABLED is not true"
    exit 1
  fi
  if [ -z "$AUTH_AUTHENTIK_ISSUER" ] || [ -z "$AUTH_AUTHENTIK_ID" ] || [ -z "$AUTH_AUTHENTIK_SECRET" ]; then
    echo "ERROR: AUTH_AUTHENTIK_ISSUER, AUTH_AUTHENTIK_ID, and AUTH_AUTHENTIK_SECRET are required"
    exit 1
  fi
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
