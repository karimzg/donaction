#!/bin/sh

echo "Redirecting stripe-hooks to localhost..."

if [ -z "$(grep -v '^#' /app/.env | xargs)" ]; then
  echo "Error: You should run this command inside the donaction-frontend docker image"
  exit 1
fi

export $(grep -v '^#' /app/.env | xargs)

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Error: STRIPE_SECRET_KEY is not set in .env file."
  exit 1
fi

echo "Redirecting to http://donaction_backend:1437/api/klub-don-payments/stripe-web-hooks"

stripe listen --forward-to http://donaction_backend:1437/api/klub-don-payments/stripe-web-hooks --api-key "$STRIPE_SECRET_KEY"
