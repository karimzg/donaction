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
COPY ./klubr-saas/package*.json ./
COPY ./klubr-saas/.env ./
RUN npm install
COPY ./klubr-saas .

WORKDIR /app

ENV PORT=3000
COPY ./klubr-frontend/package*.json ./
COPY ./klubr-frontend/.env ./
# TODO: check --legacy-peer-deps in other envs
RUN npm install --legacy-peer-deps
COPY ./klubr-frontend .
EXPOSE 3000

CMD ["npm", "run", "dev"]
