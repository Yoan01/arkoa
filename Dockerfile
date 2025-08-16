# Étape 1 : build
FROM node:20-alpine AS builder
WORKDIR /app

# Installer pnpm globalement
RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

RUN npx prisma generate

RUN pnpm build

# Étape 2 : runtime
FROM node:20-alpine
WORKDIR /app

RUN npm install -g pnpm

COPY package*.json pnpm-lock.yaml ./
RUN pnpm install --prod

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["pnpm", "start"]
