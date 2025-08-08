# Guide de sécurité - Arkoa

## Vue d'ensemble

Ce guide détaille les mesures de sécurité implémentées dans Arkoa et les bonnes pratiques à suivre pour maintenir un niveau de sécurité optimal.

## Table des matières

- [Architecture de sécurité](#architecture-de-sécurité)
- [Authentification et autorisation](#authentification-et-autorisation)
- [Protection des données](#protection-des-données)
- [Sécurité des API](#sécurité-des-api)
- [Sécurité frontend](#sécurité-frontend)
- [Sécurité infrastructure](#sécurité-infrastructure)
- [Monitoring et détection](#monitoring-et-détection)
- [Gestion des incidents](#gestion-des-incidents)
- [Conformité et audit](#conformité-et-audit)

## Architecture de sécurité

### Modèle de sécurité en couches

```
┌─────────────────────────────────────────────────────────────┐
│                    Couche Application                       │
│  • Validation des entrées  • Autorisation  • Audit logs   │
├─────────────────────────────────────────────────────────────┤
│                    Couche Transport                        │
│  • HTTPS/TLS 1.3  • HSTS  • Certificate Pinning          │
├─────────────────────────────────────────────────────────────┤
│                    Couche Réseau                           │
│  • Firewall  • WAF  • DDoS Protection  • VPN             │
├─────────────────────────────────────────────────────────────┤
│                    Couche Infrastructure                   │
│  • Chiffrement au repos  • Backup chiffré  • HSM          │
└─────────────────────────────────────────────────────────────┘
```

### Principes de sécurité appliqués

- **Défense en profondeur** : Multiples couches de sécurité
- **Principe du moindre privilège** : Accès minimal nécessaire
- **Séparation des responsabilités** : Isolation des composants
- **Fail-safe** : Échec sécurisé par défaut
- **Zero Trust** : Vérification continue de l'identité

## Authentification et autorisation

### Better Auth - Configuration sécurisée

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { nextCookies } from 'better-auth/next-js'
import { PrismaClient } from '../generated/prisma'

const prisma = new PrismaClient()

export const auth = betterAuth({
  // Origines de confiance pour CORS
  trustedOrigins: [
    'http://localhost:3000',
    'https://arkoa.app',
    'https://www.arkoa.app',
    'https://staging.arkoa.app',
  ],
  
  // Clé secrète pour signer les tokens
  secret: process.env.BETTER_AUTH_SECRET,
  
  // URL de base de l'application
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  
  // Adaptateur de base de données
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  
  // Plugins
  plugins: [nextCookies()],
  
  // Authentification par email/mot de passe
  emailAndPassword: {
    enabled: true,
  },
  
  // Configuration de session
  session: {
    cookieCache: {
      enabled: true,
    },
  },
        "password", "123456", "qwerty", "admin",
        "arkoa", "company", "user"
      ]
    }
  },
  
  // Protection contre les attaques par force brute
  rateLimit: {
    window: 60 * 1000, // 1 minute
    max: 5, // 5 tentatives max
    message: "Trop de tentatives. Réessayez dans 1 minute."
  },
  
  // Configuration CSRF
  csrf: {
    enabled: true,
    secret: process.env.CSRF_SECRET
  },
  
  // Hooks de sécurité
  hooks: {
    after: {
      signIn: async (user, request) => {
        // Log des connexions
        await logSecurityEvent({
          type: 'SIGN_IN',
          userId: user.id,
          ip: getClientIP(request),
          userAgent: request.headers.get('user-agent')
        })
      },
      
      signOut: async (user, request) => {
        // Log des déconnexions
        await logSecurityEvent({
          type: 'SIGN_OUT',
          userId: user.id,
          ip: getClientIP(request)
        })
      }
    },
    
    before: {
      signIn: async (request) => {
        // Vérification de la liste noire IP
        const ip = getClientIP(request)
        if (await isIPBlacklisted(ip)) {
          throw new Error('Accès refusé')
        }
      }
    }
  }
})
```

### Système de rôles et permissions

```typescript
// types/auth.ts
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum Permission {
  // Gestion des utilisateurs
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Gestion des entreprises
  COMPANY_CREATE = 'company:create',
  COMPANY_READ = 'company:read',
  COMPANY_UPDATE = 'company:update',
  COMPANY_DELETE = 'company:delete',
  
  // Gestion des congés
  LEAVE_CREATE = 'leave:create',
  LEAVE_READ = 'leave:read',
  LEAVE_UPDATE = 'leave:update',
  LEAVE_DELETE = 'leave:delete',
  LEAVE_APPROVE = 'leave:approve',
  
  // Administration
  ADMIN_ACCESS = 'admin:access',
  AUDIT_READ = 'audit:read'
}

// Matrice des permissions par rôle
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    Permission.USER_CREATE,
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.COMPANY_CREATE,
    Permission.COMPANY_READ,
    Permission.COMPANY_UPDATE,
    Permission.COMPANY_DELETE,
    Permission.LEAVE_CREATE,
    Permission.LEAVE_READ,
    Permission.LEAVE_UPDATE,
    Permission.LEAVE_DELETE,
    Permission.LEAVE_APPROVE,
    Permission.ADMIN_ACCESS,
    Permission.AUDIT_READ
  ],
  
  [Role.MANAGER]: [
    Permission.USER_READ,
    Permission.COMPANY_READ,
    Permission.LEAVE_CREATE,
    Permission.LEAVE_READ,
    Permission.LEAVE_UPDATE,
    Permission.LEAVE_APPROVE
  ],
  
  [Role.EMPLOYEE]: [
    Permission.LEAVE_CREATE,
    Permission.LEAVE_READ
  ]
}
```

### Middleware d'autorisation

```typescript
// lib/auth/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'
import { Permission, ROLE_PERMISSIONS } from '../types/auth'

export function requireAuth() {
  return async (request: NextRequest) => {
    try {
      const session = await auth.api.getSession({ headers: request.headers })
      
      if (!session) {
        return NextResponse.json(
          { error: 'Non authentifié' },
          { status: 401 }
        )
      }
      
      // Vérifier si le compte est actif
      if (!session.user.isActive) {
        return NextResponse.json(
          { error: 'Compte désactivé' },
          { status: 403 }
        )
      }
      
      // Ajouter l'utilisateur au contexte de la requête
      request.user = session.user
      
      return NextResponse.next()
    } catch (error) {
      return NextResponse.json(
        { error: 'Erreur d\'authentification' },
        { status: 401 }
      )
    }
  }
}

export function requirePermission(permission: Permission) {
  return async (request: NextRequest) => {
    const user = request.user
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || []
    
    if (!userPermissions.includes(permission)) {
      // Log de la tentative d'accès non autorisée
      await logSecurityEvent({
        type: 'UNAUTHORIZED_ACCESS',
        userId: user.id,
        permission,
        ip: getClientIP(request)
      })
      
      return NextResponse.json(
        { error: 'Permission insuffisante' },
        { status: 403 }
      )
    }
    
    return NextResponse.next()
  }
}
```

## Protection des données

### Chiffrement

```typescript
// lib/crypto.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const TAG_LENGTH = 16

// Clé de chiffrement dérivée de la variable d'environnement
const ENCRYPTION_KEY = crypto.scryptSync(
  process.env.ENCRYPTION_SECRET!,
  'salt',
  KEY_LENGTH
)

/**
 * Chiffre une chaîne de caractères
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipher(ALGORITHM, ENCRYPTION_KEY)
  cipher.setAAD(Buffer.from('arkoa-data'))
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const tag = cipher.getAuthTag()
  
  // Combiner IV + tag + données chiffrées
  return iv.toString('hex') + tag.toString('hex') + encrypted
}

/**
 * Déchiffre une chaîne de caractères
 */
export function decrypt(encryptedData: string): string {
  const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex')
  const tag = Buffer.from(encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + TAG_LENGTH) * 2), 'hex')
  const encrypted = encryptedData.slice((IV_LENGTH + TAG_LENGTH) * 2)
  
  const decipher = crypto.createDecipher(ALGORITHM, ENCRYPTION_KEY)
  decipher.setAAD(Buffer.from('arkoa-data'))
  decipher.setAuthTag(tag)
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

/**
 * Hache un mot de passe avec salt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [salt, hash] = hashedPassword.split(':')
  const hashToVerify = crypto.scryptSync(password, salt, 64).toString('hex')
  return hash === hashToVerify
}
```

### Protection des données sensibles

```typescript
// lib/data-protection.ts
import { encrypt, decrypt } from './crypto'

/**
 * Champs sensibles à chiffrer en base
 */
const SENSITIVE_FIELDS = [
  'socialSecurityNumber',
  'bankAccount',
  'personalNotes',
  'medicalInfo'
]

/**
 * Middleware Prisma pour chiffrer automatiquement
 */
export const encryptionMiddleware = {
  async $allOperations({ operation, model, args, query }) {
    // Chiffrement avant écriture
    if (['create', 'update', 'upsert'].includes(operation)) {
      if (args.data) {
        for (const field of SENSITIVE_FIELDS) {
          if (args.data[field]) {
            args.data[field] = encrypt(args.data[field])
          }
        }
      }
    }
    
    const result = await query(args)
    
    // Déchiffrement après lecture
    if (['findFirst', 'findMany', 'findUnique'].includes(operation)) {
      if (Array.isArray(result)) {
        result.forEach(item => decryptSensitiveFields(item))
      } else if (result) {
        decryptSensitiveFields(result)
      }
    }
    
    return result
  }
}

function decryptSensitiveFields(item: any) {
  for (const field of SENSITIVE_FIELDS) {
    if (item[field]) {
      try {
        item[field] = decrypt(item[field])
      } catch (error) {
        // Log l'erreur mais ne pas faire échouer la requête
        console.error(`Erreur de déchiffrement pour ${field}:`, error)
        item[field] = '[DONNÉES CHIFFRÉES]'
      }
    }
  }
}
```

### Anonymisation et pseudonymisation

```typescript
// lib/anonymization.ts
import crypto from 'crypto'

/**
 * Anonymise les données utilisateur pour les exports/analytics
 */
export function anonymizeUser(user: any) {
  const hash = crypto.createHash('sha256')
  hash.update(user.id + process.env.ANONYMIZATION_SALT!)
  const anonymousId = hash.digest('hex').substring(0, 16)
  
  return {
    id: anonymousId,
    role: user.role,
    department: user.department,
    joinDate: user.createdAt,
    // Supprimer toutes les données personnelles
    name: undefined,
    email: undefined,
    phone: undefined
  }
}

/**
 * Pseudonymise les données pour les tests
 */
export function pseudonymizeUser(user: any) {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
  const domains = ['example.com', 'test.org', 'demo.net']
  
  const nameIndex = parseInt(user.id.slice(-1), 16) % names.length
  const domainIndex = parseInt(user.id.slice(-2, -1), 16) % domains.length
  
  return {
    ...user,
    name: names[nameIndex],
    email: `${names[nameIndex].toLowerCase()}@${domains[domainIndex]}`,
    phone: '+33 1 XX XX XX XX'
  }
}
```

## Sécurité des API

### Validation des entrées avec Zod

```typescript
// schemas/security-enhanced-schemas.ts
import { z } from 'zod'

// Schéma de base avec validation de sécurité
const secureStringSchema = z.string()
  .min(1, 'Champ requis')
  .max(1000, 'Trop long')
  .refine(
    (val) => !/<script|javascript:|data:|vbscript:/i.test(val),
    'Contenu potentiellement dangereux détecté'
  )
  .refine(
    (val) => !/\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION)\b/i.test(val),
    'Injection SQL potentielle détectée'
  )

// Schéma pour les emails avec validation renforcée
const secureEmailSchema = z.string()
  .email('Format email invalide')
  .max(254, 'Email trop long')
  .refine(
    (email) => {
      // Vérifier les domaines suspects
      const suspiciousDomains = ['tempmail.org', '10minutemail.com']
      const domain = email.split('@')[1]
      return !suspiciousDomains.includes(domain)
    },
    'Domaine email non autorisé'
  )

// Schéma pour les mots de passe
const passwordSchema = z.string()
  .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
  .max(128, 'Le mot de passe est trop long')
  .refine(
    (password) => /[A-Z]/.test(password),
    'Le mot de passe doit contenir au moins une majuscule'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Le mot de passe doit contenir au moins une minuscule'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Le mot de passe doit contenir au moins un chiffre'
  )
  .refine(
    (password) => /[^A-Za-z0-9]/.test(password),
    'Le mot de passe doit contenir au moins un caractère spécial'
  )
  .refine(
    (password) => {
      const commonPasswords = ['password123', 'admin123', 'qwerty123']
      return !commonPasswords.includes(password.toLowerCase())
    },
    'Mot de passe trop commun'
  )

export const CreateUserSchema = z.object({
  name: secureStringSchema,
  email: secureEmailSchema,
  password: passwordSchema,
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'])
})
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { LRUCache } from 'lru-cache'

type RateLimitConfig = {
  interval: number // en millisecondes
  uniqueTokenPerInterval: number
  maxRequests: number
}

const rateLimiters = new Map<string, LRUCache<string, number>>()

export function rateLimit(config: RateLimitConfig) {
  return async (request: Request) => {
    const identifier = getClientIdentifier(request)
    const key = `${request.url}:${identifier}`
    
    if (!rateLimiters.has(key)) {
      rateLimiters.set(key, new LRUCache({
        max: config.uniqueTokenPerInterval,
        ttl: config.interval
      }))
    }
    
    const cache = rateLimiters.get(key)!
    const currentCount = cache.get(identifier) || 0
    
    if (currentCount >= config.maxRequests) {
      // Log de la tentative de dépassement
      await logSecurityEvent({
        type: 'RATE_LIMIT_EXCEEDED',
        identifier,
        url: request.url,
        count: currentCount
      })
      
      return new Response(
        JSON.stringify({ error: 'Trop de requêtes' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(config.interval / 1000).toString()
          }
        }
      )
    }
    
    cache.set(identifier, currentCount + 1)
    return null // Continuer le traitement
  }
}

// Configuration par endpoint
export const rateLimitConfigs = {
  auth: {
    interval: 15 * 60 * 1000, // 15 minutes
    uniqueTokenPerInterval: 500,
    maxRequests: 5
  },
  api: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 1000,
    maxRequests: 100
  },
  upload: {
    interval: 60 * 1000, // 1 minute
    uniqueTokenPerInterval: 100,
    maxRequests: 10
  }
}

function getClientIdentifier(request: Request): string {
  // Utiliser l'IP + User-Agent comme identifiant
  const ip = request.headers.get('x-forwarded-for') || 
            request.headers.get('x-real-ip') || 
            'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.substring(0, 100)}`
}
```

### Protection CSRF

```typescript
// lib/csrf.ts
import crypto from 'crypto'

const CSRF_TOKEN_LENGTH = 32
const CSRF_COOKIE_NAME = 'arkoa-csrf-token'

/**
 * Génère un token CSRF
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex')
}

/**
 * Vérifie un token CSRF
 */
export function verifyCSRFToken(token: string, cookieToken: string): boolean {
  if (!token || !cookieToken) {
    return false
  }
  
  // Comparaison sécurisée pour éviter les attaques de timing
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(cookieToken, 'hex')
  )
}

