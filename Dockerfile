# Use an official Node.js image
FROM ghcr.io/puppeteer/puppeteer:latest

# Set working directory
WORKDIR /app

# Because the puppeteer image changes the user, for some reason:
USER root

RUN corepack enable yarn

# Copy dependency definitions
COPY package.json .yarnrc.yml yarn.lock ./

# Install dependencies with Yarn
RUN yarn install --immutable

# Copy the rest of the app (including crawler.mjs)
ADD lib ./lib

# Set the command to run the crawler script
CMD ["node", "./lib/crawler.mjs"]