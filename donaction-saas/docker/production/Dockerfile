FROM node:20-alpine AS builder

# Build-time secrets (passed via --build-arg)
ARG VITE_STRAPI_API_URL
ARG VITE_STRAPI_API_TOKEN
ARG VITE_STRIPE_PUBLISHABLE_KEY
ARG VITE_GOOGLE_RECAPTCHA_SITE_KEY
ARG VITE_GOOGLE_MAPS_KEY
ARG VITE_GOOGLE_GA_TRACKING_ID
ARG VITE_ACTIVATE_ANALYTICS
ARG VITE_PLAUSIBLE_DATA_DOMAIN
ARG VITE_NEXT_URL

WORKDIR /app

COPY donaction-saas/package*.json ./

RUN npm install --include=dev

COPY donaction-saas ./

# Validate required secrets
RUN if [ -z "$VITE_STRAPI_API_URL" ]; then echo "ERROR: VITE_STRAPI_API_URL is required" && exit 1; fi && \
    if [ -z "$VITE_STRAPI_API_TOKEN" ]; then echo "ERROR: VITE_STRAPI_API_TOKEN is required" && exit 1; fi

# Generate .env file from build args
RUN echo "VITE_STRAPI_API_URL=${VITE_STRAPI_API_URL}" > .env && \
    echo "VITE_STRAPI_API_TOKEN=${VITE_STRAPI_API_TOKEN}" >> .env && \
    echo "VITE_STRIPE_PUBLISHABLE_KEY=${VITE_STRIPE_PUBLISHABLE_KEY}" >> .env && \
    echo "VITE_GOOGLE_RECAPTCHA_SITE_KEY=${VITE_GOOGLE_RECAPTCHA_SITE_KEY}" >> .env && \
    echo "VITE_GOOGLE_MAPS_KEY=${VITE_GOOGLE_MAPS_KEY}" >> .env && \
    echo "VITE_GOOGLE_GA_TRACKING_ID=${VITE_GOOGLE_GA_TRACKING_ID}" >> .env && \
    echo "VITE_ACTIVATE_ANALYTICS=${VITE_ACTIVATE_ANALYTICS}" >> .env && \
    echo "VITE_PLAUSIBLE_DATA_DOMAIN=${VITE_PLAUSIBLE_DATA_DOMAIN}" >> .env && \
    echo "VITE_NEXT_URL=${VITE_NEXT_URL}" >> .env

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html/saas

# Copy nginx config or create default SPA config
COPY donaction-saas/nginx/nginx.conf* /tmp/
RUN if [ -f /tmp/nginx.conf ]; then \
      cp /tmp/nginx.conf /etc/nginx/conf.d/default.conf; \
    else \
      printf 'server {\n  listen 80;\n  root /usr/share/nginx/html/saas;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' > /etc/nginx/conf.d/default.conf; \
    fi

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
