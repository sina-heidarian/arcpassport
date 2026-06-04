FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --no-fund --prefer-offline

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]