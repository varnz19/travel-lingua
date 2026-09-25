# ==========================================
# Stage 1: Build the Expo Web application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install system utilities needed for building native modules if any
RUN apk add --no-cache python3 make g++

# Copy package manifests first to leverage Docker layer caching
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm ci --legacy-peer-deps

# Copy all application source code
COPY . .

# Set production environment variables
ENV NODE_ENV=production
ENV CI=1
ENV EXPO_NO_TELEMETRY=1
ENV EXPO_USE_FAST_RESOLVER=1

# Build static web export with Expo Router
RUN npx expo export -p web

# ==========================================
# Stage 2: Serve with lightweight Nginx Alpine
# ==========================================
FROM nginx:alpine AS runner

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration for SPA routing & reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
