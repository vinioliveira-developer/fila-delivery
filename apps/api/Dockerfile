FROM node:24-slim

WORKDIR /app

ENV NODE_ENV=production

COPY apps/api/package.json ./package.json
COPY apps/api/src ./src

RUN mkdir -p /app/data /app/backups

EXPOSE 3333

CMD ["node", "--experimental-sqlite", "src/server.js"]
