FROM node:20-alpine

# Install OpenJDK 21 & wget for Lavalink
RUN apk add --no-cache openjdk21-jre wget

WORKDIR /opt/lavalink

# Copy package and install node proxy dependencies
COPY package.json package.json
RUN npm install --production

# Download Lavalink.jar directly during build if missing
RUN wget https://github.com/lavalink-devs/Lavalink/releases/download/4.2.2/Lavalink.jar -O Lavalink.jar

# Copy Lavalink and Server configuration files
COPY application.yml application.yml
COPY index.html index.html
COPY server.js server.js

EXPOSE 10000

CMD ["npm", "start"]

