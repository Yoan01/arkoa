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
DATABASE_URL="postgresql://arkoa_user:password@localhost:5432/arkoa_dev"

# Authentification
BETTER_AUTH_SECRET="dev-secret-key-32-characters-min"
BETTER_AUTH_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Debug
DEBUG="true"
LOG_LEVEL="debug"

# Email (optionnel en dev)
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_USER="your-mailtrap-user"
SMTP_PASS="your-mailtrap-pass"
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

# Email
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
SMTP_FROM="noreply@staging.arkoa.app"

# Monitoring
SENTRY_DSN="https://your-sentry-dsn@sentry.io/project-id"
```

#### Production (.env.production)
```bash
# Base de données production
DATABASE_URL="postgresql://arkoa_prod:very_secure_password@prod-db:5432/arkoa_prod"

# Authentification
BETTER_AUTH_SECRET="production-secret-key-extremely-secure-64-chars-minimum"
BETTER_AUTH_URL="https://arkoa.app"

# Environnement
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://arkoa.app"

# Sécurité
SECURE_COOKIES="true"
CSRF_SECRET="csrf-secret-key-32-chars-min"

# Logs
LOG_LEVEL="warn"

# Email production
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="your-production-sendgrid-api-key"
SMTP_FROM="noreply@arkoa.app"

# Monitoring
SENTRY_DSN="https://your-production-sentry-dsn@sentry.io/project-id"
SENTRY_ENVIRONMENT="production"

# Stockage (optionnel)
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="eu-west-1"
AWS_S3_BUCKET="arkoa-prod-uploads"
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
cp .env.example .env
# Éditer .env avec vos paramètres

# Initialiser la base de données
npx prisma migrate dev
npx prisma db seed

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

### Docker Compose - Développement

```yaml
# docker-compose.dev.yml
version: "3.9"

services:
  web:
    build:
      context: .
      target: development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://arkoa_user:password@db:5432/arkoa_dev
      - BETTER_AUTH_SECRET=dev-secret-key-32-characters-min
      - BETTER_AUTH_URL=http://localhost:3000
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    depends_on:
      - db
    command: pnpm dev

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=arkoa_dev
      - POSTGRES_USER=arkoa_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_dev_data:
```

### Docker Compose - Production

```yaml
# docker-compose.production.yml
version: "3.9"

services:
  web:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - SENTRY_DSN=${SENTRY_DSN}
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - db
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_prod_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  nginx:
    image: nginx:alpine
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

### Dockerfile optimisé

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Development stage
FROM base AS development
RUN pnpm install
COPY . .
EXPOSE 3000
CMD ["pnpm", "dev"]

# Build stage
FROM base AS builder
RUN pnpm install --frozen-lockfile
COPY . .
RUN npx prisma generate
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

# Install pnpm
RUN npm install -g pnpm

# Create app user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads && chown nextjs:nodejs uploads

# Switch to non-root user
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Commandes de déploiement Docker

```bash
# Développement
docker-compose -f docker-compose.dev.yml up -d

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

### AWS (Amazon Web Services)

#### Architecture recommandée

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   Application   │────│   RDS Postgres  │
│   (CDN + SSL)   │    │   Load Balancer │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   ECS Fargate   │
                       │   (Containers)  │
                       └─────────────────┘
```

#### Configuration ECS

```json
// ecs-task-definition.json
{
  "family": "arkoa-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "arkoa-web",
      "image": "your-account.dkr.ecr.region.amazonaws.com/arkoa:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:arkoa/database-url"
        },
        {
          "name": "BETTER_AUTH_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:arkoa/auth-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/arkoa",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

#### Script de déploiement AWS

```bash
#!/bin/bash
# deploy-aws.sh

set -e

# Variables
REGION="eu-west-1"
CLUSTER_NAME="arkoa-cluster"
SERVICE_NAME="arkoa-service"
IMAGE_TAG="latest"
REPOSITORY_URI="your-account.dkr.ecr.${REGION}.amazonaws.com/arkoa"

echo "🚀 Déploiement AWS ECS en cours..."

# 1. Build et push de l'image Docker
echo "📦 Construction de l'image Docker..."
docker build -t arkoa:${IMAGE_TAG} .

# Login ECR
aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${REPOSITORY_URI}

# Tag et push
docker tag arkoa:${IMAGE_TAG} ${REPOSITORY_URI}:${IMAGE_TAG}
docker push ${REPOSITORY_URI}:${IMAGE_TAG}

# 2. Mise à jour de la task definition
echo "📝 Mise à jour de la task definition..."
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json \
  --region ${REGION}

# 3. Mise à jour du service
echo "🔄 Mise à jour du service ECS..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --force-new-deployment \
  --region ${REGION}

# 4. Attendre que le déploiement soit terminé
echo "⏳ Attente de la fin du déploiement..."
aws ecs wait services-stable \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME} \
  --region ${REGION}

echo "✅ Déploiement terminé avec succès!"
```

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
          cp .env.example .env.test
          echo "DATABASE_URL=postgresql://postgres:postgres@localhost:5432/arkoa_test" >> .env.test
      
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

# 1. Récupérer la task definition précédente
echo "📋 Récupération de la task definition précédente..."
TASK_DEFINITION=$(aws ecs describe-task-definition \
  --task-definition ${SERVICE_NAME}:${PREVIOUS_VERSION} \
  --query 'taskDefinition' \
  --output json)

# 2. Supprimer les champs non nécessaires
echo "🧹 Nettoyage de la task definition..."
CLEANED_TASK_DEF=$(echo $TASK_DEFINITION | jq 'del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)')

# 3. Enregistrer la nouvelle task definition
echo "📝 Enregistrement de la task definition..."
aws ecs register-task-definition \
  --cli-input-json "$CLEANED_TASK_DEF"

# 4. Mettre à jour le service
echo "🔄 Mise à jour du service..."
aws ecs update-service \
  --cluster ${CLUSTER_NAME} \
  --service ${SERVICE_NAME} \
  --force-new-deployment

# 5. Attendre la stabilisation
echo "⏳ Attente de la stabilisation..."
aws ecs wait services-stable \
  --cluster ${CLUSTER_NAME} \
  --services ${SERVICE_NAME}

echo "✅ Rollback terminé avec succès!"
```

### Sauvegarde automatique

```bash
#!/bin/bash
# backup.sh

set -e

# Variables
DB_HOST=${DB_HOST:-"localhost"}
DB_NAME=${DB_NAME:-"arkoa_prod"}
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

# Optionnel: Upload vers S3
if [ ! -z "$AWS_S3_BUCKET" ]; then
  echo "☁️ Upload vers S3..."
  aws s3 cp ${BACKUP_FILE}.gz s3://${AWS_S3_BUCKET}/backups/
  echo "✅ Upload S3 terminé"
fi
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