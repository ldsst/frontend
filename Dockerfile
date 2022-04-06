FROM node:10-alpine as BUILD
WORKDIR /app
ARG API_URL
ARG SOCKET_URL

RUN apk update && apk add yarn python g++ make && rm -rf /var/cache/apk/*

COPY package.json yarn.lock ./
RUN yarn install --production=false --frozen-lockfile
COPY . .
RUN yarn run build

EXPOSE 3000

CMD [ "yarn", "start" ]