/**
 * Middleware CSRF pour les routes API
 */
export function csrfProtection() {
  return async (request: Request) => {
    // Ignorer les requêtes GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return null
    }
    
    const cookieHeader = request.headers.get('cookie')
    const csrfCookie = parseCookie(cookieHeader, CSRF_COOKIE_NAME)
    const csrfHeader = request.headers.get('x-csrf-token')
    
    if (!verifyCSRFToken(csrfHeader || '', csrfCookie || '')) {
      await logSecurityEvent({
        type: 'CSRF_TOKEN_INVALID',
        ip: getClientIP(request),
        userAgent: request.headers.get('user-agent')
      })
      
      return new Response(
        JSON.stringify({ error: 'Token CSRF invalide' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    return null
  }
}

function parseCookie(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null
  
  const cookies = cookieHeader.split(';')
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split('=')
    if (key === name) {
      return value
    }
  }
  
  return null
}
```

## Sécurité frontend

### Content Security Policy (CSP)

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://api.arkoa.app",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests"
    ].join('; ')
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
]

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ]
  }
}
```

### Sanitisation des données

```typescript
// lib/sanitization.ts
import DOMPurify from 'isomorphic-dompurify'

/**
 * Nettoie le HTML pour éviter les attaques XSS
 */
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}

/**
 * Échappe les caractères spéciaux pour l'affichage
 */
export function escapeHTML(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Valide et nettoie les URLs
 */
export function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url)
    
    // Autoriser seulement HTTP et HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null
    }
    
    // Bloquer les domaines suspects
    const blockedDomains = ['malicious.com', 'phishing.net']
    if (blockedDomains.includes(parsed.hostname)) {
      return null
    }
    
    return parsed.toString()
  } catch {
    return null
  }
}
```

### Protection contre les attaques côté client

```typescript
// hooks/useSecurity.ts
import { useEffect } from 'react'

export function useSecurity() {
  useEffect(() => {
    // Désactiver le clic droit en production
    if (process.env.NODE_ENV === 'production') {
      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault()
      }
      
      document.addEventListener('contextmenu', handleContextMenu)
      
      return () => {
        document.removeEventListener('contextmenu', handleContextMenu)
      }
    }
  }, [])
  
  useEffect(() => {
    // Détecter les outils de développement
    const detectDevTools = () => {
      const threshold = 160
      
      if (window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold) {
        // Outils de développement probablement ouverts
        console.clear()
        console.warn('⚠️ Outils de développement détectés')
      }
    }
    
    const interval = setInterval(detectDevTools, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  useEffect(() => {
    // Protection contre le copier-coller de scripts
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData('text') || ''
      
      if (/<script|javascript:|data:|vbscript:/i.test(pastedText)) {
        e.preventDefault()
        alert('Contenu potentiellement dangereux détecté dans le presse-papiers')
      }
    }
    
    document.addEventListener('paste', handlePaste)
    
    return () => {
      document.removeEventListener('paste', handlePaste)
    }
  }, [])
}
```

## Sécurité infrastructure

### Configuration Docker sécurisée

```dockerfile
# Dockerfile sécurisé
FROM node:20-alpine AS base

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs

# Installer les dépendances de sécurité
RUN apk add --no-cache \
    dumb-init \
    tini

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY --chown=nextjs:nodejs package*.json ./

# Installer les dépendances
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le code source
COPY --chown=nextjs:nodejs . .

# Supprimer les fichiers sensibles
RUN rm -rf .git .env.* *.md

# Changer vers l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Utiliser tini comme init
ENTRYPOINT ["tini", "--"]

# Commande de démarrage
CMD ["node", "server.js"]

# Labels de sécurité
LABEL security.scan="enabled" \
      security.updates="auto" \
      maintainer="security@arkoa.app"
```

### Configuration Nginx sécurisée

```nginx
# nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Sécurité
    server_tokens off;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Limites de sécurité
    client_max_body_size 10M;
    client_body_timeout 12;
    client_header_timeout 12;
    keepalive_timeout 15;
    send_timeout 10;
    
    # Logging sécurisé
    log_format security '$remote_addr - $remote_user [$time_local] '
                       '"$request" $status $bytes_sent '
                       '"$http_referer" "$http_user_agent" '
                       '$request_time $upstream_response_time';
    
    access_log /var/log/nginx/access.log security;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=1r/s;
    
    upstream app {
        server web:3000;
        keepalive 32;
    }
    
    server {
        listen 80;
        server_name arkoa.app www.arkoa.app;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name arkoa.com www.arkoa.com;
        
        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/arkoa.crt;
        ssl_certificate_key /etc/nginx/ssl/arkoa.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # OCSP Stapling
        ssl_stapling on;
        ssl_stapling_verify on;
        
        # API Routes avec rate limiting
        location /api/auth {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Application
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Cache statique
            location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
                expires 1y;
                add_header Cache-Control "public, immutable";
            }
        }
        
        # Bloquer les fichiers sensibles
        location ~ /\. {
            deny all;
        }
        
        location ~ \.(env|log|sql)$ {
            deny all;
        }
    }
}
```

## Monitoring et détection

### Système de logs de sécurité

```typescript
// lib/security-logger.ts
import winston from 'winston'
import { prisma } from './prisma'

type SecurityEventType = 
  | 'SIGN_IN'
  | 'SIGN_OUT'
  | 'FAILED_LOGIN'
  | 'UNAUTHORIZED_ACCESS'
  | 'RATE_LIMIT_EXCEEDED'
  | 'CSRF_TOKEN_INVALID'
  | 'SUSPICIOUS_ACTIVITY'
  | 'DATA_BREACH_ATTEMPT'
  | 'PRIVILEGE_ESCALATION'

interface SecurityEvent {
  type: SecurityEventType
  userId?: string
  ip?: string
  userAgent?: string
  details?: Record<string, any>
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security.log',
      level: 'info'
    }),
    new winston.transports.File({ 
      filename: 'logs/security-errors.log',
      level: 'error'
    })
  ]
})

export async function logSecurityEvent(event: SecurityEvent) {
  const severity = event.severity || getSeverityForEventType(event.type)
  
  // Log dans Winston
  securityLogger.log(severity.toLowerCase(), {
    ...event,
    severity,
    timestamp: new Date().toISOString()
  })
  
  // Sauvegarder en base pour analyse
  try {
    await prisma.securityEvent.create({
      data: {
        type: event.type,
        userId: event.userId,
        ip: event.ip,
        userAgent: event.userAgent,
        details: event.details || {},
        severity
      }
    })
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'événement de sécurité:', error)
  }
  
  // Alertes en temps réel pour les événements critiques
  if (severity === 'CRITICAL') {
    await sendSecurityAlert(event)
  }
  
  // Détection d'anomalies
  await detectAnomalies(event)
}

function getSeverityForEventType(type: SecurityEventType): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  const severityMap: Record<SecurityEventType, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'> = {
    'SIGN_IN': 'LOW',
    'SIGN_OUT': 'LOW',
    'FAILED_LOGIN': 'MEDIUM',
    'UNAUTHORIZED_ACCESS': 'HIGH',
    'RATE_LIMIT_EXCEEDED': 'MEDIUM',
    'CSRF_TOKEN_INVALID': 'HIGH',
    'SUSPICIOUS_ACTIVITY': 'HIGH',
    'DATA_BREACH_ATTEMPT': 'CRITICAL',
    'PRIVILEGE_ESCALATION': 'CRITICAL'
  }
  
  return severityMap[type] || 'MEDIUM'
}

async function sendSecurityAlert(event: SecurityEvent) {
  // Envoyer une alerte par email/Slack/SMS
  const alertMessage = `
    🚨 ALERTE SÉCURITÉ CRITIQUE
    
    Type: ${event.type}
    Utilisateur: ${event.userId || 'Anonyme'}
    IP: ${event.ip || 'Inconnue'}
    Heure: ${new Date().toISOString()}
    
    Détails: ${JSON.stringify(event.details, null, 2)}
  `
  
  // Implémenter l'envoi d'alerte selon votre système
  console.error(alertMessage)
}

async function detectAnomalies(event: SecurityEvent) {
  if (!event.ip || !event.userId) return
  
  // Détecter les connexions depuis plusieurs pays
  const recentEvents = await prisma.securityEvent.findMany({
    where: {
      userId: event.userId,
      type: 'SIGN_IN',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24h
      }
    },
    select: { ip: true }
  })
  
  const uniqueIPs = new Set(recentEvents.map(e => e.ip))
  
  if (uniqueIPs.size > 3) {
    await logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      userId: event.userId,
      ip: event.ip,
      details: {
        reason: 'Multiple IPs in 24h',
        ipCount: uniqueIPs.size,
        ips: Array.from(uniqueIPs)
      },
      severity: 'HIGH'
    })
  }
}
```

### Détection d'intrusion

```typescript
// lib/intrusion-detection.ts
import { logSecurityEvent } from './security-logger'

interface IntrusionPattern {
  name: string
  description: string
  check: (events: SecurityEvent[]) => boolean
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

const intrusionPatterns: IntrusionPattern[] = [
  {
    name: 'Brute Force Attack',
    description: 'Multiple failed login attempts',
    check: (events) => {
      const failedLogins = events.filter(e => e.type === 'FAILED_LOGIN')
      return failedLogins.length > 5
    },
    severity: 'HIGH'
  },
  
  {
    name: 'Privilege Escalation',
    description: 'Unauthorized access to admin functions',
    check: (events) => {
      return events.some(e => 
        e.type === 'UNAUTHORIZED_ACCESS' && 
        e.details?.permission?.includes('admin')
      )
    },
    severity: 'CRITICAL'
  },
  
  {
    name: 'SQL Injection Attempt',
    description: 'Suspicious SQL patterns in requests',
    check: (events) => {
      return events.some(e => 
        e.details?.request && 
        /\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP)\b/i.test(e.details.request)
      )
    },
    severity: 'HIGH'
  },
  
  {
    name: 'Unusual Activity Pattern',
    description: 'Activity outside normal hours',
    check: (events) => {
      const now = new Date()
      const hour = now.getHours()
      
      // Activité entre 22h et 6h
      if (hour >= 22 || hour <= 6) {
        return events.length > 10
      }
      
      return false
    },
    severity: 'MEDIUM'
  }
]

export async function runIntrusionDetection() {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  // Récupérer les événements des dernières 24h
  const recentEvents = await prisma.securityEvent.findMany({
    where: {
      createdAt: {
        gte: last24Hours
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  // Grouper par IP pour détecter les patterns
  const eventsByIP = groupBy(recentEvents, 'ip')
  
  for (const [ip, events] of Object.entries(eventsByIP)) {
    for (const pattern of intrusionPatterns) {
      if (pattern.check(events)) {
        await logSecurityEvent({
          type: 'SUSPICIOUS_ACTIVITY',
          ip,
          details: {
            pattern: pattern.name,
            description: pattern.description,
            eventCount: events.length,
            timeWindow: '24h'
          },
          severity: pattern.severity
        })
        
        // Bloquer l'IP si pattern critique
        if (pattern.severity === 'CRITICAL') {
          await blockIP(ip, pattern.name)
        }
      }
    }
  }
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

async function blockIP(ip: string, reason: string) {
  // Ajouter l'IP à la liste noire
  await prisma.blockedIP.create({
    data: {
      ip,
      reason,
      blockedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    }
  })
  
  await logSecurityEvent({
    type: 'SUSPICIOUS_ACTIVITY',
    ip,
    details: {
      action: 'IP_BLOCKED',
      reason,
      duration: '24h'
    },
    severity: 'CRITICAL'
  })
}

// Vérifier si une IP est bloquée
export async function isIPBlacklisted(ip: string): Promise<boolean> {
  const blocked = await prisma.blockedIP.findFirst({
    where: {
      ip,
      expiresAt: {
        gt: new Date()
      }
    }
  })
  
  return !!blocked
}
```

## Gestion des incidents

### Plan de réponse aux incidents

```typescript
// lib/incident-response.ts
import { logSecurityEvent } from './security-logger'

type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
type IncidentStatus = 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED'

interface SecurityIncident {
  id: string
  type: string
  severity: IncidentSeverity
  status: IncidentStatus
  description: string
  affectedUsers?: string[]
  affectedSystems?: string[]
  detectedAt: Date
  containedAt?: Date
  resolvedAt?: Date
  actions: IncidentAction[]
}

interface IncidentAction {
  timestamp: Date
  action: string
  performedBy: string
  details: string
}

class IncidentResponseManager {
  async createIncident(incident: Omit<SecurityIncident, 'id' | 'detectedAt' | 'actions'>): Promise<SecurityIncident> {
    const newIncident: SecurityIncident = {
      ...incident,
      id: generateIncidentId(),
      detectedAt: new Date(),
      actions: []
    }
    
    // Sauvegarder l'incident
    await this.saveIncident(newIncident)
    
    // Déclencher la réponse automatique
    await this.triggerAutomaticResponse(newIncident)
    
    // Notifier l'équipe de sécurité
    await this.notifySecurityTeam(newIncident)
    
    return newIncident
  }
  
  async triggerAutomaticResponse(incident: SecurityIncident) {
    const actions: IncidentAction[] = []
    
    switch (incident.severity) {
      case 'CRITICAL':
        // Isoler les systèmes affectés
        if (incident.affectedSystems) {
          for (const system of incident.affectedSystems) {
            await this.isolateSystem(system)
            actions.push({
              timestamp: new Date(),
              action: 'SYSTEM_ISOLATED',
              performedBy: 'AUTOMATED',
              details: `Système ${system} isolé automatiquement`
            })
          }
        }
        
        // Révoquer les sessions des utilisateurs affectés
        if (incident.affectedUsers) {
          for (const userId of incident.affectedUsers) {
            await this.revokeUserSessions(userId)
            actions.push({
              timestamp: new Date(),
              action: 'SESSIONS_REVOKED',
              performedBy: 'AUTOMATED',
              details: `Sessions révoquées pour l'utilisateur ${userId}`
            })
          }
        }
        break
        
      case 'HIGH':
        // Augmenter le niveau de monitoring
        await this.increaseMonitoring()
        actions.push({
          timestamp: new Date(),
          action: 'MONITORING_INCREASED',
          performedBy: 'AUTOMATED',
          details: 'Niveau de monitoring augmenté'
        })
        break
    }
    
    // Enregistrer les actions
    incident.actions.push(...actions)
    await this.saveIncident(incident)
  }
  
  async containIncident(incidentId: string, containmentActions: string[]): Promise<void> {
    const incident = await this.getIncident(incidentId)
    if (!incident) throw new Error('Incident non trouvé')
    
    incident.status = 'CONTAINED'
    incident.containedAt = new Date()
    
    for (const action of containmentActions) {
      incident.actions.push({
        timestamp: new Date(),
        action: 'CONTAINMENT_ACTION',
        performedBy: 'SECURITY_TEAM',
        details: action
      })
    }
    
    await this.saveIncident(incident)
    await this.notifyStakeholders(incident, 'CONTAINED')
  }
  
  async resolveIncident(incidentId: string, resolution: string): Promise<void> {
    const incident = await this.getIncident(incidentId)
    if (!incident) throw new Error('Incident non trouvé')
    
    incident.status = 'RESOLVED'
    incident.resolvedAt = new Date()
    
    incident.actions.push({
      timestamp: new Date(),
      action: 'INCIDENT_RESOLVED',
      performedBy: 'SECURITY_TEAM',
      details: resolution
    })
    
    await this.saveIncident(incident)
    await this.generateIncidentReport(incident)
    await this.notifyStakeholders(incident, 'RESOLVED')
  }
  
  private async isolateSystem(system: string) {
    // Implémenter l'isolation du système
    console.log(`Isolating system: ${system}`)
  }
  
  private async revokeUserSessions(userId: string) {
    // Révoquer toutes les sessions de l'utilisateur
    await prisma.session.deleteMany({
      where: { userId }
    })
  }
  
  private async increaseMonitoring() {
    // Augmenter la fréquence de monitoring
    console.log('Increasing monitoring level')
  }
  
  private async saveIncident(incident: SecurityIncident) {
    await prisma.securityIncident.upsert({
      where: { id: incident.id },
      update: {
        status: incident.status,
        containedAt: incident.containedAt,
        resolvedAt: incident.resolvedAt,
        actions: incident.actions
      },
      create: {
        id: incident.id,
        type: incident.type,
        severity: incident.severity,
        status: incident.status,
        description: incident.description,
        affectedUsers: incident.affectedUsers || [],
        affectedSystems: incident.affectedSystems || [],
        detectedAt: incident.detectedAt,
        actions: incident.actions
      }
    })
  }
  
  private async getIncident(id: string): Promise<SecurityIncident | null> {
    const incident = await prisma.securityIncident.findUnique({
      where: { id }
    })
    
    return incident as SecurityIncident | null
  }
  
  private async notifySecurityTeam(incident: SecurityIncident) {
    // Implémenter la notification de l'équipe de sécurité
    console.log(`Notifying security team about incident: ${incident.id}`)
  }
  
  private async notifyStakeholders(incident: SecurityIncident, status: string) {
    // Implémenter la notification des parties prenantes
    console.log(`Notifying stakeholders: incident ${incident.id} is ${status}`)
  }
  
  private async generateIncidentReport(incident: SecurityIncident) {
    // Générer un rapport d'incident
    const report = {
      incidentId: incident.id,
      type: incident.type,
      severity: incident.severity,
      timeline: {
        detected: incident.detectedAt,
        contained: incident.containedAt,
        resolved: incident.resolvedAt
      },
      actions: incident.actions,
      lessonsLearned: [],
      recommendations: []
    }
    
    console.log('Incident report generated:', report)
  }
}

