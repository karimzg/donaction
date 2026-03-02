ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine as base
ARG NODE_ENV=production

# Only non-secret config needed at build time
# Secrets are injected at RUNTIME via docker-compose env_file / environment
ARG ENVIRONMENT
ARG STRAPI_PUBLIC_URL

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

# Minimal build-time .env (NO secrets — they are injected at runtime)
# Strapi admin build only needs NODE_ENV and STRAPI_PUBLIC_URL
RUN echo 'NODE_ENV="'"${NODE_ENV}"'"' > .env && \
    echo 'ENVIRONMENT="'"${ENVIRONMENT}"'"' >> .env && \
    echo 'STRAPI_PUBLIC_URL="'"${STRAPI_PUBLIC_URL}"'"' >> .env
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
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/dist/config ./config
COPY --from=build /usr/src/app/public ./public
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/database ./database
COPY --from=build /usr/src/app/types ./types
COPY --from=build /usr/src/app/src ./src
COPY --from=build /usr/src/app/data ./data
COPY --from=build /usr/src/app/tsconfig.json ./tsconfig.json
#COPY --from=build /usr/src/app ./
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
