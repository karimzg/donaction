#!/bin/sh

# Get script directory and navigate to donaction-frontend root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT" || { echo "Failed to navigate to project root"; exit 1; }

DONACTION_FRONTEND="./donaction-frontend"
DONACTION_SAAS="./donaction-saas"
DONACTION_FRONTEND_PUBLIC="./public/donaction-web-components"

if [ "$(pwd)" = "/app" ]; then
  echo "Error: You should run this command on the local machine under /donaction-frontend"
  exit 1
fi

echo "Starting donaction-saas in development mode..."
echo "Working directory: $(pwd)"

#export $(grep -v '^#' .env | sed 's/=\(.*\)/="\1"/' | xargs)
#export $(grep -v '^#' .env | xargs)
set -a
grep -v '^#' .env | while IFS= read -r line; do
  [ -n "$line" ] && export "$line"
done
set +a


echo "Checking for NEXT_PUBLIC_STRAPI_API_TOKEN in .env file..."
if [ -z "$NEXT_PUBLIC_STRAPI_API_TOKEN" ]; then
  echo "Error: $NEXT_PUBLIC_STRAPI_API_TOKEN is not set in .env file."
  exit 1
fi
echo "NEXT_PUBLIC_STRAPI_API_TOKEN found: $NEXT_PUBLIC_STRAPI_API_TOKEN"

DATA='{"data":{"web_component":"KlubrSponsorshipForm","host":"http://localhost:3100"}}'

echo "Preparing to call API to create/update Klubr Sponsorship Form subscription..."
echo "Request Data: $DATA"
# Call API with token
RESPONSE=$(curl -s -X POST "http://localhost:1437/api/klubr-subscriptions" \
  -H "Authorization: Bearer $NEXT_PUBLIC_STRAPI_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DATA")

if [ $? -ne 0 ]; then
  echo "API request failed"
  exit 1
fi

SUBSCRIPTION_TOKEN=$(echo "$RESPONSE" | jq -r '.apiToken')
echo "API Response: $RESPONSE"

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

cd ".$DONACTION_SAAS" || { echo "Failed to navigate to .$DONACTION_SAAS"; exit 1; }

npm install

cd ".$DONACTION_FRONTEND" || { echo "Failed to navigate to .$DONACTION_FRONTEND"; exit 1; }

while true; do
    cd ".$DONACTION_SAAS" || { echo "Failed to navigate to .$DONACTION_SAAS"; exit 1; }
    npm run build

    echo "Syncing built files..."

    cd ".$DONACTION_FRONTEND" || { echo "Failed to navigate to .$DONACTION_FRONTEND"; exit 1; }
    rm -rf "$DONACTION_FRONTEND_PUBLIC"
    mkdir -p "$DONACTION_FRONTEND_PUBLIC"

    cp -r ".$DONACTION_SAAS/build/donaction-web-components/." "$DONACTION_FRONTEND_PUBLIC"

    if [ "$LOOP" == "false" ]; then
        echo "Exit condition met, exiting script."
        exit 0
    fi
    sleep 5
done

