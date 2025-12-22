FROM node:20-alpine AS builder

ARG ENV=prod

WORKDIR /app

COPY donaction-saas/package*.json ./

RUN npm install

COPY donaction-saas ./

RUN cp .env.${ENV} .env

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html/saas

COPY donaction-saas/nginx/nginx.conf /etc/nginx/conf.d/default.conf 2>/dev/null || echo "server { listen 80; root /usr/share/nginx/html/saas; index index.html; location / { try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
