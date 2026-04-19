FROM node:20-alpine AS builder
WORKDIR /workspace
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN HUSKY=0 npm ci --ignore-scripts
RUN npm install -w apps/frontend --no-save @next/swc-linux-x64-musl@16.1.6 lightningcss-linux-x64-musl@1.31.1 @tailwindcss/oxide-linux-x64-musl@4.2.1
COPY apps/frontend ./apps/frontend
RUN npm run build -w apps/frontend

FROM node:20-alpine
WORKDIR /workspace
ENV NODE_ENV=production
COPY --from=builder /workspace/apps/frontend/public ./apps/frontend/public
COPY --from=builder /workspace/apps/frontend/.next/standalone ./
COPY --from=builder /workspace/apps/frontend/.next/static ./apps/frontend/.next/static
EXPOSE 3000
CMD ["node","apps/frontend/server.js"]
