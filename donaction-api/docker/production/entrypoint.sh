#!/bin/sh
set -e

# Validate required runtime secrets
missing=""

[ -z "$DATABASE_PASSWORD" ] && missing="$missing DATABASE_PASSWORD"
[ -z "$DATABASE_HOST" ] && missing="$missing DATABASE_HOST"
[ -z "$JWT_SECRET" ] && missing="$missing JWT_SECRET"
[ -z "$ADMIN_JWT_SECRET" ] && missing="$missing ADMIN_JWT_SECRET"
[ -z "$APP_KEYS" ] && missing="$missing APP_KEYS"

if [ -n "$missing" ]; then
  echo "FATAL: Missing required runtime secrets:$missing"
  exit 1
fi

exec "$@"