function generateIncidentId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `INC-${timestamp}-${random}`.toUpperCase()
}

export const incidentManager = new IncidentResponseManager()
```

## Conformité et audit

### Audit trail

```typescript
// lib/audit.ts
import { prisma } from './prisma'

type AuditAction = 
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PERMISSION_CHANGE'
  | 'DATA_EXPORT'
  | 'SYSTEM_CONFIG'

interface AuditEntry {
  userId: string
  action: AuditAction
  resource: string
  resourceId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ip?: string
  userAgent?: string
  timestamp: Date
}

export async function createAuditEntry(entry: Omit<AuditEntry, 'timestamp'>) {
  await prisma.auditLog.create({
    data: {
      ...entry,
      timestamp: new Date(),
      oldValues: entry.oldValues || {},
      newValues: entry.newValues || {}
    }
  })
}

// Middleware d'audit pour Prisma
export const auditMiddleware = {
  async $allOperations({ operation, model, args, query }) {
    const result = await query(args)
    
    // Auditer les opérations sensibles
    if (['create', 'update', 'delete'].includes(operation)) {
      const userId = getCurrentUserId() // À implémenter selon votre contexte
      
      if (userId) {
        await createAuditEntry({
          userId,
          action: operation.toUpperCase() as AuditAction,
          resource: model,
          resourceId: result?.id || args.where?.id,
          oldValues: operation === 'update' ? await getPreviousValues(model, args.where) : undefined,
          newValues: operation !== 'delete' ? args.data : undefined
        })
      }
    }
    
    return result
  }
}

