FROM node:17-alpine

WORKDIR /home/app

COPY . .

RUN npm install --unsafe-perm

CMD npm run serve
