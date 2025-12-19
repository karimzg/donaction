ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine as base
ARG ENV=development
ARG STRAPI_ENFORCE_SOURCEMAPS=true
ENV STRAPI_ENFORCE_SOURCEMAPS=${STRAPI_ENFORCE_SOURCEMAPS}
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git graphicsmagick imagemagick ghostscript
WORKDIR /usr/src/app

FROM base as deps
#RUN npm cache clean --force
COPY ./donaction-api/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev

FROM deps as build
RUN --mount=type=cache,target=/root/.npm \
    npm install
COPY ./donaction-api .
COPY ./donaction-api/.env.${ENV} ./.env
RUN npm run build --ignore-prompts

FROM base as final
ENV NODE_ENV development
#ENV PATH ./node_modules/.bin:$PATH
#USER node
#ARG UID=10001
#RUN adduser \
#    --disabled-password \
#    --gecos "" \
#    --home "/nonexistent" \
#    --shell "/sbin/nologin" \
#    --no-create-home \
#    --uid "${UID}" \
#    appuser
#USER appuser
COPY ./donaction-api/config /usr/src/app/config/
COPY ./donaction-api/data/ /usr/src/app/data/
COPY ./donaction-api/database /usr/src/app/database/
COPY ./donaction-api/public/ /usr/src/app/public/
COPY ./donaction-api/donaction-gcc-config.json /usr/src/app/donaction-gcc-config.json
COPY ./donaction-api/tsconfig.json /usr/src/app/tsconfig.json
COPY --from=deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist
RUN echo ${STRAPI_ENFORCE_SOURCEMAPS}
EXPOSE 1437
CMD npm run develop -- --debug
