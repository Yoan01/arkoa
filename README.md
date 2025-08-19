# Arkoa 🏖️

> **Plateforme moderne de gestion des congés et absences**

Arkoa est une application web complète développée avec Next.js pour simplifier la gestion des congés en entreprise. Elle offre un workflow d'approbation intuitif, un suivi des soldes en temps réel et une interface responsive adaptée aux employés et managers.

## 🚀 Fonctionnalités principales

- **Gestion des demandes** : Création, modification et suivi des demandes de congés
- **Workflow d'approbation** : Système de validation hiérarchique avec notifications
- **Soldes automatisés** : Calcul et historique des soldes par type de congé
- **Multi-entreprises** : Support de plusieurs organisations avec gestion des rôles
- **Types de congés** : CP, RTT, maladie, maternité, formation, etc.
- **Interface responsive** : Optimisée pour desktop et mobile
- **Authentification sécurisée** : Sessions protégées avec Better Auth

## 🛠️ Stack technique

- **Frontend** : Next.js 15.3.4 + React 19 + TypeScript
- **Backend** : API Routes Next.js + Prisma ORM
- **Base de données** : PostgreSQL
- **Authentification** : Better Auth
- **Validation** : Zod schemas
- **État global** : Zustand
- **UI/UX** : Tailwind CSS + Radix UI
- **Tests** : Jest + Testing Library + Playwright
- **Déploiement** : Docker + GitHub Actions

## 📋 Prérequis

- Node.js 20.11.1+
- PostgreSQL 14+
- pnpm (recommandé) ou npm

## ⚡ Installation

```bash
# Cloner le projet
git clone https://github.com/Yoan01/arkoa
cd arkoa

# Installer les dépendances
pnpm install

# Configurer l'environnement
# Créer manuellement le fichier .env et y ajouter vos variables d'environnement

# Configurer la base de données
pnpm prisma generate
pnpm prisma migrate dev

# Lancer en développement
pnpm dev
```

## 🔧 Scripts disponibles

```bash
# Développement
pnpm dev              # Serveur de développement (Turbopack)
pnpm build            # Build de production
pnpm start            # Serveur de production

# Qualité du code
pnpm lint             # ESLint + Prettier
pnpm lint:fix         # Correction automatique
pnpm ts:fix           # Vérification TypeScript

# Tests
pnpm test             # Tests unitaires
pnpm test:watch       # Tests en mode watch
pnpm test:coverage    # Couverture de code
pnpm test:integration # Tests d'intégration
pnpm test:e2e         # Tests end-to-end
pnpm test:all         # Tous les tests
```

## 📁 Structure du projet

```
arkoa/
├── app/                    # Next.js App Router
│   ├── api/               # Routes API
│   ├── auth/              # Pages d'authentification
│   ├── approvals/         # Gestion des approbations
│   ├── leaves/            # Gestion des congés
│   └── team/              # Gestion d'équipe
├── src/
│   ├── components/        # Composants React
│   │   ├── ui/           # Composants de base
│   │   ├── forms/        # Formulaires
│   │   └── layouts/      # Layouts
│   ├── hooks/            # Hooks personnalisés
│   ├── lib/              # Utilitaires et services
│   ├── schemas/          # Schémas Zod
│   └── stores/           # Stores Zustand
├── prisma/               # Configuration base de données
│   ├── schema.prisma     # Modèles de données
│   └── migrations/       # Migrations
└── e2e/                  # Tests end-to-end
```

## 🗄️ Modèles de données

Le schéma Prisma définit les entités principales :

- **User** : Utilisateurs avec authentification
- **Company** : Entreprises multi-tenant
- **Membership** : Relations utilisateur-entreprise avec rôles
- **Leave** : Demandes de congés avec workflow
- **LeaveBalance** : Soldes par type de congé
- **LeaveBalanceHistory** : Audit trail des modifications

## 🔒 Sécurité

- Authentification Better Auth avec sessions sécurisées
- Middleware de protection des routes
- Validation Zod côté client et serveur
- Système RBAC (Employee/Manager)
- Protection CSRF intégrée
- Variables d'environnement sécurisées

## 🧪 Tests et qualité

- **Couverture** : 75% minimum (branches, fonctions, lignes)
- **Tests unitaires** : Jest + Testing Library
- **Tests d'intégration** : API et base de données
- **Tests E2E** : Playwright
- **Linting** : ESLint + Prettier
- **Types** : TypeScript strict

## 🚀 Déploiement

### CI/CD automatisé

- **GitHub Actions** : Pipeline complet
- **Staging** : Déploiement automatique sur branche `staging`
- **Production** : Déploiement automatique sur branche `production`
- **Docker** : Images optimisées

### Variables d'environnement

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🤝 Contribution

1. Clone le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

### Standards de code

- TypeScript strict obligatoire
- Tests unitaires pour les nouvelles fonctionnalités
- Respect des conventions ESLint/Prettier
- Documentation des API avec JSDoc
- Validation Zod pour tous les inputs

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une [issue](https://github.com/votre-org/arkoa/issues)
<!-- - Consulter la [documentation](https://docs.arkoa.app) -->

---

**Arkoa v0.1.0** - Développé avec ❤️ par l'équipe Arkoa
