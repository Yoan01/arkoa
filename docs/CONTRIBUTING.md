# Guide de contribution - Arkoa

## Bienvenue !

Merci de votre intérêt pour contribuer au projet Arkoa ! Ce guide vous aidera à comprendre comment participer efficacement au développement.

## Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment contribuer](#comment-contribuer)
- [Configuration de l'environnement](#configuration-de-lenvironnement)
- [Standards de développement](#standards-de-développement)
- [Processus de développement](#processus-de-développement)
- [Tests](#tests)
- [Documentation](#documentation)
- [Revue de code](#revue-de-code)

## Code de conduite

En participant à ce projet, vous acceptez de respecter notre code de conduite :

- **Respect** : Traitez tous les contributeurs avec respect et courtoisie
- **Inclusivité** : Accueillez les contributions de tous, indépendamment de leur niveau d'expérience
- **Collaboration** : Travaillez ensemble de manière constructive
- **Qualité** : Maintenez des standards élevés de qualité de code

## Comment contribuer

### Types de contributions

- 🐛 **Correction de bugs** : Signaler et corriger des problèmes
- ✨ **Nouvelles fonctionnalités** : Proposer et implémenter de nouvelles features
- 📚 **Documentation** : Améliorer la documentation existante
- 🧪 **Tests** : Ajouter ou améliorer la couverture de tests
- 🎨 **UI/UX** : Améliorer l'interface utilisateur
- ⚡ **Performance** : Optimiser les performances

### Avant de commencer

1. **Vérifiez les issues existantes** pour éviter les doublons
2. **Créez une issue** pour discuter des changements majeurs
3. **Forkez le repository** et créez une branche pour votre contribution

## Configuration de l'environnement

### Prérequis

- Node.js 20+
- pnpm 8+
- Git
- PostgreSQL 14+

### Installation

```bash
# 1. Forker le repository sur GitHub
# 2. Cloner votre fork
git clone https://github.com/VOTRE-USERNAME/arkoa.git
cd arkoa

# 3. Ajouter le repository original comme remote
git remote add upstream https://github.com/ORGANISATION/arkoa.git

# 4. Installer les dépendances
pnpm install

# 5. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 6. Initialiser la base de données
npx prisma migrate dev
npx prisma db seed

# 7. Démarrer l'application
pnpm dev
```

### Outils de développement

```bash
# Installer les extensions VSCode recommandées
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension ms-vscode.vscode-typescript-next
```

## Standards de développement

### Structure du projet

```
src/
├── app/                 # Pages Next.js (App Router)
├── components/          # Composants React réutilisables
│   ├── ui/             # Composants UI de base
│   └── forms/          # Composants de formulaires
├── lib/                # Utilitaires et configurations
├── schemas/            # Schémas de validation Zod
├── types/              # Types TypeScript
└── __tests__/          # Tests
    ├── unit/           # Tests unitaires
    ├── integration/    # Tests d'intégration
    └── e2e/           # Tests end-to-end
```

### Conventions de nommage

#### Fichiers et dossiers
- **kebab-case** pour les fichiers : `user-profile.tsx`
- **camelCase** pour les dossiers : `userManagement/`
- **PascalCase** pour les composants : `UserProfile.tsx`

#### Code
- **camelCase** pour les variables et fonctions : `userName`, `getUserData()`
- **PascalCase** pour les composants et classes : `UserProfile`, `ApiError`
- **UPPER_SNAKE_CASE** pour les constantes : `MAX_FILE_SIZE`

### Standards TypeScript

```typescript
// ✅ Bon
interface UserProps {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE'
}

const UserCard: React.FC<UserProps> = ({ id, name, email, role }) => {
  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold">{name}</h3>
      <p className="text-gray-600">{email}</p>
      <span className="badge">{role}</span>
    </div>
  )
}

// ❌ Éviter
const usercard = (props: any) => {
  return <div>{props.name}</div>
}
```

### Standards CSS/Tailwind

```tsx
// ✅ Bon - Classes organisées et lisibles
<div className="
  flex items-center justify-between
  p-4 mb-4
  bg-white border border-gray-200 rounded-lg shadow-sm
  hover:shadow-md transition-shadow
">

// ❌ Éviter - Classes en une seule ligne
<div className="flex items-center justify-between p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
```

## Processus de développement

### 1. Créer une branche

```bash
# Synchroniser avec upstream
git checkout main
git pull upstream main

# Créer une nouvelle branche
git checkout -b feature/nom-de-la-feature
# ou
git checkout -b fix/description-du-bug
```

### 2. Développer

```bash
# Faire vos modifications
# Tester régulièrement
pnpm test
pnpm lint

# Commiter fréquemment avec des messages clairs
git add .
git commit -m "feat: ajouter validation email dans le formulaire d'inscription"
```

### 3. Messages de commit

Utilisez la convention [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Types de commits
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation
style:    # Formatage, point-virgules manquants, etc.
refactor: # Refactoring de code
test:     # Ajout ou modification de tests
chore:    # Maintenance, dépendances, etc.

# Exemples
git commit -m "feat: ajouter système de notifications push"
git commit -m "fix: corriger le calcul des jours de congés restants"
git commit -m "docs: mettre à jour le guide d'installation"
git commit -m "test: ajouter tests pour l'API de gestion des congés"
```

### 4. Pousser et créer une Pull Request

```bash
# Pousser la branche
git push origin feature/nom-de-la-feature

# Créer une Pull Request sur GitHub
# Utiliser le template fourni
```

## Tests

### Types de tests

#### Tests unitaires (Jest)
```bash
# Exécuter tous les tests unitaires
pnpm test:unit

# Exécuter en mode watch
pnpm test:unit --watch

# Avec couverture
pnpm test:coverage
```

#### Tests d'intégration
```bash
# Tests d'API
pnpm test:integration

# Tests spécifiques
pnpm test:integration -- --testNamePattern="Company API"
```

#### Tests E2E (Playwright)
```bash
# Tous les tests E2E
pnpm test:e2e

# Tests en mode UI
pnpm test:e2e --ui

# Tests sur un navigateur spécifique
pnpm test:e2e --project=chromium
```

### Écrire des tests

#### Test unitaire d'un composant
```typescript
// src/components/__tests__/UserCard.test.tsx
import { render, screen } from '@testing-library/react'
import { UserCard } from '../UserCard'

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'EMPLOYEE' as const
  }

  it('should render user information correctly', () => {
    render(<UserCard {...mockUser} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('EMPLOYEE')).toBeInTheDocument()
  })

  it('should have proper accessibility attributes', () => {
    render(<UserCard {...mockUser} />)
    
    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('aria-label', 'User card for John Doe')
  })
})
```

#### Test d'intégration d'API
```typescript
// src/__tests__/integration/users.api.test.ts
import { testApiHandler } from 'next-test-api-route-handler'
import handler from '@/app/api/users/route'

describe('/api/users', () => {
  it('should create a new user', async () => {
    await testApiHandler({
      handler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: 'EMPLOYEE'
          })
        })
        
        expect(res.status).toBe(201)
        const user = await res.json()
        expect(user.email).toBe('jane@example.com')
      }
    })
  })
})
```

#### Test E2E
```typescript
// tests/e2e/user-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('User Management', () => {
  test('should create a new user', async ({ page }) => {
    await page.goto('/admin/users')
    
    await page.click('[data-testid="add-user-button"]')
    await page.fill('[data-testid="user-name"]', 'Test User')
    await page.fill('[data-testid="user-email"]', 'test@example.com')
    await page.selectOption('[data-testid="user-role"]', 'EMPLOYEE')
    
    await page.click('[data-testid="submit-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('text=Test User')).toBeVisible()
  })
})
```

## Documentation

### Documentation du code

```typescript
/**
 * Calcule le nombre de jours de congés restants pour un utilisateur
 * 
 * @param userId - L'ID de l'utilisateur
 * @param year - L'année pour laquelle calculer (défaut: année courante)
 * @returns Le nombre de jours restants
 * 
 * @example
 * ```typescript
 * const remainingDays = await calculateRemainingLeaves('user-123', 2024)
 * console.log(`Jours restants: ${remainingDays}`) // Jours restants: 15
 * ```
 */
