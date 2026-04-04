FROM node:20-alpine AS builder
WORKDIR /workspace

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN HUSKY=0 npm ci --ignore-scripts

COPY apps/backend ./apps/backend
RUN npm run prisma:generate -w apps/backend
RUN npm run build -w apps/backend

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN HUSKY=0 npm ci --omit=dev --ignore-scripts

COPY apps/backend/prisma/schema.prisma ./apps/backend/prisma/schema.prisma
RUN cd apps/backend && npx prisma generate --schema prisma/schema.prisma

COPY --from=builder /workspace/apps/backend/dist ./apps/backend/dist

EXPOSE 3000
CMD ["node","apps/backend/dist/main.js"]
