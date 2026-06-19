FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build:backend
RUN npm run build:frontend

EXPOSE 3000 5000

# Start both frontend and backend
CMD ["npm", "run", "start"]
