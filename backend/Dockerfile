FROM node:18-alpine

WORKDIR /app

# Optimize by copying only package files first
COPY package*.json ./

RUN npm ci --only=production

COPY . .

# Expose backend port
EXPOSE 5000

CMD ["node", "src/server.js"]
