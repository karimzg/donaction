#!/bin/sh

KLUBR_FRONTEND="./klubr-frontend"
KLUBR_SAAS="./klubr-saas"
KLUBR_FRONTEND_PUBLIC="./public/klubr-web-components"

if [ $(pwd) == "/app" ]; then
  echo "Error: You should run this command on the local machine under /klubr-frontend"
  exit 1
fi

export $(grep -v '^#' .env | xargs)

if [ -z "$NEXT_PUBLIC_STRAPI_API_TOKEN" ]; then
  echo "Error: $NEXT_PUBLIC_STRAPI_API_TOKEN is not set in .env file."
  exit 1
fi

DATA='{"data":{"web_component":"KlubrSponsorshipForm","host":"http://localhost:3000"}}'

# Call API with token
RESPONSE=$(curl -s -X POST "http://localhost:1337/api/klubr-subscriptions" \
  -H "Authorization: Bearer $NEXT_PUBLIC_STRAPI_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DATA")

if [ $? -ne 0 ]; then
  echo "API request failed"
  exit 1
fi

SUBSCRIPTION_TOKEN=$(echo "$RESPONSE" | jq -r '.apiToken')

if [ -z "$SUBSCRIPTION_TOKEN" ] || [ "$SUBSCRIPTION_TOKEN" == "null" ]; then
  echo "Error: Failed to extract the SUBSCRIPTION_TOKEN."
  exit 1
fi

echo "Subscription Token: $SUBSCRIPTION_TOKEN"

if grep -q "^NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=" .env; then
  if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s/^NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=.*/NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=$SUBSCRIPTION_TOKEN/" .env
  else
      sed -i "s/^NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=.*/NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=$SUBSCRIPTION_TOKEN/" .env
  fi
else
  echo "NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=$SUBSCRIPTION_TOKEN" >> .env
fi

echo "Updated .env file with new Subscription token."

echo "Starting build in watch mode..."

cd ".$KLUBR_SAAS" || { echo "Failed to navigate to .$KLUBR_SAAS"; exit 1; }

npm install

cd ".$KLUBR_FRONTEND" || { echo "Failed to navigate to .$KLUBR_FRONTEND"; exit 1; }

while true; do
    cd ".$KLUBR_SAAS" || { echo "Failed to navigate to .$KLUBR_SAAS"; exit 1; }
    npm run build

    echo "Syncing built files..."

    cd ".$KLUBR_FRONTEND" || { echo "Failed to navigate to .$KLUBR_FRONTEND"; exit 1; }
    rm -rf "$KLUBR_FRONTEND_PUBLIC"
    mkdir -p "$KLUBR_FRONTEND_PUBLIC"

    cp -r ".$KLUBR_SAAS/build/klubr-web-components/." "$KLUBR_FRONTEND_PUBLIC"

    if [ "$LOOP" == "false" ]; then
        echo "Exit condition met, exiting script."
        exit 0
    fi
    sleep 5
done

