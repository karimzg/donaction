FROM node:20-alpine
#FROM node:18-alpine

WORKDIR /app

COPY ./klubr-admin/package*.json ./
#COPY ./.env ./

RUN npm install --legacy-peer-deps

COPY ./klubr-admin .

EXPOSE 4200

CMD ["npm", "start"]
