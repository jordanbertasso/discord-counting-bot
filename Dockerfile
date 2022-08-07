FROM node:18-slim

RUN apt update && apt install openssl -y

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . ./

RUN yarn run prisma migrate dev --name init

RUN yarn build

EXPOSE 3000

ENTRYPOINT [ "./docker-entrypoint.sh" ]
