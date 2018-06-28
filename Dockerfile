FROM node:9-alpine

EXPOSE 3010

COPY . /bundle
WORKDIR /bundle

RUN npm i -g npm
RUN npm ci

WORKDIR /app

CMD ["/bundle/bin/index.js"]
