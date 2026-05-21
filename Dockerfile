FROM node:18-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

RUN npx prisma generate

RUN npm run build

CMD ["npm", "start"]