# Arkoa - Plateforme de Gestion des Congés

## Vue d'ensemble

Arkoa est une plateforme moderne de gestion des congés d'entreprise construite avec Next.js 15, TypeScript, Prisma et Better Auth. Elle permet aux entreprises de gérer efficacement les demandes de congés, les approbations et les soldes de leurs employés.

## Fonctionnalités principales

### 🏢 Gestion d'entreprise
- Création et gestion d'entreprises
- Configuration des jours de congés annuels
- Gestion des logos d'entreprise
- Statistiques d'entreprise en temps réel

### 👥 Gestion des membres
- Invitation de nouveaux membres par email
- Gestion des rôles (EMPLOYEE/MANAGER)
- Suivi des adhésions d'entreprise
- Gestion des permissions basées sur les rôles

### 🏖️ Gestion des congés
- **Types de congés supportés** :
  - Congés payés (PAID)
  - Congé sans solde (UNPAID)
  - RTT (Réduction du temps de travail)
  - Maladie (SICK)
  - Maternité/Paternité (MATERNITY/PATERNITY)
  - Congé parental (PARENTAL)
  - Deuil (BEREAVEMENT)
  - Mariage (MARRIAGE)
  - Déménagement (MOVING)
  - Enfant malade (CHILD_SICK)
  - Formation (TRAINING)
  - Absence injustifiée (UNJUSTIFIED)
  - Ajustement manuel (ADJUSTMENT)

- **Fonctionnalités** :
  - Demandes de congés avec dates de début/fin
  - Support des demi-journées (matin/après-midi)
  - Workflow d'approbation par les managers
  - Calcul automatique des jours ouvrés
  - Validation des chevauchements de dates
  - Historique complet des demandes

### 📊 Soldes et statistiques
- Suivi des soldes de congés par type
- Historique des modifications de soldes
- Statistiques détaillées par entreprise
- Calendrier des congés
- Rapports d'utilisation

### 🔐 Authentification et sécurité
- Authentification sécurisée avec Better Auth
- Sessions basées sur des cookies sécurisés
- Protection CSRF intégrée
- Rate limiting sur les endpoints sensibles
- Validation des données avec Zod
- Autorisation basée sur les rôles

## Architecture technique

### Stack technologique
- **Frontend** : Next.js 15 avec App Router
- **Backend** : API Routes Next.js
- **Base de données** : PostgreSQL avec Prisma ORM
- **Authentification** : Better Auth
- **Validation** : Zod
- **Styling** : Tailwind CSS
- **Tests** : Jest + Testing Library
- **Déploiement** : Docker + Docker Compose

### Structure du projet
```
arkoa/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # Authentification Better Auth
│   │   └── companies/     # Endpoints API entreprises
│   ├── (auth)/            # Pages d'authentification
│   └── dashboard/         # Interface utilisateur
├── src/
│   ├── components/        # Composants React réutilisables
│   ├── lib/              # Utilitaires et services
│   │   ├── auth.ts       # Configuration Better Auth
│   │   └── services/     # Services métier
│   └── schemas/          # Schémas de validation Zod
├── prisma/               # Schéma et migrations Prisma
├── docs/                 # Documentation
└── docker/               # Configuration Docker
```

### Base de données

Le schéma Prisma définit les modèles suivants :

- **User** : Utilisateurs de la plateforme
- **Company** : Entreprises clientes
- **Membership** : Adhésions utilisateur-entreprise
- **Leave** : Demandes de congés
- **LeaveBalance** : Soldes de congés par type
- **LeaveBalanceHistory** : Historique des modifications
- **Session/Account/Verification** : Gestion Better Auth

## Installation et développement

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- pnpm (recommandé) ou npm

### Installation locale

1. **Cloner le projet**
```bash
git clone https://github.com/arkoa/arkoa.git
cd arkoa
```

2. **Installer les dépendances**
```bash
pnpm install
```

3. **Configuration de l'environnement**

Créer un fichier `.env.local` et configurer les variables d'environnement :
```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/arkoa"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
```

4. **Générer le client Prisma**
```bash
npx prisma generate
```

5. **Lancer le serveur de développement**
```bash
pnpm dev
```

L'application sera accessible sur `http://localhost:3000`

### Développement avec Docker

```bash
# Lancer l'environnement complet
docker-compose up -d

# Voir les logs
docker-compose logs -f web

# Arrêter l'environnement
docker-compose down
```

## Scripts disponibles

```bash
# Développement
pnpm dev              # Serveur de développement
pnpm build            # Build de production
pnpm start            # Serveur de production
pnpm lint             # Linting ESLint
pnpm lint:fix         # Correction automatique ESLint
pnpm ts:fix           # Vérification TypeScript

# Base de données
npx prisma generate   # Générer le client Prisma
npx prisma db push    # Synchroniser le schéma
npx prisma migrate dev # Créer une migration
npx prisma studio     # Interface Prisma Studio

# Tests
pnpm test             # Tests unitaires
pnpm test:watch       # Tests en mode watch
pnpm test:coverage    # Couverture de tests
pnpm test:ci          # Tests pour CI
pnpm test:integration # Tests d'intégration
pnpm test:integration:watch # Tests d'intégration en mode watch
pnpm test:integration:coverage # Couverture tests d'intégration
pnpm test:integration:ci # Tests d'intégration pour CI
pnpm test:e2e         # Tests end-to-end
pnpm test:e2e:ui      # Tests e2e avec interface
pnpm test:e2e:headed  # Tests e2e en mode headed
pnpm test:all         # Tous les tests
```

