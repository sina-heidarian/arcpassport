FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]