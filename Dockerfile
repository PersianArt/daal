FROM node:20-alpine AS builder

WORKDIR /app

COPY prisma ./prisma

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x /app/docker-entrypoint.sh

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]

ENTRYPOINT [ "/app/docker-entrypoint.sh" ]
