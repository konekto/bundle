FROM node:latest

EXPOSE 3010

COPY . /bundle
WORKDIR /bundle

RUN npm install

WORKDIR /

CMD ["./bundle/bin/index.js"]
