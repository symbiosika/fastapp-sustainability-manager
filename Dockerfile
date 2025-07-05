# Stage 1: Build the Bun backend
FROM oven/bun:1 AS backend-builder
WORKDIR /usr/src/app/backend
COPY backend/package.json backend/bun.lock ./
RUN bun install
COPY backend/ .
# remove the .env file
RUN rm -f .env
RUN rm -f ./src/fastapp-framework/.env
RUN bun run build

# Stage 2: Build the frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /usr/src/app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 3: Final image
FROM oven/bun:1 AS release
WORKDIR /usr/src/app

# Install Drizzle-kit
RUN bun i -g drizzle-orm
RUN bun i -g pg
RUN bun i -g drizzle-kit

# Copy the built backend code from the builder stage
COPY --from=backend-builder /usr/src/app/backend/dist ./dist

# Copy the package.json file from the builder stage
COPY --from=backend-builder /usr/src/app/backend/package.json ./package.json

# Copy the "static" and "public" folders from the backend first
COPY --from=backend-builder /usr/src/app/backend/static ./static
COPY --from=backend-builder /usr/src/app/backend/public ./public

# Copy the built frontend to static directory
COPY --from=frontend-builder /usr/src/app/frontend/dist/static ./static

# Copy drizzle configuration and migrations
COPY --from=backend-builder /usr/src/app/backend/drizzle.config.ts ./
COPY --from=backend-builder /usr/src/app/backend/drizzle.fastapp.config.ts ./
COPY --from=backend-builder /usr/src/app/backend/drizzle-sql ./drizzle-sql
COPY --from=backend-builder /usr/src/app/backend/src/fastapp-framework/drizzle-sql ./src/fastapp-framework/drizzle-sql
COPY --from=backend-builder /usr/src/app/backend/src/lib/db/db-schema.ts ./src/lib/db/db-schema.ts
COPY --from=backend-builder /usr/src/app/backend/src/fastapp-framework ./src/fastapp-framework

# COPY all artifacts
COPY ./dist/public/manage ./public/manage

# Expose the port your app runs on
EXPOSE 3000

# Run the app
CMD ["sh", "-c", "bun run fastapp:migrate && bun run migrate && bun ./dist/index.js"]
