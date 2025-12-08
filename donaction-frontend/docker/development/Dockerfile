# Use an official Node runtime as a parent image
FROM node:18-alpine

RUN apk add --no-cache \
    curl \
    bash \
    jq \
    tar \
    && curl -sSL https://github.com/stripe/stripe-cli/releases/download/v1.24.0/stripe_1.24.0_linux_x86_64.tar.gz -o stripe-cli.tar.gz \
    && tar -xvzf stripe-cli.tar.gz \
    && mv stripe /usr/local/bin/stripe \
    && rm -rf stripe-cli.tar.gz

RUN stripe --version

WORKDIR /app-saas
COPY ./donaction-saas/package*.json ./
COPY ./donaction-saas/.env ./
RUN npm install
COPY ./donaction-saas .

WORKDIR /app

ENV PORT=3000
COPY ./donaction-frontend/package*.json ./
COPY ./donaction-frontend/.env ./
# TODO: check --legacy-peer-deps in other envs
RUN npm install --legacy-peer-deps
COPY ./donaction-frontend .
EXPOSE 3000

CMD ["npm", "run", "dev"]
