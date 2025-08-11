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

Arkoa est une application web de gestion des congés développée avec Next.js 15, TypeScript et Prisma. Elle permet aux entreprises de gérer efficacement les demandes de congés de leurs collaborateurs avec un système de validation hiérarchique et de suivi des soldes de congés.

### Technologies principales

- **Frontend** : Next.js 15.3.4 avec App Router
- **Backend** : API Routes Next.js
- **Base de données** : PostgreSQL avec Prisma ORM 6.10.1
- **Authentification** : Better Auth 1.2.10
- **UI** : Radix UI + Tailwind CSS 4
- **State Management** : Zustand 5.0.6 + TanStack Query 5.81.5
- **Tests** : Jest 30.0.5, Playwright 1.54.1
- **Déploiement** : Docker + Dokploy
- **Runtime** : Node.js 20 + pnpm

## Architecture

### Structure du projet

```
arkoa/
├── app/                           # Pages et API routes (App Router)
│   ├── api/                      # Endpoints API
│   │   ├── auth/[...all]/        # Better Auth endpoints
│   │   └── companies/            # API entreprises
│   │       └── [companyId]/      # API spécifique entreprise
│   │           ├── calendar/     # Calendrier des congés
│   │           ├── leaves/       # Gestion des congés
│   │           ├── memberships/  # Gestion des membres
│   │           └── stats/        # Statistiques
│   ├── auth/                     # Pages d'authentification
│   │   ├── signin/               # Connexion
│   │   └── signup/               # Inscription
│   ├── approvals/                # Page d'approbation des congés
│   ├── hr/                       # Interface RH
│   ├── leaves/                   # Interface congés employé
│   ├── team/                     # Gestion d'équipe
│   └── page.tsx                  # Dashboard principal
├── src/
│   ├── components/               # Composants React réutilisables
│   │   ├── approvals/           # Composants approbation
│   │   ├── auth/                # Composants authentification
│   │   ├── company/             # Composants entreprise
│   │   ├── dashboard/           # Composants tableau de bord
│   │   ├── hr/                  # Composants RH
│   │   ├── leaves/              # Composants congés
│   │   ├── leaves-balances/     # Composants soldes congés
│   │   ├── nav/                 # Navigation
│   │   ├── team/                # Composants équipe
│   │   └── ui/                  # Composants UI de base
│   ├── hooks/                   # Hooks personnalisés
│   │   └── api/                 # Hooks API avec TanStack Query
│   ├── lib/                     # Utilitaires et services
│   │   ├── auth.ts              # Configuration Better Auth
│   │   ├── auth-client.ts       # Client auth côté client
│   │   ├── auth-server.ts       # Utilitaires auth serveur
│   │   ├── prisma.ts            # Client Prisma
│   │   ├── services/            # Services métier
│   │   └── types/               # Types TypeScript
│   ├── schemas/                 # Schémas de validation Zod
│   ├── stores/                  # Stores Zustand
│   ├── generated/               # Code généré
│   │   └── prisma/              # Client Prisma généré
│   └── mocks/                   # Mocks pour les tests
├── prisma/                      # Schéma et migrations de base de données
│   ├── schema.prisma            # Schéma de base de données
│   └── migrations/              # Migrations Prisma
├── e2e/                         # Tests end-to-end Playwright
├── docs/                        # Documentation
└── .github/workflows/           # CI/CD GitHub Actions
```

### Modèles de données (Prisma)

#### Modèles principaux

- **User** : Utilisateurs avec authentification Better Auth
- **Session** : Sessions utilisateur
- **Account** : Comptes d'authentification
- **Company** : Entreprises avec configuration des congés
- **Membership** : Appartenance utilisateur-entreprise avec rôles
- **Leave** : Demandes de congés avec statuts et validation
- **LeaveBalance** : Soldes de congés par type et membre
- **LeaveBalanceHistory** : Historique des modifications de soldes

#### Enums

- **UserRole** : EMPLOYEE, MANAGER
- **LeaveType** : PAID, UNPAID, RTT, SICK, MATERNITY, PATERNITY, PARENTAL, BEREAVEMENT, MARRIAGE, MOVING, CHILD_SICK, TRAINING, UNJUSTIFIED, ADJUSTMENT
- **LeaveStatus** : PENDING, APPROVED, REJECTED, CANCELED
- **HalfDayPeriod** : MORNING, AFTERNOON
- **LeaveBalanceHistoryType** : AUTO_CREDIT, MANUEL_CREDIT, LEAVE_REFUND, LEAVE_DEDUCTION, CARRY_FORWARD, EXPIRATION

### Flux de données

1. **Client** → Composants React avec TanStack Query pour la gestion d'état serveur
2. **API** → Routes Next.js avec validation Zod et middleware d'authentification
3. **Services** → Logique métier avec Prisma et gestion des transactions
4. **Base de données** → PostgreSQL avec relations et contraintes

### Authentification

