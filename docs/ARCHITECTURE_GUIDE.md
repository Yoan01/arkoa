# Guide d'Architecture - Arkoa

## Vue d'ensemble

Arkoa est une application web moderne de gestion des congés construite avec Next.js 15 et l'App Router. L'architecture suit les principes de séparation des responsabilités, de modularité et de sécurité.

## Table des matières

1. [Architecture générale](#architecture-générale)
2. [Stack technologique](#stack-technologique)
3. [Structure du projet](#structure-du-projet)
4. [Couches applicatives](#couches-applicatives)
5. [Base de données](#base-de-données)
6. [Authentification](#authentification)
7. [API et services](#api-et-services)
8. [Validation des données](#validation-des-données)
9. [Gestion des erreurs](#gestion-des-erreurs)
10. [Sécurité](#sécurité)
11. [Performance](#performance)
12. [Tests](#tests)

## Architecture générale

### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Pages     │  │ Components  │  │    Hooks & Utils    │  │
│  │ (App Router)│  │    (UI)     │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Next.js)                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ API Routes  │  │  Services   │  │    Validation       │  │
│  │             │  │  (Business) │  │     (Zod)           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                 Authentication (Better Auth)                │
├─────────────────────────────────────────────────────────────┤
│                   Database (PostgreSQL)                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Prisma    │  │   Models    │  │     Migrations      │  │
│  │    ORM      │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Principes architecturaux

1. **Séparation des responsabilités** : Chaque couche a une responsabilité claire
2. **Modularité** : Code organisé en modules réutilisables
3. **Type Safety** : TypeScript strict pour la sécurité des types
4. **Validation** : Validation des données avec Zod
5. **Sécurité** : Authentification et autorisation robustes
6. **Performance** : Optimisations Next.js et caching
7. **Testabilité** : Architecture facilitant les tests

## Stack technologique

### Frontend
- **Next.js 15** : Framework React avec App Router
- **React 18** : Bibliothèque UI avec Server Components
- **TypeScript** : Langage typé
- **Tailwind CSS** : Framework CSS utilitaire
- **Radix UI** : Composants UI accessibles
- **React Hook Form** : Gestion des formulaires
- **Zod** : Validation des schémas

### Backend
- **Next.js API Routes** : API REST intégrée
- **Better Auth** : Authentification et sessions
- **Prisma** : ORM et gestion de base de données
- **PostgreSQL** : Base de données relationnelle
- **Zod** : Validation côté serveur

### DevOps et outils
- **Docker** : Conteneurisation
- **pnpm** : Gestionnaire de paquets
- **ESLint** : Linting du code
- **Prettier** : Formatage du code
- **Jest** : Tests unitaires
- **Testing Library** : Tests de composants

## Structure du projet

```
arkoa/
├── app/                           # Next.js App Router
│   ├── api/                       # API Routes
│   │   ├── auth/                  # Endpoints Better Auth
│   │   │   └── [...all]/          # Gestionnaire Better Auth
│   │   └── companies/             # API des entreprises
│   │       ├── route.ts           # CRUD entreprises
│   │       └── [companyId]/       # Routes spécifiques à une entreprise
│   │           ├── route.ts       # Détails entreprise
│   │           ├── calendar/      # Calendrier des congés
│   │           ├── leaves/        # Congés de l'entreprise
│   │           ├── memberships/   # Membres de l'entreprise
│   │           └── stats/         # Statistiques
│   ├── approvals/                 # Page d'approbation des congés
│   │   └── page.tsx
│   ├── auth/                      # Pages d'authentification
│   │   ├── layout.tsx             # Layout pour les pages auth
│   │   ├── signin/                # Page de connexion
│   │   └── signup/                # Page d'inscription
│   ├── hr/                        # Page RH
│   │   └── page.tsx
│   ├── leaves/                    # Page de gestion des congés
│   │   └── page.tsx
│   ├── team/                      # Pages de gestion d'équipe
│   │   ├── [membershipId]/        # Détails d'un membre
│   │   └── page.tsx               # Liste des membres
│   ├── favicon.ico                # Icône du site
│   ├── globals.css                # Styles globaux
│   ├── layout.tsx                 # Layout racine
│   └── page.tsx                   # Page d'accueil
├── src/
│   ├── __tests__/                 # Tests d'intégration
│   │   └── integration/
│   ├── components/                # Composants React réutilisables
│   │   ├── approvals/             # Composants pour les approbations
│   │   ├── auth/                  # Composants d'authentification
│   │   ├── company/               # Composants de gestion d'entreprise
│   │   ├── dashboard/             # Composants du tableau de bord
│   │   ├── hr/                    # Composants RH
│   │   ├── layouts/               # Composants de mise en page
│   │   ├── leaves/                # Composants de gestion des congés
│   │   ├── leaves-balances/       # Composants de soldes de congés
│   │   ├── nav/                   # Composants de navigation
│   │   ├── providers/             # Providers React
│   │   ├── team/                  # Composants de gestion d'équipe
│   │   └── ui/                    # Composants UI de base
│   ├── generated/                 # Code généré automatiquement
│   ├── hooks/                     # Hooks React personnalisés
│   │   ├── __tests__/             # Tests des hooks
│   │   ├── api/                   # Hooks pour les API
│   │   └── use-mobile.ts          # Hook de détection mobile
│   ├── lib/                       # Utilitaires et configuration
│   │   ├── __tests__/             # Tests des utilitaires
│   │   ├── auth.ts                # Configuration Better Auth
│   │   ├── auth-client.ts         # Client d'authentification
│   │   ├── auth-server.ts         # Serveur d'authentification
│   │   ├── constants.ts           # Constantes de l'application
│   │   ├── dayjs-config.ts        # Configuration Day.js
│   │   ├── errors.ts              # Classes d'erreur personnalisées
│   │   ├── prisma.ts              # Configuration Prisma
│   │   ├── test-utils.tsx         # Utilitaires pour les tests
│   │   ├── utils.ts               # Utilitaires généraux
│   │   ├── validator.ts           # Utilitaires de validation
│   │   ├── services/              # Services métier
│   │   └── types/                 # Types TypeScript partagés
│   ├── mocks/                     # Mocks pour les tests
│   │   ├── handlers.ts            # Gestionnaires MSW
│   │   └── server.ts              # Serveur de mock
│   ├── schemas/                   # Schémas de validation Zod
│   │   ├── __tests__/             # Tests des schémas
│   │   ├── company-stats-schema.ts
│   │   ├── create-company-schema.ts
│   │   ├── create-leave-schema.ts
│   │   ├── edit-leave-balance-dialog-schema.ts
│   │   ├── invite-member-schema.ts
│   │   ├── review-leave-schema.ts
│   │   ├── update-company-schema.ts
│   │   ├── update-leave-balance-schema.ts
│   │   ├── update-leave-schema.ts
│   │   ├── update-membership-schema.ts
│   │   └── queries/               # Schémas pour les requêtes
│   ├── stores/                    # Stores de gestion d'état
│   │   ├── __tests__/             # Tests des stores
│   │   ├── slices/                # Slices de store
│   │   ├── storages/              # Configuration de stockage
│   │   └── use-company-store.ts   # Store principal des entreprises
│   └── types/                     # Types TypeScript
│       └── jest-dom.d.ts          # Types pour Jest DOM
├── e2e/                           # Tests end-to-end
│   └── homepage.spec.ts
├── playwright-report/             # Rapports Playwright
├── prisma/                        # Configuration Prisma
│   ├── migrations/                # Migrations de base de données
│   └── schema.prisma              # Schéma de base de données
├── public/                        # Fichiers statiques
│   ├── file.svg
│   ├── globe.svg
│   ├── logo_arkoa.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── docs/                          # Documentation
├── components.json                # Configuration des composants UI
├── docker-compose.production.yml  # Docker Compose pour la production
├── docker-compose.staging.yml     # Docker Compose pour le staging
├── Dockerfile                     # Configuration Docker
├── eslint.config.mjs              # Configuration ESLint
├── jest.config.js                 # Configuration Jest
├── jest.integration.config.js     # Configuration Jest pour l'intégration
├── jest.setup.js                  # Setup Jest
├── middleware.ts                  # Middleware Next.js
├── next.config.ts                 # Configuration Next.js
├── package.json                   # Dépendances et scripts
├── playwright.config.ts           # Configuration Playwright
├── postcss.config.mjs             # Configuration PostCSS
├── tailwind.config.js             # Configuration Tailwind CSS
└── tsconfig.json                  # Configuration TypeScript
```

## Couches applicatives

### 1. Couche de présentation (Frontend)

#### Pages et routing
- **App Router** : Routing basé sur le système de fichiers
- **Server Components** : Rendu côté serveur par défaut
- **Client Components** : Interactivité côté client
- **Layouts** : Mise en page partagée

#### Composants UI
```typescript
// Exemple de composant UI
export function Button({ children, variant = 'default', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium',
        variants[variant]
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

#### Gestion d'état
- **React State** : État local des composants
- **Server State** : Données serveur via API
- **Form State** : React Hook Form pour les formulaires

### 2. Couche API (Backend)

#### API Routes
```typescript
// Exemple d'API Route
export async function GET(request: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const companies = await getCompaniesForUser(session.user.id)
    return NextResponse.json(companies)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

#### Middleware
```typescript
// Middleware d'authentification
export async function middleware(request: NextRequest) {
  const session = await getSession()
  
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }
  
  return NextResponse.next()
}
```

### 3. Couche de services (Business Logic)

#### Services métier
```typescript
// Service des congés
export class LeaveService {
  static async createLeave(data: CreateLeaveData, userId: string) {
    // Validation des données
    const validatedData = createLeaveSchema.parse(data)
    
    // Vérification des permissions
    await this.checkPermissions(userId, data.companyId)
    
    // Calcul des jours ouvrés
    const workingDays = calculateWorkingDays(
      validatedData.startDate,
      validatedData.endDate
    )
    
    // Création en base
    return await db.leave.create({
      data: {
        ...validatedData,
        workingDays,
        status: 'PENDING'
      }
    })
  }
}
```

### 4. Couche de données (Database)

#### Modèles Prisma
```prisma
model Leave {
  id            String     @id @default(cuid())
  type          LeaveType
  startDate     DateTime
  endDate       DateTime
  halfDayPeriod HalfDayPeriod?
  workingDays   Float
  status        LeaveStatus @default(PENDING)
  reason        String?
  managerNote   String?
  
  membershipId  String
  membership    Membership @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}
```

## Base de données

### Schéma relationnel

```
User (1) ──── (N) Membership (N) ──── (1) Company
                    │
                    │ (1)
                    │
                    ▼ (N)
                  Leave
                    │
                    │ (1)
                    │
                    ▼ (N)
              LeaveBalance
                    │
                    │ (1)
                    │
                    ▼ (N)
          LeaveBalanceHistory
```

### Modèles principaux

1. **User** : Utilisateurs de la plateforme
2. **Company** : Entreprises clientes
3. **Membership** : Relation utilisateur-entreprise avec rôle
4. **Leave** : Demandes de congés
5. **LeaveBalance** : Soldes de congés par type
6. **LeaveBalanceHistory** : Historique des modifications

### Énumérations

```prisma
enum UserRole {
  EMPLOYEE
  MANAGER
}

enum LeaveType {
  PAID
  UNPAID
  RTT
  SICK
  MATERNITY
  PATERNITY
  PARENTAL
  BEREAVEMENT
  MARRIAGE
  MOVING
  CHILD_SICK
  TRAINING
  UNJUSTIFIED
  ADJUSTMENT
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELED
}
```

## Authentification

### Configuration Better Auth

```typescript
export const auth = betterAuth({
  database: {
    provider: 'prisma',
    adapter: prismaAdapter(db)
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24 // 1 jour
  },
  trustedOrigins: [
    process.env.NEXT_PUBLIC_APP_URL!,
    'http://localhost:3000'
  ]
})
```

### Gestion des sessions

```typescript
// Côté serveur
export async function getSession() {
  const session = await auth.api.getSession({
    headers: headers()
  })
  return session
}

// Côté client
export function useSession() {
  return authClient.useSession()
}
```

### Protection des routes

```typescript
// Middleware de protection
export async function requireAuth() {
  const session = await getSession()
  if (!session?.user) {
    throw new Error('Authentication required')
  }
  return session
}
```

## API et services

### Architecture REST

L'API suit les conventions REST avec une structure hiérarchique :

```
GET    /api/companies                           # Liste des entreprises
POST   /api/companies                           # Créer une entreprise
GET    /api/companies/{companyId}               # Détails d'une entreprise
PATCH  /api/companies/{companyId}               # Modifier une entreprise
DELETE /api/companies/{companyId}               # Supprimer une entreprise

GET    /api/companies/{companyId}/memberships          # Membres de l'entreprise
POST   /api/companies/{companyId}/memberships          # Inviter un membre
GET    /api/companies/{companyId}/memberships/{membershipId}     # Détails d'un membre
POST   /api/companies/{companyId}/memberships/{membershipId}     # Modifier un membre
DELETE /api/companies/{companyId}/memberships/{membershipId}     # Supprimer un membre

GET    /api/companies/{companyId}/memberships/{membershipId}/leaves        # Congés d'un membre
POST   /api/companies/{companyId}/memberships/{membershipId}/leaves        # Créer un congé
PATCH  /api/companies/{companyId}/memberships/{membershipId}/leaves/{leaveId}   # Modifier un congé
DELETE /api/companies/{companyId}/memberships/{membershipId}/leaves/{leaveId}   # Supprimer un congé
```

### Services métier

#### CompanyService
```typescript
export class CompanyService {
  static async createCompany(data: CreateCompanyData, userId: string) {
    const validatedData = createCompanySchema.parse(data)
    
    return await db.$transaction(async (tx) => {
      // Créer l'entreprise
      const company = await tx.company.create({
        data: validatedData
      })
      
      // Créer l'adhésion du créateur comme manager
      await tx.membership.create({
        data: {
          userId,
          companyId: company.id,
          role: 'MANAGER'
        }
      })
      
      return company
    })
  }
}
```

#### LeaveService
```typescript
export class LeaveService {
  static async calculateWorkingDays(startDate: Date, endDate: Date): Promise<number> {
    let workingDays = 0
    const current = new Date(startDate)
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Pas weekend
        workingDays++
      }
      current.setDate(current.getDate() + 1)
    }
    
    return workingDays
  }
}
```

## Validation des données

### Schémas Zod

```typescript
// Schéma de création de congé
export const createLeaveSchema = z.object({
  type: z.nativeEnum(LeaveType),
  startDate: z.date(),
  endDate: z.date(),
  halfDayPeriod: z.nativeEnum(HalfDayPeriod).optional(),
  reason: z.string().optional()
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: "La date de fin doit être postérieure à la date de début",
    path: ["endDate"]
  }
)
```

### Validation côté API

```typescript
export async function validateBody<T>(schema: z.ZodSchema<T>, request: Request): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError('Invalid request data', error.errors)
    }
    throw error
  }
}
```

## Gestion des erreurs

### Classes d'erreur personnalisées

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details: any[]) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}
```

### Gestionnaire d'erreurs global

```typescript
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)
  
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { details: error.details })
      },
      { status: error.statusCode }
    )
  }
  
  return NextResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  )
}
```

## Sécurité

### Mesures de sécurité implémentées

1. **Authentification** : Better Auth avec sessions sécurisées
2. **Autorisation** : Contrôle d'accès basé sur les rôles
3. **Validation** : Validation stricte avec Zod
4. **Protection CSRF** : Intégrée dans Better Auth
5. **Cookies sécurisés** : HttpOnly, Secure, SameSite
6. **Rate limiting** : Protection contre les attaques par déni de service

### Contrôle d'accès

```typescript
export async function checkCompanyAccess(userId: string, companyId: string) {
  const membership = await db.membership.findFirst({
    where: {
      userId,
      companyId
    }
  })
  
  if (!membership) {
    throw new UnauthorizedError('Access denied to this company')
  }
  
  return membership
}
```

## Performance

### Optimisations Next.js

1. **Server Components** : Rendu côté serveur par défaut
2. **Static Generation** : Pages statiques quand possible
3. **Image Optimization** : Composant Image optimisé
4. **Bundle Splitting** : Division automatique du code
5. **Caching** : Cache des réponses API

### Optimisations base de données

```typescript
// Index sur les colonnes fréquemment requêtées
// Dans schema.prisma
model Leave {
  // ...
  @@index([membershipId, status])
  @@index([startDate, endDate])
}
```

### Monitoring et métriques

**Note** : Le système de métriques avancées avec Prometheus est prévu pour une version future (voir roadmap Q1 2025).

Actuellement disponible :
- Métriques Prisma intégrées (via le client généré)
- Logs d'application Next.js
- Métriques Docker (CPU, mémoire, réseau)
- Health checks via `/api/health`

Prévu pour Q1 2025 :
- Métriques Prometheus personnalisées
- Dashboard de monitoring
- Alerting automatique

## Tests

### Architecture de tests

```
tests/
├── unit/                    # Tests unitaires
│   ├── services/           # Tests des services
│   ├── utils/              # Tests des utilitaires
│   └── schemas/            # Tests de validation
├── integration/            # Tests d'intégration
│   ├── api/               # Tests des API routes
│   └── database/          # Tests de base de données
├── e2e/                   # Tests end-to-end
│   ├── auth/              # Tests d'authentification
│   ├── companies/         # Tests de gestion d'entreprises
│   └── leaves/            # Tests de gestion de congés
└── fixtures/              # Données de test
```

### Exemple de test de service

```typescript
describe('LeaveService', () => {
  describe('createLeave', () => {
    it('should create a leave request successfully', async () => {
      const leaveData = {
        type: 'PAID' as LeaveType,
        startDate: new Date('2024-02-10'),
        endDate: new Date('2024-02-14'),
        reason: 'Vacances'
      }
      
      const result = await LeaveService.createLeave(leaveData, 'user-id')
      
      expect(result).toMatchObject({
        type: 'PAID',
        status: 'PENDING',
        workingDays: 5
      })
    })
  })
})
```

### Tests d'intégration API

```typescript
describe('/api/companies', () => {
  it('should create a company', async () => {
    const response = await request(app)
      .post('/api/companies')
      .set('Cookie', authCookie)
      .send({
        name: 'Test Company',
        annualLeaveDays: 25
      })
    
    expect(response.status).toBe(201)
    expect(response.body).toMatchObject({
      name: 'Test Company',
      annualLeaveDays: 25
    })
  })
})
```

## Déploiement et infrastructure

### Architecture de déploiement

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Actions│    │   Application   │    │    Database     │
│     CI/CD       │────│   (Next.js)     │────│   (PostgreSQL)  │
│                 │    │   + Prisma      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              │
                       ┌─────────────────┐
                       │     Dokploy     │
                       │   Deployment    │
                       │   Platform      │
                       └─────────────────┘
```

### Configuration Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install pnpm
RUN npm install -g pnpm@8

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set correct permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

### Configuration Docker Compose

#### Production (docker-compose.production.yml)
```yaml
services:
  web:
    build: .
    ports:
      - "4000:3000"
    environment:
      - NODE_ENV=production
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - DATABASE_URL=${DATABASE_URL}
    command: pnpm start
```

#### Staging (docker-compose.staging.yml)
```yaml
services:
  web:
    build: .
    ports:
      - "4001:3000"
    environment:
      - NODE_ENV=staging
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
      - BETTER_AUTH_URL=${BETTER_AUTH_URL}
      - DATABASE_URL=${DATABASE_URL}
    command: pnpm start
```

### Pipeline CI/CD

#### GitHub Actions (.github/workflows/ci-cd.yml)
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [prod, staging]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  test-and-deploy:
    name: Test and Deploy
    runs-on: ubuntu-latest
    
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
        run: pnpm install --no-frozen-lockfile
        
      - name: TypeScript check
        run: pnpm ts:fix
        
      - name: Lint check
        run: pnpm lint
        
      - name: Run tests
        run: pnpm test:ci
        
      - name: Build application
        run: pnpm build
        
      - name: Deploy to Staging
        if: github.ref == 'refs/heads/staging'
        run: |
          curl -X POST \
            "${{ secrets.DOKPLOY_URL }}/api/compose.deploy" \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H "x-api-key: ${{ secrets.DOKPLOY_API_KEY }}" \
            -d '{
              "composeId": "${{ secrets.STAGING_APP_ID }}"
            }'
          
      - name: Deploy to Production
        if: github.ref == 'refs/heads/production'
        run: |
          curl -X POST \
            "${{ secrets.DOKPLOY_URL }}/api/compose.deploy" \
            -H 'accept: application/json' \
            -H 'Content-Type: application/json' \
            -H "x-api-key: ${{ secrets.DOKPLOY_API_KEY }}" \
            -d '{
              "composeId": "${{ secrets.PRODUCTION_APP_ID }}"
            }'
```

### Environnements de déploiement

#### Staging
- **URL** : Configurée via `BETTER_AUTH_URL`
- **Port** : 4001 (mappé vers 3000 dans le conteneur)
- **Branche** : `staging`
- **Base de données** : Instance de staging

#### Production
- **URL** : Configurée via `BETTER_AUTH_URL`
- **Port** : 4000 (mappé vers 3000 dans le conteneur)
- **Branche** : `prod`
- **Base de données** : Instance de production

### Variables d'environnement

#### Variables requises
```bash
# Authentification
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com

# Base de données
DATABASE_URL=postgresql://user:password@host:port/database

# Environnement
NODE_ENV=production|staging|development
```

#### Secrets GitHub Actions
- `DOKPLOY_URL` : URL de l'instance Dokploy
- `DOKPLOY_API_KEY` : Clé API pour l'authentification Dokploy
- `STAGING_APP_ID` : ID de l'application staging dans Dokploy
- `PRODUCTION_APP_ID` : ID de l'application production dans Dokploy

## Évolutions futures

#### Roadmap technique

**Phase 1 : Optimisation des performances**
- Mise en place de Redis pour le cache
- Optimisation des requêtes base de données
- Implémentation du lazy loading

**Phase 2 : Scalabilité**
- Migration vers une architecture microservices
- Mise en place d'un message broker (RabbitMQ)
- Implémentation de la réplication de base de données

**Phase 3 : Observabilité**
- Intégration de Prometheus/Grafana
- Mise en place de logs centralisés
- Monitoring applicatif avancé

### Améliorations prévues

- **Performance** : Mise en cache Redis, CDN
- **Sécurité** : Audit de sécurité, penetration testing
- **Monitoring** : Observabilité complète avec OpenTelemetry
- **Scalabilité** : Architecture distribuée

---

**Version** : 1.0.0  
**Dernière mise à jour** : Août 2025  
**Compatibilité** : Next.js 15+, Node.js 18+