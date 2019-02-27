FROM node:11-alpine

EXPOSE 3010
ENV BUNDLE_INSTALL /bundle
WORKDIR $BUNDLE_INSTALL

COPY ./package.json $BUNDLE_INSTALL/package.json
COPY ./package-lock.json $BUNDLE_INSTALL/package-lock.json

RUN npm i -g npm
RUN npm ci

COPY . $BUNDLE_INSTALL

RUN ln -s /bundle/bin/index.js /usr/bin/bundle
CMD ["bundle"]