export async function calculateRemainingLeaves(
  userId: string,
  year: number = new Date().getFullYear()
): Promise<number> {
  // Implémentation...
}
```

### Documentation des composants

```typescript
/**
 * Composant pour afficher et gérer les informations d'un utilisateur
 * 
 * @component
 * @example
 * ```tsx
 * <UserCard
 *   user={{ id: '1', name: 'John', email: 'john@example.com', role: 'EMPLOYEE' }}
 *   onEdit={(user) => console.log('Edit:', user)}
 *   onDelete={(id) => console.log('Delete:', id)}
 * />
 * ```
 */
interface UserCardProps {
  /** Les données de l'utilisateur à afficher */
  user: User
  /** Callback appelé lors de l'édition */
  onEdit?: (user: User) => void
  /** Callback appelé lors de la suppression */
  onDelete?: (id: string) => void
}
```

## Revue de code

### Checklist pour les Pull Requests

#### Avant de soumettre
- [ ] Les tests passent (`pnpm test`)
- [ ] Le linting passe (`pnpm lint`)
- [ ] TypeScript compile sans erreur (`pnpm ts:fix`)
- [ ] La documentation est à jour
- [ ] Les changements sont testés manuellement
- [ ] Les messages de commit suivent la convention

#### Template de Pull Request

```markdown
## Description
Brève description des changements apportés.

