# Guide d'Installation - Arkoa

## Prérequis système

### Logiciels requis

- **Node.js** : Version 20.0 ou supérieure
- **pnpm** : Gestionnaire de paquets (recommandé)
- **Git** : Pour cloner le projet
- **Docker** : Pour l'environnement de développement (optionnel)
- **PostgreSQL** : Base de données (version 14 ou supérieure)

### Vérification des prérequis

```bash
# Vérifier Node.js
node --version
# Doit afficher v20.0.0 ou supérieur

# Vérifier pnpm
pnpm --version
# Si pnpm n'est pas installé :
npm install -g pnpm

# Vérifier Git
git --version

# Vérifier Docker (optionnel)
docker --version

# Vérifier PostgreSQL
psql --version
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

```bash
# Base de données
DATABASE_URL="postgresql://arkoa_user:arkoa_password@localhost:5432/arkoa"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
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
# Exécuter les tests unitaires
pnpm test

# Exécuter les tests d'intégration
pnpm test:integration

# Exécuter les tests e2e
pnpm test:e2e

# Exécuter tous les tests
pnpm test:all

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

## Configuration avancée

### Variables d'environnement requises

```bash
# Base de données
DATABASE_URL="postgresql://user:password@localhost:5432/arkoa"

# Authentification
BETTER_AUTH_SECRET="clé-secrète-minimum-32-caractères"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Environnement
NODE_ENV="development"
```

### Configuration Better Auth

Le fichier `src/lib/auth.ts` contient la configuration de base :

```typescript
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true
  },
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL!
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
2. Aller dans "Paramètres" > "Entreprise"
3. Cliquer sur "Créer une entreprise"
4. Remplir les informations :
   - Nom de l'entreprise
   - Logo (optionnel)
   - Nombre de jours de congés annuels

### 3. Inviter des membres

1. Aller dans "Équipe" > "Membres"
2. Cliquer sur "Inviter un membre"
3. Saisir l'email et choisir le rôle :
   - **ADMIN** : Accès complet
   - **MANAGER** : Gestion des congés de son équipe
   - **EMPLOYEE** : Gestion de ses propres congés

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

**Version** : 1.0.0  
**Dernière mise à jour** : Août 2025