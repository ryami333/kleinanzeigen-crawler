# Use an official Node.js image
FROM node:22-slim

# Set working directory
WORKDIR /app

RUN corepack enable yarn

# Copy dependency definitions
COPY package.json .yarnrc.yml yarn.lock ./

# Install dependencies with Yarn
RUN yarn install --immutable

# Copy the rest of the app (including crawler.ts)
COPY . .

RUN yarn vite build

ENV TZ=Europe/Berlin

RUN chown -R 1000:1000 /app
USER 1000:1000

# Deliberately no CMD - one instance needs to run `node ./lib/worker.ts` and 
# the other needs to run `yarn start`.