Better Auth avec :
- Adapter Prisma pour PostgreSQL
- Support email/password
- Sessions sécurisées avec cookies
- Middleware de protection des routes
- Origines de confiance configurées

## Manuel de déploiement

### Prérequis

- Docker et Docker Compose
- Node.js 20+
- pnpm 8+
- Base de données PostgreSQL
- Dokploy (pour le déploiement automatisé)

### Variables d'environnement

Créer un fichier `.env` avec :

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/arkoa"

# Authentification Better Auth
BETTER_AUTH_SECRET="your-secret-key-here-32-chars-min"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

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

- **Développement** : `http://localhost:3000` (avec Turbopack)
- **Staging** : `https://staging.arkoa.app` (port 4001)
- **Production** : `https://arkoa.app` (port 4000)

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

### CI/CD avec GitHub Actions et Dokploy

Le pipeline CI/CD est configuré dans `.github/workflows/ci-cd.yml` :

- **Déclenchement** : Push sur `staging` ou `prod`
- **Étapes** : 
  1. Checkout du code
  2. Configuration Node.js 20 et pnpm
  3. Installation des dépendances
  4. Vérifications TypeScript et Lint
  5. Exécution des tests (unitaires, intégration, E2E)
  6. Build de l'application
  7. Déploiement automatique via Dokploy
- **Environnements** : 
  - Staging (port 4001) pour la branche `staging`
  - Production (port 4000) pour la branche `prod`

### Configuration des secrets GitHub

```
DOKPLOY_URL=https://your-dokploy-instance.com
DOKPLOY_API_KEY=your-api-key
STAGING_APP_ID=staging-compose-id
PRODUCTION_APP_ID=production-compose-id
```

## Manuel d'utilisation

### Interface administrateur (Manager/RH)

#### Gestion des entreprises

1. **Créer une entreprise**
   - Accéder à `/hr`
   - Cliquer sur "Nouvelle entreprise"
   - Remplir : nom, logo, jours de congés annuels (min. 25)

2. **Inviter des membres**
   - Aller dans "Mon équipe" (`/team`)
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

3. **Gérer les soldes de congés**
   - Ajustements manuels des soldes
   - Historique des modifications
   - Reports et expirations

### Interface employé

#### Demander un congé

1. **Nouvelle demande**
   - Accéder à `/leaves`
   - Cliquer sur "Nouvelle demande"
   - Sélectionner : type, dates, demi-journée si applicable
   - Ajouter une note explicative

2. **Suivre ses demandes**
   - Consulter l'historique dans "Mes congés"
   - Statuts : En attente, Approuvé, Rejeté, Annulé

3. **Consulter ses soldes**
   - Vue des soldes par type de congé
   - Historique des modifications

### API REST

#### Endpoints principaux

```
# Authentification
POST   /api/auth/sign-in              # Connexion
POST   /api/auth/sign-up              # Inscription
POST   /api/auth/sign-out             # Déconnexion
GET    /api/auth/session              # Session actuelle

# Entreprises
GET    /api/companies                 # Liste des entreprises
POST   /api/companies                 # Créer une entreprise
GET    /api/companies/[companyId]     # Détails entreprise
PUT    /api/companies/[companyId]     # Modifier entreprise

# Congés
GET    /api/companies/[companyId]/leaves         # Congés d'une entreprise
POST   /api/companies/[companyId]/leaves         # Créer un congé
PUT    /api/companies/[companyId]/leaves/[leaveId]        # Modifier un congé
POST   /api/companies/[companyId]/leaves/[leaveId]/review # Réviser un congé

# Membres
GET    /api/companies/[companyId]/memberships    # Membres d'une entreprise
POST   /api/companies/[companyId]/memberships    # Inviter un membre
PUT    /api/companies/[companyId]/memberships/[membershipId] # Modifier un membre

# Statistiques
GET    /api/companies/[companyId]/stats          # Statistiques entreprise

# Calendrier
GET    /api/companies/[companyId]/calendar       # Calendrier des congés
```

#### Authentification

Toutes les routes API nécessitent une authentification via Better Auth :

