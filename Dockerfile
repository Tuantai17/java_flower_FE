# ================================
# FLOWER SHOP FRONTEND - Dockerfile
# Multi-stage build for production
# ================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build arguments for environment variables
ARG REACT_APP_API_URL=http://localhost:8080/api
ARG REACT_APP_UPLOAD_URL=http://localhost:8080/api/upload
ARG REACT_APP_NAME=FlowerCorner
ARG REACT_APP_HOTLINE=1900\ 633\ 045
ARG REACT_APP_GOOGLE_CLIENT_ID

# Set environment variables for build
ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_UPLOAD_URL=$REACT_APP_UPLOAD_URL
ENV REACT_APP_NAME=$REACT_APP_NAME
ENV REACT_APP_HOTLINE=$REACT_APP_HOTLINE
ENV REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

LABEL maintainer="FlowerCorner Team"
LABEL description="Flower Shop Frontend - React Application"

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Create non-root user for security
RUN addgroup -S nginx-fe && adduser -S nginx-fe -G nginx-fe && \
    chown -R nginx-fe:nginx-fe /usr/share/nginx/html && \
    chown -R nginx-fe:nginx-fe /var/cache/nginx && \
    chown -R nginx-fe:nginx-fe /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-fe:nginx-fe /var/run/nginx.pid

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
