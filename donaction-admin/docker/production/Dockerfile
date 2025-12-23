FROM node:20 AS builder

# Build-time secrets (passed via --build-arg)
ARG ENVIRONMENT=prod
ARG STRAPI_ADMIN_API_TOKEN
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG GOOGLE_RECAPTCHA_SITE_KEY
ARG GOOGLE_MAPS_API_KEY
ARG KLUBR_UUID

WORKDIR /app

COPY /donaction-admin/package*.json ./

RUN npm install --legacy-peer-deps

COPY /donaction-admin .

# Validate required secrets
RUN if [ -z "$STRAPI_ADMIN_API_TOKEN" ]; then echo "ERROR: STRAPI_ADMIN_API_TOKEN is required" && exit 1; fi

# Replace placeholders in environment file
RUN sed -i "s|STRAPI_ADMIN_API_TOKEN_PLACEHOLDER|${STRAPI_ADMIN_API_TOKEN}|g" src/environments/environment.${ENVIRONMENT}.ts && \
    sed -i "s|GOOGLE_CLIENT_ID_PLACEHOLDER|${GOOGLE_CLIENT_ID}|g" src/environments/environment.${ENVIRONMENT}.ts && \
    sed -i "s|GOOGLE_CLIENT_SECRET_PLACEHOLDER|${GOOGLE_CLIENT_SECRET}|g" src/environments/environment.${ENVIRONMENT}.ts && \
    sed -i "s|GOOGLE_RECAPTCHA_SITE_KEY_PLACEHOLDER|${GOOGLE_RECAPTCHA_SITE_KEY}|g" src/environments/environment.${ENVIRONMENT}.ts && \
    sed -i "s|GOOGLE_MAPS_API_KEY_PLACEHOLDER|${GOOGLE_MAPS_API_KEY}|g" src/environments/environment.${ENVIRONMENT}.ts && \
    sed -i "s|KLUBR_UUID_PLACEHOLDER|${KLUBR_UUID}|g" src/environments/environment.${ENVIRONMENT}.ts

# Validate placeholders were replaced
RUN if grep -q "_PLACEHOLDER" src/environments/environment.${ENVIRONMENT}.ts; then \
      echo "ERROR: Unreplaced placeholders found:" && \
      grep "_PLACEHOLDER" src/environments/environment.${ENVIRONMENT}.ts && \
      exit 1; \
    fi

RUN sed -i 's/<!--<link rel="manifest" href="\/public\/manifest.webmanifest">-->/<link rel="manifest" href="\/admin\/public\/manifest.webmanifest">/' /app/src/index.html
RUN npm run build -- --configuration=${ENVIRONMENT} --base-href=/admin/

FROM nginx:latest

COPY --from=builder /app/dist/donaction-admin/browser /usr/share/nginx/html/admin
COPY /donaction-admin/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
