FROM node:20-alpine
#FROM node:18-alpine

WORKDIR /app

COPY ./donaction-admin/package*.json ./
#COPY ./.env ./

RUN npm install --legacy-peer-deps

COPY ./donaction-admin .

EXPOSE 4200

CMD ["npm", "start"]
