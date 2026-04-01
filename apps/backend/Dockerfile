FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci

COPY apps/backend ./apps/backend
RUN npm run build -w apps/backend

EXPOSE 3000
CMD ["node","apps/backend/dist/main.js"]
