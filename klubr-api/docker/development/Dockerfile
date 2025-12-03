ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-alpine as base
ARG ENV=development
ARG STRAPI_ENFORCE_SOURCEMAPS=true
ENV STRAPI_ENFORCE_SOURCEMAPS=${STRAPI_ENFORCE_SOURCEMAPS}
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git graphicsmagick imagemagick ghostscript
WORKDIR /usr/src/app

FROM base as deps
#RUN npm cache clean --force
COPY ./klubr-api/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --omit=dev

FROM deps as build
RUN --mount=type=cache,target=/root/.npm \
    npm install
COPY ./klubr-api .
COPY ./klubr-api/.env.${ENV} ./.env
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
COPY ./klubr-api/config /usr/src/app/config/
COPY ./klubr-api/data/ /usr/src/app/data/
COPY ./klubr-api/database /usr/src/app/database/
COPY ./klubr-api/public/ /usr/src/app/public/
COPY ./klubr-api/klubr-gcc-config.json /usr/src/app/klubr-gcc-config.json
COPY ./klubr-api/tsconfig.json /usr/src/app/tsconfig.json
COPY --from=deps /usr/src/app/node_modules /usr/src/app/node_modules
COPY --from=build /usr/src/app/dist /usr/src/app/dist
RUN echo ${STRAPI_ENFORCE_SOURCEMAPS}
EXPOSE 1337
CMD npm run develop -- --debug
