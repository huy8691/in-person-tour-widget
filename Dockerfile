# =========================
# Build stage
# =========================
FROM node:20-bullseye AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# ---- BUILD ARGS (passed from docker build) ----
ARG NEXT_PUBLIC_TARGET_ENV
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_BASE_URL

# ---- MAKE THEM AVAILABLE DURING BUILD ----
ENV NEXT_PUBLIC_TARGET_ENV=$NEXT_PUBLIC_TARGET_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Debug env
RUN echo "✅ BUILD ENV:" && env | grep NEXT_PUBLIC || true

# ---- Build Next.js ----
RUN npm run build

# =========================
# Runtime stage
# =========================
FROM node:20-bullseye AS runtime
WORKDIR /app

# Copy build artifacts
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# ---- COPY ENV TO RUNTIME ----
ARG NEXT_PUBLIC_TARGET_ENV
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_BASE_URL

ENV NEXT_PUBLIC_TARGET_ENV=$NEXT_PUBLIC_TARGET_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL

# Expose and start
ENV PORT=8080
EXPOSE 8080
USER node

CMD ["npx", "next", "start", "-p", "8080"]
