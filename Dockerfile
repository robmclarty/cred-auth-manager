FROM node:6.2.2

MAINTAINER Rob McLarty <r@robmclarty.com> (robmclarty.com)

ADD package.json package.json
ADD yarn.lock yarn.lock
RUN npm install -g yarn
RUN yarn install

ADD ./config/server.js /config/server.js
ADD ./server /server

CMD ['npm', 'start']
