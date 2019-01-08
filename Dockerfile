FROM node:8
MAINTAINER Jason <jasonlikenfs@gmail.com>

# For Production
# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY . /usr/src/app

EXPOSE 3000
CMD [ "npm", "run", "deploy" ]
