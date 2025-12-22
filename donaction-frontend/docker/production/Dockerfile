# phase build

FROM node:18-alpine AS builder

ARG ENV=prod

WORKDIR /app-saas
COPY ./donaction-saas ./
RUN npm install
RUN cp .env.${ENV} .env
RUN npm run build

WORKDIR /app-build
COPY ./donaction-frontend ./
RUN cp .env.${ENV} .env && npm install && npm run build
RUN cp -R ../app-saas/build/donaction-web-components public/donaction-web-components

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app-build/public ./public
RUN mkdir .next
COPY --from=builder  /app-build/.next/standalone ./
COPY --from=builder  /app-build/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
#commentt
