# Use an official Node.js image
FROM node:24-slim

# Set working directory
WORKDIR /app
RUN chown 1000:1000 /app

RUN corepack enable yarn
USER 1000:1000

# Copy dependency definitions
COPY --chown=1000:1000 package.json .yarnrc.yml yarn.lock ./

# Install dependencies with Yarn
RUN yarn install --immutable

# Copy the rest of the app (including crawler.ts)
COPY --chown=1000:1000 . .

RUN yarn vite build

ENV TZ=Europe/Berlin

# Deliberately no CMD - one instance needs to run `node ./lib/worker.ts` and 
# the other needs to run `yarn start`.

