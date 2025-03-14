FROM node:16-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 6001
CMD ["node", "server.js"]