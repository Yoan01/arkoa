# Guide d'Installation - Arkoa

## Prérequis système

### Logiciels requis

- **Node.js** : Version 18.19.1 ou supérieure (LTS recommandée)
- **pnpm** : Version 8.0+ (gestionnaire de paquets recommandé)
- **Git** : Pour cloner le repository
- **Docker** : Version 20.10+ (optionnel, pour le déploiement)
- **PostgreSQL** : Version 14+ (base de données)

### Versions des technologies principales

- **Next.js** : 15.3.4
- **React** : 19.0.0
- **TypeScript** : 5.x
- **Prisma** : 6.10.1
- **Better Auth** : 1.2.10

### Vérification des prérequis

```bash
# Vérifier les versions installées
node --version    # Doit être >= 18.19.1
pnpm --version    # Doit être >= 8.0
git --version
docker --version  # Optionnel
psql --version    # Doit être >= 14

# Vérifier que pnpm est bien installé
npm install -g pnpm@latest
```

## Installation pour le développement

### 1. Cloner le projet

```bash
git clone <url-du-repository>
cd arkoa
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configuration de la base de données

#### Option A : PostgreSQL local

1. Installer PostgreSQL sur votre système
2. Créer une base de données :

```sql
CREATE DATABASE arkoa;
CREATE USER arkoa_user WITH PASSWORD 'arkoa_password';
GRANT ALL PRIVILEGES ON DATABASE arkoa TO arkoa_user;
```

#### Option B : PostgreSQL avec Docker

```bash
# Démarrer PostgreSQL avec Docker
docker run --name arkoa-postgres \
  -e POSTGRES_DB=arkoa \
  -e POSTGRES_USER=arkoa_user \
  -e POSTGRES_PASSWORD=arkoa_password \
  -p 5432:5432 \
  -d postgres:15
```

### 4. Configuration des variables d'environnement

Créer un fichier `.env.local` :

```bash
touch .env.local
```

Contenu du fichier `.env.local` :

```env
# Base de données
DATABASE_URL="postgresql://arkoa_user:arkoa_password@localhost:5432/arkoa"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
```

### 5. Initialiser la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev
```

### 6. Démarrer l'application

```bash
# Démarrer en mode développement (avec Turbopack)
pnpm dev

# L'application sera accessible sur http://localhost:3000
```

### 7. Vérifier l'installation

```bash
# Tests unitaires
pnpm test              # Tests unitaires
pnpm test:watch        # Tests unitaires en mode watch
pnpm test:coverage     # Tests unitaires avec couverture
pnpm test:ci           # Tests unitaires pour CI

# Tests d'intégration
pnpm test:integration  # Tests d'intégration
pnpm test:integration:watch    # Tests d'intégration en mode watch
pnpm test:integration:coverage # Tests d'intégration avec couverture
pnpm test:integration:ci       # Tests d'intégration pour CI

# Tests end-to-end
pnpm test:e2e          # Tests E2E avec Playwright
pnpm test:e2e:ui       # Tests E2E avec interface Playwright UI
pnpm test:e2e:headed   # Tests E2E avec interface graphique

# Exécuter tous les tests
pnpm test:all          # Tests unitaires + intégration + E2E (CI)

# Vérifier le linting
pnpm lint

# Corriger automatiquement le linting
pnpm lint:fix

# Vérifier TypeScript
pnpm ts:fix
```

## Installation pour la production

### 1. Préparer l'environnement

```bash
# Cloner le projet
git clone https://github.com/votre-organisation/arkoa.git
cd arkoa

# Installer les dépendances
pnpm install --prod
```

### 2. Configuration production

Créer un fichier `.env.production` :

```bash
# Base de données production
DATABASE_URL="postgresql://user:password@prod-db-host:5432/arkoa"

# Authentification
BETTER_AUTH_SECRET="clé-secrète-production-très-sécurisée"
BETTER_AUTH_URL="https://votre-domaine.com"
NEXT_PUBLIC_APP_URL="https://votre-domaine.com"

# Environnement
NODE_ENV="production"
```

### 3. Build et déploiement

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate deploy

# Construire l'application
pnpm build

# Démarrer en production
pnpm start
```

## Installation avec Docker

### 1. Build de l'image Docker

```bash
# Construire l'image
docker build -t arkoa .
```

### 2. Démarrer avec Docker

```bash
# Démarrer PostgreSQL
docker run --name arkoa-postgres \
  -e POSTGRES_DB=arkoa \
  -e POSTGRES_USER=arkoa_user \
  -e POSTGRES_PASSWORD=arkoa_password \
  -p 5432:5432 \
  -d postgres:15

