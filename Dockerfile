FROM redis:8-alpine AS redis

# Use an official Node.js image
FROM node:22-alpine

COPY --from=redis /usr/local/bin/redis-server /usr/local/bin/redis-server
COPY --from=redis /usr/local/bin/redis-cli    /usr/local/bin/redis-cli

# Set working directory
WORKDIR /app

RUN corepack enable yarn

# Copy dependency definitions
COPY package.json .yarnrc.yml yarn.lock ./

# Install dependencies with Yarn
RUN yarn install --immutable

EXPOSE 6379

# Copy the rest of the app (including crawler.mjs)
ADD lib ./lib

ENTRYPOINT ["/bin/sh", "-c", "redis-server --port 6379 & exec \"$@\"", "--"]

CMD ["node", "./lib/main.mjs"]
