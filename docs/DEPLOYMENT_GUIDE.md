# Guide de déploiement - Arkoa

## Vue d'ensemble

Ce guide détaille les différentes stratégies de déploiement pour l'application Arkoa, de l'environnement de développement à la production.

## Table des matières

- [Prérequis](#prérequis)
- [Environnements](#environnements)
- [Déploiement local](#déploiement-local)
- [Déploiement avec Docker](#déploiement-avec-docker)
- [Déploiement cloud](#déploiement-cloud)
- [CI/CD](#cicd)
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
pnpm test

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
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - web
    restart: unless-stopped

volumes:
  postgres_prod_data:
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

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Commandes de déploiement Docker

```bash
# Staging
docker-compose -f docker-compose.staging.yml up -d

# Production
docker-compose -f docker-compose.production.yml up -d

# Build et push vers un registry
docker build -t arkoa:latest .
docker tag arkoa:latest your-registry.com/arkoa:latest
docker push your-registry.com/arkoa:latest

# Déploiement avec une image du registry
docker pull your-registry.com/arkoa:latest
docker-compose -f docker-compose.production.yml up -d
```

## Déploiement cloud

### Vercel (Recommandé pour Next.js)

#### Configuration Vercel

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "BETTER_AUTH_SECRET": "@auth-secret",
    "BETTER_AUTH_URL": "https://arkoa.app"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

#### Déploiement Vercel

```bash
# Installation de Vercel CLI
npm install -g vercel

# Login
vercel login

# Configuration du projet
vercel

# Déploiement
vercel --prod

# Ou via GitHub (recommandé)
# 1. Connecter le repository GitHub à Vercel
# 2. Configurer les variables d'environnement
# 3. Chaque push sur main déclenche un déploiement automatique
```

### DigitalOcean App Platform

```yaml
# .do/app.yaml
name: arkoa
services:
- name: web
  source_dir: /
  github:
    repo: your-username/arkoa
    branch: main
    deploy_on_push: true
  run_command: pnpm start
  environment_slug: node-js
  instance_count: 2
  instance_size_slug: basic-xxs
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: BETTER_AUTH_SECRET
    value: ${BETTER_AUTH_SECRET}
  - key: BETTER_AUTH_URL
    value: ${APP_URL}
  health_check:
    http_path: /api/health
  http_port: 3000
  routes:
  - path: /
databases:
- name: db
  engine: PG
  version: "14"
  size: basic-xs
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  test:
    name: Tests
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: arkoa_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
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
      
      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
      
      - name: Setup pnpm cache
        uses: actions/cache@v3
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Setup test environment
        run: |
          echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/arkoa_test" > .env.test
          echo "BETTER_AUTH_SECRET=test-secret-key" >> .env.test
      
      - name: Generate Prisma client
        run: npx prisma generate
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/arkoa_test
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run type checking
        run: pnpm ts:fix
      
      - name: Run unit tests
        run: pnpm test:unit --coverage
      
      - name: Run integration tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/arkoa_test
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    needs: test
    
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
        run: pnpm install --frozen-lockfile
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build application
        run: pnpm build
      
      - name: Run E2E tests
        run: pnpm test:e2e
      
      - name: Upload E2E test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  build:
    name: Build Docker Image
    runs-on: ubuntu-latest
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    name: Deploy to Staging
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Deploy to staging
        run: |
          echo "🚀 Deploying to staging environment"
          # Ajouter ici les commandes de déploiement spécifiques

  deploy-production:
    name: Deploy to Production
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Deploy to production
        run: |
          echo "🚀 Deploying to production environment"
          # Ajouter ici les commandes de déploiement spécifiques
```

## Monitoring et maintenance

### Health Checks

> **Note** : Le système de health checks avancé est prévu pour Q1 2025. Actuellement, un endpoint de base est disponible.

**Fonctionnalités actuellement disponibles :**
- Endpoint `/api/health` basique
- Vérification de la connexion base de données
- Métriques mémoire de base
- Status de l'application

**Fonctionnalités prévues (Q1 2025) :**
- Health checks avancés avec métriques détaillées
- Vérification de l'espace disque
- Monitoring des services externes
- Alertes automatiques en cas de problème
- Dashboard de monitoring en temps réel

### Logging

**Note** : Le système de logging avancé avec Winston est prévu pour une version future.

Actuellement disponible :
- Logs Next.js intégrés (console.log, console.error)
- Logs Docker (docker logs)
- Variables d'environnement LOG_LEVEL pour le contrôle

Prévu pour Q1 2025 :
- Intégration Winston pour logging structuré
- Rotation automatique des logs
- Centralisation des logs

### Métriques avec Prometheus

**Note** : L'intégration Prometheus est prévue pour Q1 2025.

Actuellement disponible :
- Health checks via `/api/health`
- Métriques Prisma (via le client généré)
- Métriques système Docker

Prévu pour Q1 2025 :
- Métriques Prometheus personnalisées
- Endpoint `/metrics` pour Prometheus
- Dashboard Grafana
- Alerting avec Alertmanager

### Alerting

**Note** : Le système d'alerting automatique avec Alertmanager est prévu pour Q1 2025.

Actuellement disponible :
- Notifications par email via Better Auth
- Logs d'erreurs dans la console
- Health checks manuels

Prévu pour Q1 2025 :
- Alerting automatique avec Alertmanager
- Notifications Slack/Teams
- Escalade automatique des incidents

## Rollback et récupération

### Stratégie de rollback

```bash
#!/bin/bash
# rollback.sh

set -e

# Variables
PREVIOUS_VERSION=${1:-"previous"}
SERVICE_NAME="arkoa-service"
CLUSTER_NAME="arkoa-cluster"

echo "🔄 Rollback vers la version: ${PREVIOUS_VERSION}"

# 1. Arrêter le service actuel
echo "🛑 Arrêt du service actuel..."
docker-compose down

# 2. Récupérer la version précédente
echo "📋 Récupération de la version précédente..."
docker pull your-registry.com/arkoa:${PREVIOUS_VERSION}

# 3. Redémarrer avec la version précédente
echo "🔄 Redémarrage avec la version précédente..."
IMAGE_TAG=${PREVIOUS_VERSION} docker-compose up -d

# 4. Vérifier le statut
echo "⏳ Vérification du statut..."
sleep 30
curl -f http://localhost:3000/api/health || echo "❌ Service non disponible"

echo "✅ Rollback terminé avec succès!"
```

### Sauvegarde automatique

```bash
#!/bin/bash
# backup.sh

set -e

# Variables
DB_HOST=${DB_HOST:-"localhost"}
DB_NAME=${DB_NAME:-"arkoa"}
DB_USER=${DB_USER:-"arkoa_user"}
BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/arkoa_backup_${DATE}.sql"
RETENTION_DAYS=7

echo "💾 Début de la sauvegarde de la base de données..."

# Créer le répertoire de sauvegarde
mkdir -p ${BACKUP_DIR}

# Effectuer la sauvegarde
pg_dump -h ${DB_HOST} -U ${DB_USER} -d ${DB_NAME} > ${BACKUP_FILE}

# Compresser la sauvegarde
gzip ${BACKUP_FILE}

echo "✅ Sauvegarde terminée: ${BACKUP_FILE}.gz"

# Nettoyer les anciennes sauvegardes
echo "🧹 Nettoyage des anciennes sauvegardes..."
find ${BACKUP_DIR} -name "arkoa_backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete

echo "✅ Nettoyage terminé"

echo "💾 Sauvegarde locale terminée"
```

### Plan de récupération d'urgence

```markdown
# Plan de récupération d'urgence (DRP)

## Procédures d'urgence

### 1. Application inaccessible
1. Vérifier le health check: `curl https://arkoa.app/api/health`
2. Vérifier les logs: `docker logs arkoa-web`
3. Redémarrer le service: `docker-compose restart web`
4. Si échec: rollback vers la version précédente

### 2. Base de données corrompue
1. Arrêter l'application
2. Restaurer depuis la dernière sauvegarde
3. Appliquer les migrations manquantes
4. Redémarrer l'application

### 3. Perte de données
1. Identifier l'étendue de la perte
2. Restaurer depuis la sauvegarde la plus récente
3. Récupérer les données depuis les logs si possible
4. Informer les utilisateurs affectés

## Contacts d'urgence
- Admin système: +33 X XX XX XX XX
- Développeur principal: +33 X XX XX XX XX
- Support cloud: support@provider.com
```

---

**Ce guide de déploiement couvre les aspects essentiels pour mettre en production l'application Arkoa de manière sécurisée et fiable.**

**Version**: 1.0.0  
**Dernière mise à jour**: Janvier 2025