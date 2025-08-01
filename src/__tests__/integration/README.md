# Tests d'Intégration API - Version Simplifiée

Ce dossier contient des tests d'intégration simplifiés pour les APIs de l'application Arkoa. Ces tests vérifient que les modules API peuvent être importés et que les fonctions sont définies.

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

### 1. API Companies
- Vérification de l'import des fonctions `getCompanies` et `createCompany`

### 2. API Leaves
- Vérification de l'import de la fonction `getCompanyLeaves`

### 3. API Memberships
- Vérification de l'import des fonctions `getMemberships` et `inviteMember`

### 4. API Company Stats
- Vérification de l'import de la fonction `getCompanyStats`

## Philosophie des Tests

Ces tests suivent une approche minimaliste :

1. **Simplicité** : Tests basiques qui vérifient les imports
2. **Rapidité** : Exécution très rapide sans base de données
3. **Fiabilité** : Pas de dépendances externes complexes
4. **Maintenance** : Code minimal à maintenir

## Mocks d'Authentification

Tous les tests incluent des mocks simples pour l'authentification :

```typescript
jest.mock('../../lib/auth-server', () => ({
  requireAuth: jest.fn().mockResolvedValue({ user: { id: 'test-user-id' } }),
}))
```

## Extension Future

Ces tests peuvent être étendus pour inclure :

- Tests avec base de données de test
- Validation des réponses API
- Tests d'autorisation
- Tests de validation des données

Pour l'instant, ils servent de base solide et simple pour s'assurer que les modules API sont correctement structurés.