async function getPreviousValues(model: string, where: any) {
  // Récupérer les valeurs précédentes pour l'audit
  try {
    return await (prisma as any)[model].findUnique({ where })
  } catch {
    return null
  }
}

function getCurrentUserId(): string | null {
  // Implémenter selon votre système d'authentification
  return null
}

// Génération de rapports d'audit
export async function generateAuditReport(startDate: Date, endDate: Date) {
  const auditEntries = await prisma.auditLog.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          role: true
        }
      }
    },
    orderBy: {
      timestamp: 'desc'
    }
  })
  
  // Analyser les données d'audit
  const summary = {
    totalActions: auditEntries.length,
    actionsByType: groupBy(auditEntries, 'action'),
    userActivity: groupBy(auditEntries, 'userId'),
    resourceAccess: groupBy(auditEntries, 'resource'),
    suspiciousActivity: auditEntries.filter(entry => 
      isSuspiciousActivity(entry)
    )
  }
  
  return {
    period: { startDate, endDate },
    summary,
    entries: auditEntries
  }
}

function isSuspiciousActivity(entry: any): boolean {
  // Détecter les activités suspectes
  const suspiciousPatterns = [
    // Accès en dehors des heures de travail
    () => {
      const hour = entry.timestamp.getHours()
      return hour < 6 || hour > 22
    },
    
    // Modifications massives
    () => {
      return entry.action === 'DELETE' && entry.resource === 'User'
    },
    
    // Changements de permissions
    () => {
      return entry.action === 'PERMISSION_CHANGE'
    }
  ]
  
  return suspiciousPatterns.some(pattern => pattern())
}
```

### Conformité RGPD

```typescript
// lib/gdpr-compliance.ts
import { prisma } from './prisma'
import { encrypt, decrypt } from './crypto'

