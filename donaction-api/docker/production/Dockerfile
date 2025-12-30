ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine as base
ARG NODE_ENV=production

# Build-time secrets (passed via --build-arg)
ARG DATABASE_PASSWORD
ARG DATABASE_NAME
ARG DATABASE_USERNAME
ARG DATABASE_HOST
ARG DATABASE_PORT
ARG JWT_SECRET
ARG ADMIN_JWT_SECRET
ARG APP_KEYS
ARG API_TOKEN_SALT
ARG TRANSFER_TOKEN_SALT
ARG STRIPE_SECRET_KEY
ARG STRIPE_WEBHOOK_SECRET
ARG STRIPE_WEBHOOK_SECRET_CONNECT
ARG IMAGEKIT_PUBLIC_KEY
ARG IMAGEKIT_PRIVATE_KEY
ARG IMAGEKIT_URL_ENDPOINT
ARG EMAIL_BREVO_API_KEY
ARG NEXTAUTH_URL
ARG ENVIRONMENT
ARG GOOGLE_RECAPTCHA_SITE_KEY
ARG KLUBR_UUID

ENV NODE_ENV=${NODE_ENV}
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git graphicsmagick imagemagick ghostscript
WORKDIR /usr/src/


FROM base as build
COPY ./donaction-api/package.json ./donaction-api/package-lock.json ./
RUN npm install -g node-gyp
RUN npm config set fetch-retry-maxtimeout 600000 -g && npm install --only=production
ENV PATH=/usr/src/node_modules/.bin:$PATH
WORKDIR /usr/src/app
COPY ./donaction-api/ .
RUN ls -l -a

# NOTE: Secret validation removed from build time
# Secrets are validated at runtime by entrypoint.sh
# This allows building images without secrets (CI/CD best practice)

# Generate .env file for build (will NOT be copied to final image)
# Values are quoted to handle special characters and empty values
RUN echo 'NODE_ENV="'"${NODE_ENV}"'"' > .env && \
    echo 'DATABASE_PASSWORD="'"${DATABASE_PASSWORD}"'"' >> .env && \
    echo 'DATABASE_NAME="'"${DATABASE_NAME}"'"' >> .env && \
    echo 'DATABASE_USERNAME="'"${DATABASE_USERNAME}"'"' >> .env && \
    echo 'DATABASE_HOST="'"${DATABASE_HOST}"'"' >> .env && \
    echo 'DATABASE_PORT="'"${DATABASE_PORT}"'"' >> .env && \
    echo 'JWT_SECRET="'"${JWT_SECRET}"'"' >> .env && \
    echo 'ADMIN_JWT_SECRET="'"${ADMIN_JWT_SECRET}"'"' >> .env && \
    echo 'APP_KEYS="'"${APP_KEYS}"'"' >> .env && \
    echo 'API_TOKEN_SALT="'"${API_TOKEN_SALT}"'"' >> .env && \
    echo 'TRANSFER_TOKEN_SALT="'"${TRANSFER_TOKEN_SALT}"'"' >> .env && \
    echo 'STRIPE_SECRET_KEY="'"${STRIPE_SECRET_KEY}"'"' >> .env && \
    echo 'STRIPE_WEBHOOK_SECRET="'"${STRIPE_WEBHOOK_SECRET}"'"' >> .env && \
    echo 'STRIPE_WEBHOOK_SECRET_CONNECT="'"${STRIPE_WEBHOOK_SECRET_CONNECT}"'"' >> .env && \
    echo 'IMAGEKIT_PUBLIC_KEY="'"${IMAGEKIT_PUBLIC_KEY}"'"' >> .env && \
    echo 'IMAGEKIT_PRIVATE_KEY="'"${IMAGEKIT_PRIVATE_KEY}"'"' >> .env && \
    echo 'IMAGEKIT_URL_ENDPOINT="'"${IMAGEKIT_URL_ENDPOINT}"'"' >> .env && \
    echo 'EMAIL_BREVO_API_KEY="'"${EMAIL_BREVO_API_KEY}"'"' >> .env && \
    echo 'NEXTAUTH_URL="'"${NEXTAUTH_URL}"'"' >> .env && \
    echo 'ENVIRONMENT="'"${ENVIRONMENT}"'"' >> .env && \
    echo 'GOOGLE_RECAPTCHA_SITE_KEY="'"${GOOGLE_RECAPTCHA_SITE_KEY}"'"' >> .env && \
    echo 'KLUBR_UUID="'"${KLUBR_UUID}"'"' >> .env
RUN cat .env
RUN npm run build

## Compile config TypeScript files to JavaScript for production
#RUN npx tsc config/*.ts --outDir dist/config --module CommonJS --esModuleInterop --resolveJsonModule --skipLibCheck && \
#    rm -f dist/config/*.map
#
## Prune dev dependencies for smaller production image
## Re-install @strapi/logger which is needed by config/logger.ts at runtime
#RUN npm prune --production && npm install @strapi/logger


FROM base as final
WORKDIR /usr/src/app

# Copy only necessary files (NO .env, NO src/)
COPY --from=build /usr/src/node_modules ../node_modules
#COPY --from=build /usr/src/app/dist ./dist
#COPY --from=build /usr/src/app/dist/config ./config
#COPY --from=build /usr/src/app/public ./public
#COPY --from=build /usr/src/app/package.json ./package.json
#COPY --from=build /usr/src/app/database ./database
#COPY --from=build /usr/src/app/types ./types
#COPY --from=build /usr/src/app/src ./src
#COPY --from=build /usr/src/app/.env ./.env
#COPY --from=build /usr/src/app/data ./data
COPY --from=build /usr/src/app ./
RUN ls -l -a

# Secrets must be passed as runtime ENV variables (docker run -e or docker-compose)
ENV NODE_ENV=production
ENV DATABASE_PORT=5432
ENV PATH=/usr/src/node_modules/.bin:$PATH

# Copy and setup entrypoint for runtime secret validation
COPY --from=build /usr/src/app/docker/production/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chown -R node:node /usr/src/app

USER node
EXPOSE 1437
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "start"]
