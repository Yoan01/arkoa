# Étape 1 : Builder
FROM node:20-alpine AS builder

# Créer le dossier de l'app
WORKDIR /app

# Copier les fichiers nécessaires
COPY package.json package-lock.json* ./  
RUN npm ci

# Copier le reste des fichiers (code source)
COPY . .

# Construire l'app en standalone
RUN npm run build

# Étape 2 : Image finale légère
FROM node:20-alpine AS runner

WORKDIR /app

# Copier uniquement ce qui est nécessaire depuis le builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Exposer le port utilisé par Next.js
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "start"]
