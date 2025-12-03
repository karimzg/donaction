FROM node:20 AS builder

WORKDIR /app

COPY /klubr-admin/package*.json ./

RUN npm install --legacy-peer-deps

COPY /klubr-admin .

RUN ls -la /app/src/public && rm /app/src/public/manifest.webmanifest && ls -la /app/src/public && mv /app/src/public/manifest-re7.webmanifest /app/src/public/manifest.webmanifest && ls -la /app/src/public
RUN sed -i 's/<!--<link rel="manifest" href="\/public\/manifest.webmanifest">-->/<link rel="manifest" href="\/admin\/public\/manifest.webmanifest">/' /app/src/index.html
RUN npm run build -- --configuration=re7 --base-href=/admin/

FROM nginx:latest

COPY --from=builder /app/dist/klubr-admin/browser /usr/share/nginx/html/admin
COPY /klubr-admin/nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
#EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
#comment