## Type de changement
- [ ] Bug fix (changement non-breaking qui corrige un problème)
- [ ] Nouvelle fonctionnalité (changement non-breaking qui ajoute une fonctionnalité)
- [ ] Breaking change (correction ou fonctionnalité qui casserait la fonctionnalité existante)
- [ ] Documentation uniquement

## Comment tester
1. Étapes pour reproduire/tester
2. Comportement attendu
3. Captures d'écran si applicable

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai effectué une auto-revue de mon code
- [ ] J'ai commenté mon code, particulièrement dans les zones difficiles à comprendre
- [ ] J'ai apporté les changements correspondants à la documentation
- [ ] Mes changements ne génèrent aucun nouvel avertissement
- [ ] J'ai ajouté des tests qui prouvent que ma correction est efficace ou que ma fonctionnalité fonctionne
- [ ] Les tests unitaires nouveaux et existants passent localement avec mes changements
```

### Critères de revue

#### Code Quality
- **Lisibilité** : Le code est-il facile à comprendre ?
- **Maintenabilité** : Le code est-il facile à modifier ?
- **Performance** : Y a-t-il des problèmes de performance ?
- **Sécurité** : Y a-t-il des vulnérabilités potentielles ?

#### Tests
- **Couverture** : Les nouveaux codes sont-ils testés ?
- **Qualité** : Les tests sont-ils significatifs ?
- **Edge cases** : Les cas limites sont-ils couverts ?

#### Documentation
- **Clarté** : La documentation est-elle claire ?
- **Complétude** : Tous les aspects sont-ils documentés ?
- **Exemples** : Y a-t-il des exemples d'utilisation ?

## Ressources utiles

### Documentation technique
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)

### Outils de développement
- [VSCode Extensions](https://marketplace.visualstudio.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Prisma Studio](https://www.prisma.io/studio)

### Communauté
- [GitHub Issues](https://github.com/ORGANISATION/arkoa/issues)
- [GitHub Discussions](https://github.com/ORGANISATION/arkoa/discussions)

---

**Merci de contribuer à Arkoa !** 🚀

Votre participation aide à améliorer l'outil de gestion RH pour tous les utilisateurs.

**Questions ?** N'hésitez pas à créer une issue ou à participer aux discussions GitHub.