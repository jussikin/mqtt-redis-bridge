# Build stage
FROM node:18-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies
RUN npm ci

# Copy source files
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /usr/src/app/dist ./dist

# Use node user instead of root for security
USER node

# Environment variables will be passed at runtime
ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"]