# Démarrer l'application
docker run --name arkoa-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://arkoa_user:arkoa_password@host.docker.internal:5432/arkoa" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  -e NODE_ENV="production" \
  --link arkoa-postgres:postgres \
  -d arkoa

# Voir les logs
docker logs -f arkoa-app

# Arrêter
docker stop arkoa-app arkoa-postgres
docker rm arkoa-app arkoa-postgres
```

### 3. Déploiement avec Docker Compose

Le projet inclut des fichiers Docker Compose pour les environnements staging et production :

#### Staging
```bash
# Utilise le port 4001
docker-compose -f docker-compose.staging.yml up -d

# Voir les logs
docker-compose -f docker-compose.staging.yml logs -f

# Arrêter
docker-compose -f docker-compose.staging.yml down
```

#### Production
```bash
# Utilise le port 4000
docker-compose -f docker-compose.production.yml up -d

# Voir les logs
docker-compose -f docker-compose.production.yml logs -f

# Arrêter
docker-compose -f docker-compose.production.yml down
```

**Note** : Les fichiers Docker Compose utilisent des variables d'environnement. Assurez-vous de les définir dans votre environnement ou dans un fichier `.env`.

## Configuration avancée

### Variables d'environnement requises

| Variable | Description | Exemple |
|----------|-------------|----------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:password@localhost:5432/arkoa` |
| `BETTER_AUTH_SECRET` | Clé secrète pour l'authentification | `your-super-secret-key-here` |
| `BETTER_AUTH_URL` | URL de base pour Better Auth | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application | `http://localhost:3000` |
| `NODE_ENV` | Environnement d'exécution | `development` ou `production` |

```env
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/arkoa"

# Authentification
BETTER_AUTH_SECRET="clé-secrète-minimum-32-caractères"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
```

### Configuration Better Auth

Better Auth est configuré dans `src/lib/auth.ts` :

```typescript
import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

export const auth = betterAuth({
  trustedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://192.168.1.1:3000',
    'https://arkoa.app',
    'https://staging.arkoa.app',
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  database: prismaAdapter(prisma),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 jours
    updateAge: 60 * 60 * 24, // 1 jour
  },
})
```

## Dépannage de l'installation

### Problèmes courants

#### 1. Erreur de connexion à la base de données

```bash
# Vérifier que PostgreSQL fonctionne
psql -h localhost -U arkoa_user -d arkoa

# Sur macOS avec Homebrew
brew services list | grep postgresql
```

#### 2. Erreur "Module not found"

```bash
# Nettoyer et réinstaller
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

#### 3. Erreur Prisma

```bash
# Régénérer le client
npx prisma generate

# Réappliquer les migrations
npx prisma migrate dev
```

#### 4. Port 3000 déjà utilisé

```bash
# Trouver le processus
lsof -i :3000

# Tuer le processus
kill -9 <PID>

# Ou utiliser un autre port
PORT=3001 pnpm dev
```

## Première utilisation

### 1. Créer le premier utilisateur

1. Accéder à l'application : `http://localhost:3000`
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire d'inscription
4. Le premier utilisateur devient automatiquement administrateur

### 2. Créer votre première entreprise

1. Se connecter avec le compte administrateur
2. Aller dans la section "HR" (Ressources Humaines)
3. Cliquer sur "Créer une entreprise"
4. Remplir les informations :
   - Nom de l'entreprise
   - Logo (optionnel)
   - Nombre de jours de congés annuels par défaut

### 3. Inviter des membres

1. Aller dans la section "Team" (Équipe)
2. Cliquer sur "Inviter un membre"
3. Saisir l'email et choisir le rôle :
   - **ADMIN** : Accès complet à la gestion de l'entreprise
   - **MANAGER** : Gestion des congés de son équipe
   - **EMPLOYEE** : Gestion de ses propres congés uniquement

## Maintenance

### Sauvegardes

```bash
# Sauvegarde de la base de données
pg_dump -h localhost -U arkoa_user arkoa > backup_$(date +%Y%m%d).sql

# Restauration
psql -h localhost -U arkoa_user arkoa < backup_20240101.sql
```

### Mises à jour

```bash
# Mettre à jour les dépendances
pnpm update

# Appliquer les nouvelles migrations
npx prisma migrate deploy

# Redémarrer l'application
pnpm build
pnpm start
```

---

**Support** : Pour toute question, consulter la documentation technique ou créer une issue sur GitHub.

**Version** : 0.1.0  
**Dernière mise à jour** : août 2025