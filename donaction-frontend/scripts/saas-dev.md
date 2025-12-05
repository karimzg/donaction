# SAAS-DEV script Documentation

## Overview

This shell script automates the process of:
- Fetching a subscription token via an API request.
- Updating the `.env` file with the subscription token.
- Running a build process in watch mode, syncing built files, and handling looped execution.

## Prerequisites

- **Directory Structure**:
    - `klubr-frontend`: Frontend project folder.
    - `klubr-saas`: SaaS project folder.
    - `public/klubr-web-components`: Destination folder for synced web components.

- **Required Tools**:
    - `jq`: Command-line JSON processor.
    - `curl`: Tool to make API requests.
    - `npm`: Node.js package manager for running frontend builds.

## How It Works

### 1. **Directory Check**

The script ensures it is run in the correct environment. It prevents execution if the current directory is `/app` (docker).

```bash
if [ $(pwd) == "/app" ]; then
  echo "Error: You should run this command on the local machine under /klubr-frontend"
  exit 1
fi
```
### 2. Environment Variables

The script loads variables from a .env file using export and checks for the presence of a required environment variable (NEXT_PUBLIC_STRAPI_API_TOKEN). If the variable is missing, the script exits.
```
export $(grep -v '^#' .env | xargs)

if [ -z "$NEXT_PUBLIC_STRAPI_API_TOKEN" ]; then
  echo "Error: $NEXT_PUBLIC_STRAPI_API_TOKEN is not set in .env file."
  exit 1
fi

```

### 3. API Request
The script sends a POST request to http://localhost:1337/api/klubr-subscriptions to fetch a subscription token using the provided NEXT_PUBLIC_STRAPI_API_TOKEN. The request is made using the curl tool.

```
RESPONSE=$(curl -s -X POST "http://localhost:1337/api/klubr-subscriptions" \
  -H "Authorization: Bearer $NEXT_PUBLIC_STRAPI_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$DATA")

```

### 4. Token Extraction
After receiving the API response, the script extracts the apiToken using jq and ensures that it is valid. If the token is missing or invalid, it exits.

```
SUBSCRIPTION_TOKEN=$(echo "$RESPONSE" | jq -r '.apiToken')

if [ -z "$SUBSCRIPTION_TOKEN" ] || [ "$SUBSCRIPTION_TOKEN" == "null" ]; then
  echo "Error: Failed to extract the SUBSCRIPTION_TOKEN."
  exit 1
fi

```

### 5. Update .env File
The script checks if NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN is already in the .env file:

If it exists, it updates the token based on the operating system.
macOS: Uses sed -i '' for in-place editing.
Linux: Uses sed -i for in-place editing.
If the variable doesn't exist, it appends the new token to the file.

```
if grep -q "^NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=" .env; then
  if [[ "$(uname)" == "Darwin" ]]; then
      sed -i '' "s/^NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=.*/NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=$SUBSCRIPTION_TOKEN/" .env
  else
      sed -i "s/^NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=.*/NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=$SUBSCRIPTION_TOKEN/" .env
  fi
else
  echo "NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=$SUBSCRIPTION_TOKEN" >> .env
fi

```

### 6. Build and Sync Web Components
The script runs a build process in watch mode, where it:

Installs Dependencies: Runs npm install in the klubr-saas folder.
Builds Components: Runs npm run build in the klubr-saas folder to generate the web components.
Syncs Built Files: Deletes the existing public/klubr-web-components folder, creates a new one, and copies the built components into it.
Watch Mode: Loops the process, with a 5-second delay between each iteration. The loop continues unless the LOOP environment variable is set to "false".

```
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

```

### 7. Exit Conditions
The script will exit in the following cases:

If the required environment variable (NEXT_PUBLIC_STRAPI_API_TOKEN) is not set.
If the API request fails.
If the subscription token is missing or invalid.
If the LOOP variable is set to "false".


### Usage
Ensure .env File is Configured:

Ensure that NEXT_PUBLIC_STRAPI_API_TOKEN is set in the .env file.
Run the Script:

Execute the script with:

```
npm run dev:saas

//OR

npm run build:saas
```

