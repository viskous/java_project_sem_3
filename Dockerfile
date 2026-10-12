# Multi-Stage Build for Capital Core Online Banking System

# Stage 1: Build Backend & Frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm run setup

# Copy source code
COPY backend ./backend
COPY frontend ./frontend

# Build projects
RUN npm run build:backend
RUN npm run build:frontend

# Stage 2: Production Execution Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5001

COPY package*.json ./
COPY backend/package*.json ./backend/

# Install production dependencies only
RUN cd backend && npm install --omit=dev

# Copy built dist from builder
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/public_html

EXPOSE 5001

CMD ["node", "backend/dist/server.js"]