export class GDPRComplianceManager {
  /**
   * Droit d'accès - Article 15 RGPD
   */
  async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        leaves: true,
        memberships: true,
        auditLogs: true
      }
    })
    
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Créer un export complet des données
    const exportData = {
      personalData: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      activityData: {
        leaves: user.leaves.map(leave => ({
          type: leave.type,
          startDate: leave.startDate,
          endDate: leave.endDate,
          status: leave.status,
          createdAt: leave.createdAt
        })),
        memberships: user.memberships.map(membership => ({
          companyId: membership.companyId,
          role: membership.role,
          joinedAt: membership.createdAt
        }))
      },
      auditTrail: user.auditLogs.map(log => ({
        action: log.action,
        resource: log.resource,
        timestamp: log.timestamp
      }))
    }
    
    // Log de l'export
    await createAuditEntry({
      userId,
      action: 'DATA_EXPORT',
      resource: 'User',
      resourceId: userId
    })
    
    return exportData
  }
  
  /**
   * Droit à l'effacement - Article 17 RGPD
   */
  async deleteUserData(userId: string, reason: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    
    // Vérifier si l'effacement est possible
    const canDelete = await this.canDeleteUserData(userId)
    if (!canDelete.allowed) {
      throw new Error(`Suppression impossible: ${canDelete.reason}`)
    }
    
    // Anonymiser plutôt que supprimer pour préserver l'intégrité
    await this.anonymizeUserData(userId)
    
    // Log de la suppression
    await createAuditEntry({
      userId,
      action: 'DELETE',
      resource: 'User',
      resourceId: userId,
      newValues: { reason, anonymized: true }
    })
  }
  
  /**
   * Droit de rectification - Article 16 RGPD
   */
  async updateUserData(userId: string, updates: any, requestedBy: string) {
    const oldData = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates
    })
    
    // Log de la rectification
    await createAuditEntry({
      userId: requestedBy,
      action: 'UPDATE',
      resource: 'User',
      resourceId: userId,
      oldValues: oldData,
      newValues: updates
    })
    
    return updatedUser
  }
  
  private async canDeleteUserData(userId: string) {
    // Vérifier les obligations légales de conservation
    const activeLeaves = await prisma.leave.count({
      where: {
        userId,
        status: 'PENDING'
      }
    })
    
    if (activeLeaves > 0) {
      return {
        allowed: false,
        reason: 'Demandes de congés en cours'
      }
    }
    
    // Vérifier la période de conservation légale (ex: 5 ans)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    const retentionPeriod = 5 * 365 * 24 * 60 * 60 * 1000 // 5 ans
    const canDeleteAfter = new Date(user!.createdAt.getTime() + retentionPeriod)
    
    if (new Date() < canDeleteAfter) {
      return {
        allowed: false,
        reason: `Période de conservation légale (jusqu'au ${canDeleteAfter.toLocaleDateString()})`
      }
    }
    
    return { allowed: true }
  }
  
  private async anonymizeUserData(userId: string) {
    // Anonymiser les données personnelles
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: `Utilisateur anonymisé ${userId.slice(-8)}`,
        email: `anonymized-${userId.slice(-8)}@deleted.local`,
        isActive: false,
        deletedAt: new Date()
      }
    })
    
    // Anonymiser les données liées
    await prisma.leave.updateMany({
      where: { userId },
      data: {
        notes: 'Données anonymisées'
      }
    })
  }
}

