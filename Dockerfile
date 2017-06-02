FROM node:8
MAINTAINER Jason <jasonlikenfs@gmail.com>

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app
# RUN npm config set registry http://registry.npm.taobao.org
RUN npm install
RUN npm run build


EXPOSE 3000
CMD [ "npm", "start" ]