FROM node:latest

EXPOSE 3010

COPY . /bundle
WORKDIR /bundle

RUN npm i -g npm
RUN npm ci

WORKDIR /

CMD /bundle/bin/index.js
