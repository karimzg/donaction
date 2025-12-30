# Pull SaaS assets from GHCR registry
ARG SAAS_VERSION=dev
FROM ghcr.io/karimzg/donaction-saas:${SAAS_VERSION} AS saas

# Build Frontend
FROM node:18-alpine AS builder

ARG NODE_ENV=production

# Frontend build args (NEXT_PUBLIC_*)
ARG NEXT_PUBLIC_ENVIRONMENT
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_API_URL
ARG STRAPI_PUBLIC_URL
ARG NEXT_CONTAINER_SITE_URL
ARG NEXT_PUBLIC_STRAPI_API_TOKEN
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
ARG NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_KEY
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_ACTIVATE_ANALYTICS
ARG NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN
ARG NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN
ARG NEXTAUTH_SECRET

# Validate required secrets
RUN if [ -z "$NEXT_PUBLIC_STRAPI_API_TOKEN" ]; then echo "ERROR: NEXT_PUBLIC_STRAPI_API_TOKEN is required" && exit 1; fi && \
    if [ -z "$NEXTAUTH_SECRET" ]; then echo "ERROR: NEXTAUTH_SECRET is required" && exit 1; fi

WORKDIR /app
COPY ./donaction-frontend ./

# Generate Frontend .env from build args
RUN echo "NEXT_PUBLIC_ENVIRONMENT=${NEXT_PUBLIC_ENVIRONMENT}" > .env && \
    echo "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}" >> .env && \
    echo "NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}" >> .env && \
    echo "NEXT_PUBLIC_SERVER_COMPONENTS_DEV_API_URL=${STRAPI_PUBLIC_URL}" >> .env && \
    echo "NEXT_PUBLIC_STRAPI_API_TOKEN=${NEXT_PUBLIC_STRAPI_API_TOKEN}" >> .env && \
    echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}" >> .env && \
    echo "NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=${NEXT_PUBLIC_GOOGLE_CLIENT_SECRET}" >> .env && \
    echo "NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY=${NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY}" >> .env && \
    echo "NEXT_PUBLIC_GOOGLE_MAPS_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_KEY}" >> .env && \
    echo "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}" >> .env && \
    echo "NEXT_PUBLIC_ACTIVATE_ANALYTICS=${NEXT_PUBLIC_ACTIVATE_ANALYTICS}" >> .env && \
    echo "NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN=${NEXT_PUBLIC_PLAUSIBLE_DATA_DOMAIN}" >> .env && \
    echo "NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN=${NEXT_PUBLIC_KLUBR_SPONSORSHIP_FORM_TOKEN}" >> .env && \
    echo "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}" >> .env && \
    echo "NEXT_CONTAINER_SITE_URL=${NEXT_CONTAINER_SITE_URL}" >> .env

RUN npm install --include=dev && npm run build

# Copy SaaS web components from registry image
COPY --from=saas /usr/share/nginx/html/saas/donaction-web-components ./public/donaction-web-components

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.env ./
COPY --from=builder /app/public ./public
RUN mkdir .next
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
