FROM node:9

EXPOSE 3010

COPY . /bundle
WORKDIR /bundle

RUN npm i -g npm
RUN npm ci

RUN mkdir /app
WORKDIR /app

CMD /bundle/bin/index.js
