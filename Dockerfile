# Base image upon which subsequent data will be added.
# Found on Docker Hub: https://hub.docker.com/_/node/
FROM node:7.10-alpine

# Name of the author or maintainer as a single string.
MAINTAINER Rob McLarty <r@robmclarty.com> (https://robmclarty.com)

# Install system dependencies using Alpine Linux package manager.
# List of apk packages: https://pkgs.alpinelinux.org/packages
# (e.g., need gcc to compile npm packages with C bindings)
RUN apk add --update make gcc g++ git python

# Create directory to store app code.
RUN mkdir -p /opt/app/config/keys

# Change the current working directory to the new app directory.
WORKDIR /opt/app

# Install app dependencies from local source code.
# e.g., `COPY file1 file2 file3 /path/in/container`
COPY package.json .npmrc .sequelizerc /opt/app/
COPY config/server.js config/database.js /opt/app/config/
# Use env secrets instead of this
COPY config/keys /opt/app/config/keys
COPY server /opt/app/server
COPY db /opt/app/db
RUN npm install --production

# NOTE: node-alpine creates a group "node" and a user "node" and adds that user
# to that group for use in running the node app as a limited-priviledge user.
# Because this is included in the base image, we don't need to define this again
# with the following command, so it has been commented out.
# RUN groupadd -r node && useradd -r -g node node

# Set the user when running this image.
USER node

# Open ports to outside world.
EXPOSE 3000

# Start main process.
CMD ["node", "./server/start.js"]
