FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build && echo "Build complete" && ls -la dist/

EXPOSE 3000

CMD ["npm", "run", "start:prod"]