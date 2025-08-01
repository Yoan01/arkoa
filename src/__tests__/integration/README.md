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

### 1. API Companies (8 tests)
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

### 3. API Memberships (7 tests)
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

Les tests couvrent :

✅ **Opérations CRUD complètes** pour toutes les entités
✅ **Validation des réponses API** avec vérification des structures de données
✅ **Gestion d'erreurs** pour tous les cas d'échec
✅ **Tests d'autorisation** via les mocks d'authentification
✅ **Validation des données** avec des cas de données invalides

## Extensions Futures Possibles

- Tests avec base de données de test réelle
- Tests de performance et de charge
- Tests d'intégration avec services externes
- Tests de sécurité avancés