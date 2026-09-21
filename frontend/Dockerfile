# Stage 1: Build the Vite React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build argument for API URL if known at build time (defaults to empty for same-origin proxy)
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.27-alpine

# Default backend service target for reverse proxy
ENV BACKEND_HOST=sprnt-backend \
    BACKEND_PORT=8000

# Copy build artifacts to nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config template (envsubst replaces ${BACKEND_HOST} and ${BACKEND_PORT} at container startup)
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
