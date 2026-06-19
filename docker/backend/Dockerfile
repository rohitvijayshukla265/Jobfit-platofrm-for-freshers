FROM node:18-alpine
WORKDIR /app

# Install PM2 globally
RUN npm install -g pm2

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build:server # Assuming there's a tsx build script or just running ts-node

EXPOSE 5000
CMD ["pm2-runtime", "start", "server/index.ts", "-i", "4", "--name", "careerpilot-api"]
