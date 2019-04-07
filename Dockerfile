FROM node:latest

WORKDIR /data

# install and cache app dependencies
COPY package.json /data/package.json
RUN npm install

CMD npm start
