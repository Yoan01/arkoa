# Tests d'Intégration API

Ce dossier contient des tests d'intégration complets pour les APIs de l'application Arkoa. Ces tests vérifient le bon fonctionnement des opérations CRUD et la gestion d'erreurs des endpoints API.

## Structure des Tests

```
src/__tests__/integration/
├── companies.api.test.ts        # Tests pour l'API des entreprises
├── leaves.api.test.ts           # Tests pour l'API des congés
├── memberships.api.test.ts      # Tests pour l'API des membres
├── company-stats.api.test.ts    # Tests pour l'API des statistiques
└── README.md                    # Cette documentation
```

## Configuration

Les tests utilisent une configuration Jest simplifiée :

- Environnement Node.js
- Timeout de 10 secondes
- Mapping des modules avec `@/` vers `src/`

## Exécution des Tests

```bash
# Exécuter tous les tests d'intégration
pnpm test:integration

# Exécuter en mode watch
pnpm test:integration:watch

# Exécuter avec couverture de code
pnpm test:integration:coverage

# Exécuter pour CI/CD
pnpm test:integration:ci
```

## Tests Implémentés

### 1. API Companies (7 tests)
- **CRUD complet** : GET, POST, PUT, DELETE pour les entreprises
- **Gestion d'erreurs** : Validation des données, entreprises inexistantes, erreurs serveur
- **Endpoints testés** :
  - `GET /api/companies` - Liste des entreprises
  - `POST /api/companies` - Création d'entreprise
  - `GET /api/companies/[companyId]` - Détails d'une entreprise
  - `PUT /api/companies/[companyId]` - Mise à jour d'entreprise
  - `DELETE /api/companies/[companyId]` - Suppression d'entreprise

### 2. API Leaves (7 tests)
- **Consultation et révision** : GET des congés avec filtres, POST pour révision
- **Gestion d'erreurs** : Données invalides, congés inexistants, erreurs serveur
- **Endpoints testés** :
  - `GET /api/companies/[companyId]/leaves` - Liste des congés (avec filtres par statut)
  - `POST /api/companies/[companyId]/leaves/[leaveId]/review` - Révision de congé (approbation/rejet)

### 3. API Memberships (8 tests)
- **CRUD complet** : GET, POST, DELETE pour les membres
- **Gestion d'erreurs** : Validation des données, membres inexistants, erreurs serveur
- **Endpoints testés** :
  - `GET /api/companies/[companyId]/memberships` - Liste des membres
  - `POST /api/companies/[companyId]/memberships` - Invitation de membre
  - `GET /api/companies/[companyId]/memberships/[membershipId]` - Détails d'un membre
  - `POST /api/companies/[companyId]/memberships/[membershipId]` - Mise à jour de membre
  - `DELETE /api/companies/[companyId]/memberships/[membershipId]` - Suppression de membre

### 4. API Company Stats (5 tests)
- **Consultation des statistiques** : GET des statistiques d'entreprise
- **Cas limites** : Entreprises sans données, statistiques vides
- **Gestion d'erreurs** : Entreprises inexistantes, erreurs de base de données, erreurs d'autorisation
- **Endpoints testés** :
  - `GET /api/companies/[companyId]/stats` - Statistiques d'entreprise

### 5. API Calendar & Leave Stats (8 tests)
- **Calendrier des congés** : GET du calendrier avec filtres par période
- **Statistiques des congés** : GET des statistiques détaillées
- **Gestion d'erreurs** : Calendriers vides, erreurs de base de données, paramètres manquants
- **Endpoints testés** :
  - `GET /api/companies/[companyId]/calendar` - Calendrier des congés
  - `GET /api/companies/[companyId]/leaves/stats` - Statistiques des congés

### 6. API Leave Balances & Member Leaves (11 tests)
- **Gestion des soldes** : GET et POST des soldes de congés
- **Historique des soldes** : GET de l'historique par membre
- **CRUD des congés de membres** : Opérations complètes sur les congés individuels
- **Gestion d'erreurs** : Données invalides, membres inexistants
- **Endpoints testés** :
  - `GET /api/companies/[companyId]/leave-balances` - Soldes de congés
  - `POST /api/companies/[companyId]/leave-balances` - Création de soldes
  - `GET /api/companies/[companyId]/memberships/[membershipId]/leave-balance-history` - Historique des soldes
  - `GET/POST/PATCH/DELETE /api/companies/[companyId]/memberships/[membershipId]/leaves` - CRUD des congés de membres

### 7. API Authentication & Approval Workflows (14 tests)
- **Tests d'authentification** : Tokens valides/expirés, permissions insuffisantes
- **Workflows d'approbation** : Approbation/rejet de congés, approbations en lot
- **Validation des données** : Prévention des auto-approbations, validation des rôles
- **Tests d'autorisation** : Vérification des permissions par rôle (ADMIN, MANAGER, EMPLOYEE)
- **Endpoints testés** :
  - Tous les endpoints avec tests d'authentification et d'autorisation
  - Workflows spécialisés d'approbation de congés

## Philosophie des Tests

Ces tests suivent une approche complète et robuste :

1. **Couverture complète** : Tests CRUD complets avec gestion d'erreurs
2. **Réalisme** : Simulation de scénarios réels d'utilisation
3. **Fiabilité** : Mocks appropriés sans dépendances externes
4. **Maintenabilité** : Structure claire et tests bien organisés
5. **Performance** : Exécution rapide grâce aux mocks

## Mocks d'Authentification

Tous les tests incluent des mocks simples pour l'authentification :

```typescript
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}))
```

## Couverture Actuelle

**Total : 60 tests (56 passent, 4 échouent)**

Les tests couvrent :

✅ **Opérations CRUD complètes** pour toutes les entités (Companies, Leaves, Memberships)
✅ **Validation des réponses API** avec vérification des structures de données
✅ **Gestion d'erreurs** pour tous les cas d'échec (données invalides, entités inexistantes, erreurs serveur)
✅ **Tests d'autorisation** via les mocks d'authentification et tests de permissions par rôle
✅ **Validation des données** avec des cas de données invalides et validation des contraintes métier
✅ **Workflows d'approbation** avec tests d'approbation/rejet de congés et approbations en lot
✅ **Statistiques et calendriers** avec tests de génération de données agrégées
✅ **Gestion des soldes de congés** avec historique et opérations de mise à jour
✅ **Tests d'authentification** avec gestion des tokens et permissions insuffisantes

## Extensions Futures Possibles

- Tests avec base de données de test réelle
- Tests de performance et de charge
- Tests d'intégration avec services externes
- Tests de sécurité avancés