## API et intégrations

### Endpoints principaux

- **Authentification** : `/api/auth/*`
- **Entreprises** : `/api/companies`
- **Membres** : `/api/companies/{id}/memberships`
- **Congés** : `/api/companies/{id}/memberships/{id}/leaves`
- **Soldes** : `/api/companies/{id}/memberships/{id}/leave-balances`
- **Statistiques** : `/api/companies/{id}/stats`

### Documentation API

Consultez le [Guide API](./API_GUIDE.md) pour une documentation complète des endpoints, schémas de données et exemples d'utilisation.

## Tests

### Tests unitaires
```bash
# Lancer tous les tests
pnpm test

# Tests avec couverture
pnpm test:coverage

# Tests en mode watch
pnpm test:watch
```

### Tests d'intégration
```bash
# Tests API
pnpm test src/lib/services/

# Tests composants
pnpm test src/components/
```

### Tests end-to-end
```bash
# Avec Playwright
pnpm test:e2e
```

## Déploiement

### Environnements

- **Développement** : `http://localhost:3000`
- **Staging** : `https://staging.arkoa.app`
- **Production** : `https://arkoa.app`

### Déploiement Docker

1. **Build de l'image**
```bash
docker build -t arkoa:latest .
```

2. **Déploiement avec Docker Compose**
```bash
# Production
docker-compose -f docker-compose.production.yml up -d

# Staging
docker-compose -f docker-compose.staging.yml up -d
```

### Variables d'environnement de production

```env
# Base de données
DATABASE_URL="postgresql://user:password@db:5432/arkoa"

# Better Auth
BETTER_AUTH_SECRET="production-secret-key"
BETTER_AUTH_URL="https://arkoa.app"
NEXT_PUBLIC_APP_URL="https://arkoa.app"

# Environnement
NODE_ENV="production"
```

## Sécurité

### Mesures de sécurité implémentées

- **Authentification** : Better Auth avec sessions sécurisées
- **Autorisation** : Contrôle d'accès basé sur les rôles
- **Validation** : Validation stricte avec Zod
- **Protection CSRF** : Intégrée dans Better Auth
- **Rate Limiting** : Limitation des requêtes par IP
- **Cookies sécurisés** : HttpOnly, Secure, SameSite
- **Variables d'environnement** : Secrets non exposés

### Bonnes pratiques

- Mots de passe hashés avec bcrypt
- Sessions expirées automatiquement
- Validation côté client et serveur
- Logs de sécurité
- Monitoring des erreurs

Consultez le [Guide de sécurité](./SECURITY_GUIDE.md) pour plus de détails.

## Contribution

### Workflow de développement

1. **Fork** du projet
2. **Créer une branche** : `git checkout -b feature/ma-fonctionnalite`
3. **Développer** avec tests
4. **Commit** : `git commit -m "feat: ajouter ma fonctionnalité"`
5. **Push** : `git push origin feature/ma-fonctionnalite`
6. **Pull Request** vers `main`

### Standards de code

- **ESLint** : Configuration stricte
- **Prettier** : Formatage automatique
- **TypeScript** : Typage strict
- **Tests** : Couverture minimale 80%
- **Commits** : Convention Conventional Commits

### Structure des commits

```
type(scope): description

[body optionnel]

[footer optionnel]
```

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Consultez le [Guide de contribution](./CONTRIBUTING.md) pour plus de détails.

## Support et documentation

### Documentation

- [Guide d'installation](./INSTALLATION_GUIDE.md)
- [Guide API](./API_GUIDE.md)
- [Guide d'architecture](./ARCHITECTURE_GUIDE.md)
- [Guide de déploiement](./DEPLOYMENT_GUIDE.md)
- [Guide de sécurité](./SECURITY_GUIDE.md)
- [Guide de contribution](./CONTRIBUTING.md)

### Support

- **GitHub Issues** : [Créer une issue](https://github.com/ORGANISATION/arkoa/issues)
- **Documentation** : Voir le dossier `/docs`
- **Issues** : [GitHub Issues](https://github.com/arkoa/arkoa/issues)

### Communauté

- **Discord** : [Serveur Discord Arkoa](https://discord.gg/arkoa)
- **Twitter** : [@ArkoaApp](https://twitter.com/ArkoaApp)
- **LinkedIn** : [Arkoa](https://linkedin.com/company/arkoa)

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](../LICENSE) pour plus de détails.

## Changelog

### Version 1.0.0 (Janvier 2025)

#### Fonctionnalités
- ✅ Authentification Better Auth
- ✅ Gestion des entreprises
- ✅ Gestion des membres et rôles
- ✅ Système de congés complet
- ✅ Gestion des soldes
- ✅ Statistiques et rapports
- ✅ API REST complète
- ✅ Interface utilisateur moderne
- ✅ Tests unitaires et d'intégration
- ✅ Déploiement Docker

#### Améliorations techniques
- ✅ Migration vers Next.js 15
- ✅ Intégration Better Auth
- ✅ Optimisation des performances
- ✅ Amélioration de la sécurité
- ✅ Documentation complète

---

**Arkoa** - Simplifiez la gestion des congés de votre entreprise  
**Version** : 1.0.0  
**Dernière mise à jour** : 9 août 2025  
**Site web** : À déployer