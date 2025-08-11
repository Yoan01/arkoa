# Guide de déploiement - Arkoa

## Vue d'ensemble

Ce guide détaille les stratégies de déploiement pour l'application Arkoa, de l'environnement de développement à la production en utilisant Docker et Dokploy.

## Table des matières

- [Prérequis](#prérequis)
- [Environnements](#environnements)
- [Déploiement local](#déploiement-local)
- [Déploiement avec Docker](#déploiement-avec-docker)
- [CI/CD avec GitHub Actions et Dokploy](#cicd-avec-github-actions-et-dokploy)
- [Monitoring et maintenance](#monitoring-et-maintenance)
- [Rollback et récupération](#rollback-et-récupération)

## Prérequis

### Infrastructure minimale

#### Développement
- **CPU** : 2 cores
- **RAM** : 4 GB
- **Stockage** : 20 GB
- **OS** : macOS, Linux, Windows

#### Staging
- **CPU** : 2 cores
- **RAM** : 8 GB
- **Stockage** : 50 GB
- **OS** : Linux (Ubuntu 20.04+ recommandé)

#### Production
- **CPU** : 4+ cores
- **RAM** : 16+ GB
- **Stockage** : 100+ GB SSD
- **OS** : Linux (Ubuntu 20.04+ recommandé)
- **Base de données** : PostgreSQL 14+ (instance séparée recommandée)

### Logiciels requis

```bash
# Node.js et pnpm
node --version  # v20.x.x+
pnpm --version  # v8.x.x+

# Docker (optionnel mais recommandé)
docker --version
docker-compose --version

# Git
git --version

# PostgreSQL client
psql --version
```

## Environnements

### Configuration des environnements

#### Development (.env.development)
```bash
# Base de données locale
DATABASE_URL="postgresql://arkoa_user:password@localhost:5432/arkoa"

# Authentification
BETTER_AUTH_SECRET="dev-secret-key-32-characters-min"
BETTER_AUTH_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Debug
DEBUG="true"
LOG_LEVEL="debug"
```

#### Staging (.env.staging)
```bash
# Base de données staging
DATABASE_URL="postgresql://arkoa_staging:secure_password@staging-db:5432/arkoa_staging"

# Authentification
BETTER_AUTH_SECRET="staging-secret-key-very-secure-32-chars-min"
BETTER_AUTH_URL="https://staging.arkoa.app"

# Environnement
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://staging.arkoa.app"

# Logs
LOG_LEVEL="info"
```

#### Production (.env.production)
```bash
# Base de données production
DATABASE_URL="postgresql://arkoa_prod:very_secure_password@prod-db:5432/arkoa"

# Authentification
BETTER_AUTH_SECRET="production-secret-key-extremely-secure-64-chars-minimum"
BETTER_AUTH_URL="https://arkoa.app"

# Environnement
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://arkoa.app"

# Logs
LOG_LEVEL="warn"
```

## Déploiement local

### Installation rapide

```bash
# Cloner le projet
git clone https://github.com/your-org/arkoa.git
cd arkoa

# Installer les dépendances
pnpm install

# Configurer l'environnement
# Créer un fichier .env avec vos paramètres
# DATABASE_URL="postgresql://user:password@localhost:5432/arkoa"
# BETTER_AUTH_SECRET="your-secret-key"

# Générer le client Prisma
npx prisma generate

# Démarrer l'application
pnpm dev
```

### Vérification de l'installation

```bash
# Vérifier que l'application fonctionne
curl http://localhost:3000/api/health

# Exécuter les tests
pnpm test:ci

# Exécuter les tests d'intégration
pnpm test:integration:ci

# Exécuter les tests E2E
pnpm test:e2e

# Vérifier le build de production
pnpm build
pnpm start
```

## Déploiement avec Docker

### Docker Compose - Staging

```yaml
# docker-compose.staging.yml
version: "3.9"

services:
  web:
    build: .
    ports:
      - 4001:3000
    environment:
      - BETTER_AUTH_SECRET
      - BETTER_AUTH_URL
      - DATABASE_URL
      - NODE_ENV
    command: pnpm start
```

### Docker Compose - Production

```yaml
# docker-compose.production.yml
version: "3.9"

services:
  web:
    build: .
    ports:
      - 4000:3000
    environment:
      - BETTER_AUTH_SECRET
      - BETTER_AUTH_URL
      - DATABASE_URL
      - NODE_ENV
    command: pnpm start
```

### Dockerfile

```dockerfile
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

EXPOSE 3000

CMD ["pnpm", "start"]
```

### Commandes de déploiement Docker

```bash
# Staging
docker-compose -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.production.yml up -d

# Build local
docker build -t arkoa:latest .

# Arrêter les services
docker-compose down

# Voir les logs
docker-compose logs -f web
```

## CI/CD avec GitHub Actions et Dokploy

### Configuration GitHub Actions

Le projet utilise GitHub Actions pour l'intégration continue et le déploiement automatique via Dokploy.

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [prod, staging]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  test-and-deploy:
    name: Test and Deploy
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}
          
      - name: Install dependencies
        run: pnpm install --no-frozen-lockfile
        
      - name: TypeScript check
        run: pnpm ts:fix
        
      - name: Lint check
        run: pnpm lint
        
      - name: Run tests
        run: pnpm test:ci
        
      - name: Build application
        run: pnpm build
        
      - name: Deploy to Staging
        if: github.ref == 'refs/heads/staging'
        run: |
          curl -X POST \
            "${{ secrets.DOKPLOY_URL }}/api/compose.deploy" \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H "x-api-key: ${{ secrets.DOKPLOY_API_KEY }}" \
            -d '{
              "composeId": "${{ secrets.STAGING_APP_ID }}"
            }'
          
      - name: Deploy to Production
        if: github.ref == 'refs/heads/production'
        run: |
          curl -X POST \
            "${{ secrets.DOKPLOY_URL }}/api/compose.deploy" \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H "x-api-key: ${{ secrets.DOKPLOY_API_KEY }}" \
            -d '{
              "composeId": "${{ secrets.PRODUCTION_APP_ID }}"
            }'
```

### Configuration Dokploy

Le déploiement se fait via Dokploy avec les secrets GitHub suivants :

- `DOKPLOY_URL` : URL de l'instance Dokploy
- `DOKPLOY_API_KEY` : Clé API pour l'authentification
- `STAGING_APP_ID` : ID de l'application staging dans Dokploy
- `PRODUCTION_APP_ID` : ID de l'application production dans Dokploy

### Branches de déploiement

- **staging** : Déploie automatiquement vers l'environnement de staging
- **prod** : Déploie automatiquement vers l'environnement de production

### Scripts de test disponibles

```bash
# Tests unitaires avec couverture
pnpm test:ci

# Tests d'intégration avec couverture
pnpm test:integration:ci

# Tests E2E avec Playwright
pnpm test:e2e

# Tous les tests
pnpm test:all
```

## Monitoring et maintenance

### Health Checks

L'application dispose d'un endpoint de health check basique :

```bash
# Vérifier le statut de l'application
curl http://localhost:3000/api/health
```

**Fonctionnalités disponibles :**
- Endpoint `/api/health` basique
- Vérification de la connexion base de données
- Status de l'application

### Logging

**Système de logging actuel :**
- Logs Next.js intégrés (console.log, console.error)
- Logs Docker accessibles via `docker logs`
- Variables d'environnement LOG_LEVEL pour le contrôle

```bash
# Voir les logs en temps réel
docker-compose logs -f web

# Voir les logs avec timestamps
docker-compose logs -t web
```

### Métriques

**Métriques disponibles :**
- Health checks via `/api/health`
- Métriques Prisma (via le client généré)
- Métriques système Docker
- Logs d'application Next.js

### Variables d'environnement de monitoring

```bash
# Contrôle du niveau de logs
LOG_LEVEL="info"  # debug, info, warn, error

# Mode debug pour le développement
DEBUG="true"
```

## Rollback et récupération

### Stratégie de rollback

#### Rollback via Dokploy

Le rollback se fait directement via l'interface Dokploy ou en redéployant une version précédente :

```bash
# Rollback via API Dokploy (remplacer les variables)
curl -X POST \
  "${DOKPLOY_URL}/api/compose.deploy" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -H "x-api-key: ${DOKPLOY_API_KEY}" \
  -d '{
    "composeId": "${APP_ID}"
  }'
```

#### Rollback local

```bash
#!/bin/bash
# rollback-local.sh

set -e

echo "🔄 Rollback local"

# 1. Arrêter le service actuel
echo "🛑 Arrêt du service actuel..."
docker-compose down

# 2. Redémarrer avec rebuild
echo "🔄 Redémarrage..."
docker-compose up -d --build

# 3. Vérifier le statut
echo "⏳ Vérification du statut..."
sleep 30
curl -f http://localhost:3000/api/health || echo "❌ Service non disponible"

echo "✅ Rollback terminé avec succès!"
```

### Sauvegarde automatique avec Dokploy et Backblaze

**Configuration actuelle :**
Les sauvegardes de la base de données sont automatiquement gérées par Dokploy et stockées sur Backblaze avec une fréquence hebdomadaire.

**Fonctionnalités :**
- **Fréquence** : Sauvegarde automatique chaque semaine
- **Stockage** : Backblaze B2 Cloud Storage
- **Gestion** : Intégrée dans Dokploy
- **Rétention** : Configurée selon les besoins de l'entreprise
- **Chiffrement** : Sauvegardes chiffrées en transit et au repos

**Avantages :**
- Aucune intervention manuelle requise
- Stockage cloud sécurisé et redondant
- Intégration native avec l'infrastructure de déploiement
- Monitoring et alertes automatiques en cas d'échec

**Restauration :**
En cas de besoin, la restauration se fait via l'interface Dokploy ou en contactant l'équipe d'administration système.

**Sauvegarde manuelle d'urgence :**
```bash
#!/bin/bash
# backup-manual.sh - Sauvegarde manuelle d'urgence

set -e

DB_HOST=${DB_HOST:-"localhost"}
DB_NAME=${DB_NAME:-"arkoa"}
DB_USER=${DB_USER:-"arkoa_user"}
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="arkoa_emergency_backup_${DATE}.sql"

echo "💾 Sauvegarde manuelle d'urgence..."
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} > ${BACKUP_FILE}
gzip ${BACKUP_FILE}
echo "✅ Sauvegarde d'urgence terminée: ${BACKUP_FILE}.gz"
```

### Plan de récupération d'urgence

#### Procédures d'urgence

**1. Application inaccessible**
1. Vérifier le health check: `curl https://arkoa.app/api/health`
2. Vérifier les logs: `docker-compose logs web`
3. Redémarrer le service: `docker-compose restart web`
4. Si échec: rollback via Dokploy ou redéploiement

**2. Base de données corrompue**
1. Arrêter l'application
2. Restaurer depuis la dernière sauvegarde
3. Appliquer les migrations manquantes avec `npx prisma migrate deploy`
4. Redémarrer l'application

**3. Problème de déploiement**
1. Vérifier les logs GitHub Actions
2. Vérifier la connectivité avec Dokploy
3. Redéployer manuellement si nécessaire
4. Rollback vers la version précédente

**4. Perte de données**
1. Identifier l'étendue de la perte
2. Restaurer depuis la sauvegarde la plus récente
3. Récupérer les données depuis les logs si possible
4. Informer les utilisateurs affectés

---

**Ce guide de déploiement couvre les aspects essentiels pour mettre en production l'application Arkoa en utilisant Docker et Dokploy pour un déploiement automatisé et fiable.**

**Version**: 2.0.0  
**Dernière mise à jour**: août 2025