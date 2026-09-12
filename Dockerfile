# Build static Expo web, serve with nginx (SPA + /api proxy to Spring Boot).
FROM node:22-bookworm AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Same-origin by default: browser calls /api/... and nginx proxies to the API container.
# Override at build time if the API is on another host, e.g.:
#   --build-arg EXPO_PUBLIC_API_BASE_URL=https://api.example.com
ARG EXPO_PUBLIC_API_BASE_URL=
ENV EXPO_PUBLIC_API_BASE_URL=$EXPO_PUBLIC_API_BASE_URL
ENV EXPO_NO_TELEMETRY=1
ENV CI=1

RUN npx expo export -p web

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
