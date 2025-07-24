# Build frontend
FROM node:18 AS build-frontend
WORKDIR /app/frontend
COPY frontend/ .
RUN npm install && npm run build

# Build backend
FROM node:18
WORKDIR /app
COPY backend/ ./backend/
COPY --from=build-frontend /app/frontend/build ./backend/public
WORKDIR /app/backend
RUN npm install

# Start server
CMD ["npm", "start"]
