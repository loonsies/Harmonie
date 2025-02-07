FROM node:22-alpine

WORKDIR /app
COPY ./bbmp/package*.json ./

CMD ["sh", "-c", "npm install && npm run migrate && npm run dev"]