```typescript
// Authentification via sessions (cookies) Better Auth
// Côté client : inclure les cookies automatiquement
fetch('/api/endpoint', {
  method: 'GET',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
})
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

1. **Rollback via Dokploy**
   - Utiliser l'interface Dokploy pour revenir à la version précédente
   - Ou redéployer une version antérieure via Git

2. **Rollback base de données**
   ```bash
   # Restaurer depuis une sauvegarde Backblaze (via Dokploy)
   # Les sauvegardes sont automatiques et hebdomadaires
   ```

## Sécurité

### Mesures implémentées

1. **Validation des données**
   - Schémas Zod sur tous les endpoints
   - Validation côté client et serveur
   - Protection contre l'injection SQL via Prisma

2. **Authentification**
   - Better Auth avec sessions sécurisées
   - Middleware de protection des routes
   - Gestion des rôles (EMPLOYEE, MANAGER)
   - Support email/password avec validation
   - Origines de confiance configurées
   - Cache de cookies sécurisé

3. **Autorisation**
   - Vérification des permissions par endpoint
   - Isolation des données par entreprise
   - Protection contre l'escalade de privilèges
   - Middleware d'authentification sur toutes les routes protégées

### Bonnes pratiques

1. **Variables d'environnement**
   - Ne jamais committer les fichiers `.env`
   - Utiliser des secrets forts (32+ caractères)
   - Rotation régulière des clés
   - Variables séparées par environnement

2. **Base de données**
   - Sauvegardes automatiques hebdomadaires (Dokploy + Backblaze)
   - Chiffrement des données sensibles
   - Accès restreint par IP
   - Migrations versionnées

3. **Déploiement**
   - Images Docker minimales (Alpine)
   - Scan de sécurité des dépendances
   - HTTPS obligatoire en production
   - Isolation des environnements

## Tests

### Types de tests

1. **Tests unitaires** (Jest)
   ```bash
   pnpm test              # Exécution simple
   pnpm test:watch        # Mode watch
   pnpm test:coverage     # Avec couverture
   pnpm test:ci           # Mode CI
   ```

2. **Tests d'intégration** (Jest)
   ```bash
   pnpm test:integration           # Exécution simple
   pnpm test:integration:watch     # Mode watch
   pnpm test:integration:coverage  # Avec couverture
   pnpm test:integration:ci        # Mode CI
   ```

3. **Tests E2E** (Playwright)
   ```bash
   pnpm test:e2e          # Headless
   pnpm test:e2e:headed   # Avec interface
   pnpm test:e2e:ui       # Interface Playwright
   ```

4. **Tous les tests**
   ```bash
   pnpm test:all          # Unitaires + Intégration + E2E
   ```

### Couverture de code

- **Objectif** : >80% de couverture
- **Rapport** : Généré dans `coverage/`
- **CI/CD** : Échec si couverture insuffisante
- **Configuration** : Jest avec collectCoverageFrom

### Stratégie de test

1. **Composants UI** : Tests de rendu et interactions avec Testing Library
2. **API** : Tests des endpoints avec mocks MSW
3. **Services** : Tests de logique métier avec mocks Prisma
4. **Hooks** : Tests des hooks personnalisés
5. **Stores** : Tests des stores Zustand
6. **Schémas** : Tests de validation Zod
7. **E2E** : Tests des parcours utilisateur complets

### Configuration des tests

- **Jest** : Configuration dans `jest.config.js` et `jest.integration.config.js`
- **Playwright** : Configuration dans `playwright.config.ts`
- **MSW** : Mocks API dans `src/mocks/`
- **Testing Library** : Setup dans `jest.setup.js`

## Dépannage

### Problèmes courants

#### Erreur de connexion base de données

```bash
# Vérifier la connexion
npx prisma db pull

# Régénérer le client
npx prisma generate

# Vérifier les migrations
npx prisma migrate status
```

#### Erreur de build Docker

```bash
# Nettoyer le cache Docker
docker system prune -a

# Reconstruire sans cache
docker-compose build --no-cache

# Vérifier les logs
docker-compose logs -f web
```

#### Tests qui échouent

```bash
# Nettoyer les modules
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Relancer les tests
pnpm test:all

# Tests spécifiques
pnpm test -- --testNamePattern="nom du test"
```

#### Erreurs TypeScript

```bash
# Vérifier les types
pnpm ts:fix

# Régénérer Prisma
npx prisma generate

# Nettoyer le cache Next.js
rm -rf .next
```

#### Erreurs Better Auth

```bash
# Vérifier les variables d'environnement
echo $BETTER_AUTH_SECRET
echo $BETTER_AUTH_URL

# Vérifier la configuration des origines
# Dans src/lib/auth.ts
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
   - Métriques Playwright pour les tests E2E

### Debugging

1. **Mode développement**
   ```bash
   # Avec Turbopack pour un rechargement rapide
   pnpm dev
   ```

2. **Debug des tests**
   ```bash
   # Tests en mode debug
   pnpm test:watch
   
   # Playwright en mode debug
   pnpm test:e2e:headed
   ```

3. **Debug de la base de données**
   ```bash
   # Studio Prisma
   npx prisma studio
   
   # Logs des requêtes
   # Ajouter dans .env : DATABASE_URL avec ?log=query
   ```

### Support et maintenance

- **Documentation** : Maintenir cette documentation à jour
- **Issues** : Utiliser GitHub Issues pour le suivi des bugs
- **Releases** : Notes de version détaillées avec changelog
- **Monitoring** : Surveillance continue en production via Dokploy
- **Sauvegardes** : Automatiques hebdomadaires via Dokploy sur Backblaze

---

**Version de la documentation** : 2.0.0  
**Dernière mise à jour** : août 2025  
**Auteur** : Équipe Arkoa  
**Technologies** : Next.js 15.3.4, React 19.0.0, Better Auth 1.2.10, Prisma 6.10.1