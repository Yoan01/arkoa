# Documentation Technique - Arkoa

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Manuel de déploiement](#manuel-de-déploiement)
4. [Manuel d'utilisation](#manuel-dutilisation)
5. [Manuel de mise à jour](#manuel-de-mise-à-jour)
6. [Sécurité](#sécurité)
7. [Tests](#tests)
8. [Dépannage](#dépannage)

## Vue d'ensemble

Arkoa est une application web de gestion des congés développée avec Next.js 15, TypeScript et Prisma. Elle permet aux entreprises de gérer efficacement les demandes de congés de leurs collaborateurs.

### Technologies principales

- **Frontend** : Next.js 15.3.4 avec App Router
- **Backend** : API Routes Next.js
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : Better Auth
- **UI** : Radix UI + Tailwind CSS
- **Tests** : Jest, Playwright
- **Déploiement** : Docker + Docker Compose

## Architecture

### Structure du projet

```
arkoa/
├── app/                    # Pages et API routes (App Router)
│   ├── api/               # Endpoints API
│   ├── auth/              # Pages d'authentification
│   └── [pages]/           # Pages de l'application
├── src/
│   ├── components/        # Composants React réutilisables
│   ├── hooks/             # Hooks personnalisés
│   ├── lib/               # Utilitaires et services
│   ├── schemas/           # Schémas de validation Zod
│   └── stores/            # Stores Zustand
├── prisma/                # Schéma et migrations de base de données
├── e2e/                   # Tests end-to-end Playwright
└── docs/                  # Documentation
```

### Flux de données

1. **Client** → Composants React avec TanStack Query
2. **API** → Routes Next.js avec validation Zod
3. **Services** → Logique métier avec Prisma
4. **Base de données** → PostgreSQL

## Manuel de déploiement

### Prérequis

- Docker et Docker Compose
- Node.js 20+
- pnpm 8+
- Base de données PostgreSQL

### Variables d'environnement

Créer un fichier `.env` avec :

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/arkoa"

# Authentification
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Environnement
NODE_ENV="production"
```

### Déploiement local

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd arkoa
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer la base de données**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. **Construire l'application**
   ```bash
   pnpm build
   ```

5. **Démarrer l'application**
   ```bash
   pnpm start
   ```

### Environnements

- **Développement** : `http://localhost:3000`
- **Staging** : `https://staging.arkoa.app`
- **Production** : `https://arkoa.app`

### Déploiement avec Docker

#### Staging

```bash
# Construire et démarrer
docker-compose -f docker-compose.staging.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.staging.yml logs -f
```

#### Production

```bash
# Construire et démarrer
docker-compose -f docker-compose.production.yml up -d

# Vérifier les logs
docker-compose -f docker-compose.production.yml logs -f
```

### CI/CD avec GitHub Actions

Le pipeline CI/CD est configuré dans `.github/workflows/ci-cd.yml` :

- **Déclenchement** : Push sur `staging` ou `prod`
- **Étapes** : Tests → Build → Déploiement automatique
- **Environnements** : Staging (port 4001) et Production (port 4000)

### Configuration des secrets GitHub

```
DOKPLOY_URL=https://your-dokploy-instance.com
DOKPLOY_API_KEY=your-api-key
STAGING_APP_ID=staging-compose-id
PRODUCTION_APP_ID=production-compose-id
```

## Manuel d'utilisation

### Interface administrateur

#### Gestion des entreprises

1. **Créer une entreprise**
   - Accéder à `/hr`
   - Cliquer sur "Nouvelle entreprise"
   - Remplir : nom, logo, jours de congés annuels (min. 25)

2. **Inviter des membres**
   - Aller dans "Mon équipe"
   - Cliquer sur "Inviter un membre"
   - Saisir l'email et définir le rôle (EMPLOYEE/MANAGER)

#### Gestion des congés

1. **Approuver/Rejeter des demandes**
   - Accéder à `/approvals`
   - Consulter les demandes en attente
   - Cliquer sur "Approuver" ou "Rejeter"
   - Ajouter une note si nécessaire

2. **Consulter les statistiques**
   - Dashboard principal : vue d'ensemble
   - Statistiques par équipe et par période
   - Calendrier des congés

### Interface employé

#### Demander un congé

1. **Nouvelle demande**
   - Accéder à `/leaves`
   - Cliquer sur "Nouvelle demande"
   - Sélectionner : type, dates, demi-journée si applicable
   - Ajouter une note explicative

2. **Suivre ses demandes**
   - Consulter l'historique dans "Mes congés"
   - Statuts : En attente, Approuvé, Rejeté

### API REST

#### Endpoints principaux

```
GET    /api/companies                     # Liste des entreprises
POST   /api/companies                     # Créer une entreprise
GET    /api/companies/[id]/leaves         # Congés d'une entreprise
POST   /api/companies/[id]/leaves/[id]/review  # Réviser un congé
GET    /api/companies/[id]/memberships    # Membres d'une entreprise
POST   /api/companies/[id]/memberships    # Inviter un membre
```

#### Authentification

Toutes les routes API nécessitent une authentification via Better Auth :

```typescript
// Headers requis
Authorization: Bearer <token>
Content-Type: application/json
```

## Manuel de mise à jour

### Mise à jour des dépendances

1. **Vérifier les mises à jour**
   ```bash
   pnpm outdated
   ```

2. **Mettre à jour les dépendances**
   ```bash
   # Mises à jour mineures
   pnpm update
   
   # Mises à jour majeures (avec précaution)
   pnpm update --latest
   ```

3. **Tester après mise à jour**
   ```bash
   pnpm test:all
   ```

### Migration de base de données

1. **Créer une migration**
   ```bash
   npx prisma migrate dev --name description-migration
   ```

2. **Appliquer en production**
   ```bash
   npx prisma migrate deploy
   ```

3. **Générer le client Prisma**
   ```bash
   npx prisma generate
   ```

### Déploiement d'une nouvelle version

1. **Préparer la release**
   ```bash
   # Mettre à jour la version
   npm version patch|minor|major
   
   # Créer un tag
   git tag v1.x.x
   git push origin v1.x.x
   ```

2. **Déployer via CI/CD**
   ```bash
   # Push sur la branche staging
   git push origin staging
   
   # Après validation, push sur prod
   git push origin prod
   ```

3. **Vérification post-déploiement**
   - Vérifier les logs d'application
   - Tester les fonctionnalités critiques
   - Surveiller les métriques de performance

### Rollback en cas de problème

1. **Rollback Docker**
   ```bash
   # Revenir à l'image précédente
   docker-compose down
   docker-compose up -d --scale web=0
   docker-compose up -d
   ```

2. **Rollback base de données**
   ```bash
   # Restaurer depuis une sauvegarde
   pg_restore -d arkoa backup_file.sql
   ```

## Sécurité

### Mesures implémentées

1. **Validation des données**
   - Schémas Zod sur tous les endpoints
   - Validation côté client et serveur
   - Protection contre l'injection SQL

2. **Authentification**
   - Better Auth avec sessions sécurisées
   - Middleware de protection des routes
   - Gestion des rôles (ADMIN, MANAGER, EMPLOYEE)
   - Support multi-providers (email/password, OAuth)
   - Gestion avancée des sessions et de la sécurité

3. **Autorisation**
   - Vérification des permissions par endpoint
   - Isolation des données par entreprise
   - Protection contre l'escalade de privilèges

### Bonnes pratiques

1. **Variables d'environnement**
   - Ne jamais committer les fichiers `.env`
   - Utiliser des secrets forts (32+ caractères)
   - Rotation régulière des clés

2. **Base de données**
   - Sauvegardes automatiques quotidiennes
   - Chiffrement des données sensibles
   - Accès restreint par IP

3. **Déploiement**
   - Images Docker minimales
   - Scan de sécurité des dépendances
   - HTTPS obligatoire en production

## Tests

### Types de tests

1. **Tests unitaires** (Jest)
   ```bash
   pnpm test              # Exécution simple
   pnpm test:watch        # Mode watch
   pnpm test:coverage     # Avec couverture
   ```

2. **Tests d'intégration** (Jest)
   ```bash
   pnpm test:integration
   ```

3. **Tests E2E** (Playwright)
   ```bash
   pnpm test:e2e          # Headless
   pnpm test:e2e:headed   # Avec interface
   pnpm test:e2e:ui       # Interface Playwright
   ```

### Couverture de code

- **Objectif** : >80% de couverture
- **Rapport** : Généré dans `coverage/`
- **CI/CD** : Échec si couverture insuffisante

### Stratégie de test

1. **Composants UI** : Tests de rendu et interactions
2. **API** : Tests des endpoints avec mocks
3. **Services** : Tests de logique métier
4. **E2E** : Tests des parcours utilisateur complets

## Dépannage

### Problèmes courants

#### Erreur de connexion base de données

```bash
# Vérifier la connexion
npx prisma db pull

# Régénérer le client
npx prisma generate
```

#### Erreur de build Docker

```bash
# Nettoyer le cache Docker
docker system prune -a

# Reconstruire sans cache
docker-compose build --no-cache
```

#### Tests qui échouent

```bash
# Nettoyer les modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Relancer les tests
pnpm test:all
```

### Logs et monitoring

1. **Logs d'application**
   ```bash
   # Docker
   docker-compose logs -f web
   
   # Local
   pnpm dev
   ```

2. **Logs de base de données**
   ```bash
   # PostgreSQL
   tail -f /var/log/postgresql/postgresql.log
   ```

3. **Métriques de performance**
   - Temps de réponse API (via logs d'application)
   - Utilisation mémoire/CPU (via Docker stats)
   - Taille des bundles JavaScript (via Next.js build)

### Support et maintenance

- **Documentation** : Maintenir cette documentation à jour
- **Issues** : Utiliser GitHub Issues pour le suivi des bugs
- **Releases** : Notes de version détaillées
- **Monitoring** : Surveillance continue en production

---

**Version de la documentation** : 1.0.0  
**Dernière mise à jour** : Août 2025  
**Auteur** : Équipe Arkoa