export const gdprManager = new GDPRComplianceManager()
```

## Checklist de sécurité

### Déploiement sécurisé

- [ ] **Authentification**
  - [ ] Mots de passe forts obligatoires (12+ caractères)
  - [ ] Authentification à deux facteurs activée
  - [ ] Sessions sécurisées avec expiration
  - [ ] Protection contre les attaques par force brute

- [ ] **Autorisation**
  - [ ] Principe du moindre privilège appliqué
  - [ ] Contrôles d'accès basés sur les rôles (RBAC)
  - [ ] Validation des permissions sur chaque endpoint
  - [ ] Audit des changements de permissions

- [ ] **Protection des données**
  - [ ] Chiffrement en transit (HTTPS/TLS 1.3)
  - [ ] Chiffrement au repos pour les données sensibles
  - [ ] Hachage sécurisé des mots de passe
  - [ ] Sauvegarde chiffrée

- [ ] **Sécurité des API**
  - [ ] Validation stricte des entrées (Zod)
  - [ ] Rate limiting configuré
  - [ ] Protection CSRF activée
  - [ ] En-têtes de sécurité configurés

- [ ] **Infrastructure**
  - [ ] Firewall configuré
  - [ ] Accès SSH sécurisé (clés uniquement)
  - [ ] Mises à jour de sécurité automatiques
  - [ ] Monitoring des intrusions

- [ ] **Monitoring**
  - [ ] Logs de sécurité centralisés
  - [ ] Alertes en temps réel
  - [ ] Détection d'anomalies
  - [ ] Audit trail complet

- [ ] **Conformité**
  - [ ] Conformité RGPD
  - [ ] Politique de rétention des données
  - [ ] Procédures de réponse aux incidents
  - [ ] Formation sécurité de l'équipe

### Tests de sécurité

```bash
# Tests de sécurité automatisés

