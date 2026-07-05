# Build stage
FROM node:22-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install

# Runtime stage
FROM node:22-slim
RUN apt-get update && apt-get install -y ca-certificates curl wget && apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN chown -R 1000:1000 /app/data /app/public /app/database 2>/dev/null; chown 1000:1000 /app 2>/dev/null || true
USER 1000:1000
EXPOSE 3000
CMD ["node", "server.js"]
