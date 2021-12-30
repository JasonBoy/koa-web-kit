# install stage
FROM lts-alpine AS install
WORKDIR /data/app
COPY package*.json .npmrc ./
RUN npm ci

# install production dependence stage
FROM lts-alpine AS install_prod
WORKDIR /data/app
COPY package*.json .npmrc ./
RUN npm ci --production

# build stage
FROM install AS build
WORKDIR /data/app
#COPY --from=install /data/app .
COPY . .
RUN npm run build:noprogress

# run stage
FROM install_prod AS run
WORKDIR /data/app
COPY . .
COPY --from=build /data/app/build ./build
RUN rm -rf src Dockerfile app-config.js
ENV PATH /data/app/node_modules/.bin:$PATH
CMD [ "pm2-runtime", "pm2.config.js", "--env", "production" ]