# 1. Analyse statique du code
npm audit
npm run lint:security

# 2. Tests de pénétration automatisés
npx zap-baseline.py -t http://localhost:3000

# 3. Scan des dépendances
npx retire --js --node

# 4. Tests d'injection SQL
sqlmap -u "http://localhost:3000/api/users" --batch

# 5. Tests XSS
xsser -u "http://localhost:3000" --auto

# 6. Scan des ports
nmap -sS -O localhost

# 7. Tests SSL/TLS
testssl.sh https://arkoa.app
```

## Ressources et références

### Standards de sécurité

- **OWASP Top 10** : [https://owasp.org/www-project-top-ten/](https://owasp.org/www-project-top-ten/)
- **NIST Cybersecurity Framework** : [https://www.nist.gov/cyberframework](https://www.nist.gov/cyberframework)
- **ISO 27001** : Standard international pour la gestion de la sécurité de l'information
- **ANSSI** : Recommandations de l'Agence nationale de la sécurité des systèmes d'information

### Outils de sécurité

- **Analyse statique** : ESLint Security, Semgrep, SonarQube
- **Tests de pénétration** : OWASP ZAP, Burp Suite, Nessus
- **Monitoring** : Sentry, LogRocket, Datadog
- **Chiffrement** : Let's Encrypt, HashiCorp Vault

### Formation et sensibilisation

- **OWASP WebGoat** : Plateforme d'apprentissage de la sécurité web
- **Cybersecurity & Infrastructure Security Agency (CISA)** : Ressources de formation
- **SANS Institute** : Formations spécialisées en cybersécurité

---

**Ce guide de sécurité doit être régulièrement mis à jour pour refléter les nouvelles menaces et les meilleures pratiques.**

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Prochaine révision** : Juillet 2025