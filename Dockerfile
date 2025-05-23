# Use an official Node.js image
FROM node:22-alpine

# Set working directory
WORKDIR /app

RUN corepack enable yarn

# Copy dependency definitions
COPY package.json .yarnrc.yml yarn.lock ./

# Install dependencies with Yarn
RUN yarn install --immutable

VOLUME /data

EXPOSE 6379

# Copy the rest of the app (including crawler.mjs)
ADD lib ./lib

ENV TZ=Europe/Berlin

# Deliberately no CMD - one instance needs to run `node ./lib/worker.mjs` and 
# the other needs to run `yarn start`.

