# install stage
FROM lts-alpine AS install
WORKDIR /data/app
COPY package*.json .npmrc ./
RUN npm ci

# build stage
FROM install AS build
WORKDIR /data/app
COPY . .
#COPY ./app-config.js ./app-config.js

CMD [ "npm", "run", "dev"]
