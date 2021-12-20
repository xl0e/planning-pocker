FROM node:17-alpine

WORKDIR /home/app

RUN npm install --unsafe-perm

CMD npm run serve
