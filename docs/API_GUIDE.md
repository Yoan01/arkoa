# Guide API - Arkoa

## Vue d'ensemble

L'API Arkoa est une API REST construite avec Next.js App Router qui gère la gestion des congés d'entreprise. Elle utilise Better Auth pour l'authentification et Prisma comme ORM.

## Table des matières

1. [Authentification](#authentification)
2. [Endpoints API](#endpoints-api)
3. [Modèles de données](#modèles-de-données)
4. [Codes d'erreur](#codes-derreur)
5. [Exemples d'utilisation](#exemples-dutilisation)

## Authentification

### Configuration Better Auth

L'API utilise Better Auth avec les endpoints suivants :

- **Base URL** : `/api/auth`
- **Méthodes supportées** : `GET`, `POST`
- **Authentification** : Email/Mot de passe
- **Sessions** : Cookies sécurisés

### Endpoints d'authentification

#### Connexion
```http
POST /api/auth/sign-in
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "motdepasse"
}
```

#### Inscription
```http
POST /api/auth/sign-up
Content-Type: application/json

{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "motdepasse"
}
```

#### Déconnexion
```http
POST /api/auth/sign-out
```

#### Obtenir la session
```http
GET /api/auth/session
```

## Endpoints API

### Entreprises

#### Lister les entreprises de l'utilisateur
```http
GET /api/companies
```

**Réponse :**
```json
[
  {
    "id": "uuid",
    "name": "Mon Entreprise",
    "logoUrl": "https://example.com/logo.png",
    "annualLeaveDays": 25,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "userMembershipId": "uuid",
    "userRole": "MANAGER"
  }
]
```

#### Créer une entreprise
```http
POST /api/companies
Content-Type: application/json

{
  "name": "Nouvelle Entreprise",
  "logoUrl": "https://example.com/logo.png",
  "annualLeaveDays": 25
}
```

#### Obtenir les détails d'une entreprise
```http
GET /api/companies/{companyId}
```

#### Modifier une entreprise
```http
PATCH /api/companies/{companyId}
Content-Type: application/json

{
  "name": "Nom modifié",
  "annualLeaveDays": 30
}
```

#### Supprimer une entreprise
```http
DELETE /api/companies/{companyId}
```

### Membres

#### Lister les membres d'une entreprise
```http
GET /api/companies/{companyId}/memberships
```

#### Inviter un membre
```http
POST /api/companies/{companyId}/memberships
Content-Type: application/json

{
  "email": "nouveau@example.com",
  "role": "EMPLOYEE"
}
```

#### Obtenir un membre
```http
GET /api/companies/{companyId}/memberships/{membershipId}
```

#### Modifier un membre
```http
POST /api/companies/{companyId}/memberships/{membershipId}
Content-Type: application/json

{
  "role": "MANAGER"
}
```

#### Supprimer un membre
```http
DELETE /api/companies/{companyId}/memberships/{membershipId}
```

### Congés

#### Lister les congés d'un membre
```http
GET /api/companies/{companyId}/memberships/{membershipId}/leaves
```

#### Créer une demande de congé
```http
POST /api/companies/{companyId}/memberships/{membershipId}/leaves
Content-Type: application/json

{
  "type": "PAID",
  "startDate": "2024-02-10T00:00:00Z",
  "endDate": "2024-02-14T00:00:00Z",
  "halfDayPeriod": null,
  "reason": "Vacances d'hiver"
}
```

#### Modifier une demande de congé
```http
PATCH /api/companies/{companyId}/memberships/{membershipId}/leaves/{leaveId}
Content-Type: application/json

{
  "startDate": "2024-02-11T00:00:00Z",
  "endDate": "2024-02-15T00:00:00Z",
  "reason": "Vacances modifiées"
}
```

#### Supprimer une demande de congé
```http
DELETE /api/companies/{companyId}/memberships/{membershipId}/leaves/{leaveId}
```

#### Approuver/Rejeter un congé
```http
POST /api/companies/{companyId}/leaves/{leaveId}/review
Content-Type: application/json

{
  "status": "APPROVED",
  "managerNote": "Congé approuvé"
}
```

#### Lister les congés d'une entreprise
```http
GET /api/companies/{companyId}/leaves?status=PENDING
```

#### Obtenir les statistiques des congés
```http
GET /api/companies/{companyId}/leaves/stats
```

**Réponse :**
```json
{
  "pendingLeaves": 5,
  "approvedLeaves": 23,
  "rejectedLeaves": 2
}
```

#### Obtenir le calendrier des congés
```http
GET /api/companies/{companyId}/calendar?year=2024&month=2
```

### Soldes de congés

#### Obtenir les soldes d'un membre
```http
GET /api/companies/{companyId}/memberships/{membershipId}/leave-balances
```

#### Modifier un solde de congé
```http
POST /api/companies/{companyId}/memberships/{membershipId}/leave-balances
Content-Type: application/json

{
  "type": "PAID",
  "change": 5.0,
  "reason": "Ajustement manuel"
}
```

#### Obtenir l'historique des soldes
```http
GET /api/companies/{companyId}/memberships/{membershipId}/leave-balance-history
```

### Statistiques d'entreprise

#### Obtenir les statistiques générales
```http
GET /api/companies/{companyId}/stats
```

## Modèles de données

### Types d'énumérations

#### UserRole
- `EMPLOYEE` : Employé
- `MANAGER` : Manager

#### LeaveType
- `PAID` : Congés payés
- `UNPAID` : Congé sans solde
- `RTT` : Réduction du temps de travail
- `SICK` : Maladie
- `MATERNITY` : Maternité
- `PATERNITY` : Paternité
- `PARENTAL` : Parental
- `BEREAVEMENT` : Deuil
- `MARRIAGE` : Mariage
- `MOVING` : Déménagement
- `CHILD_SICK` : Enfant malade
- `TRAINING` : Formation
- `UNJUSTIFIED` : Absence injustifiée
- `ADJUSTMENT` : Ajustement manuel

#### LeaveStatus
- `PENDING` : En attente
- `APPROVED` : Approuvé
- `REJECTED` : Rejeté
- `CANCELED` : Annulé

#### HalfDayPeriod
- `MORNING` : Matin
- `AFTERNOON` : Après-midi

### Schémas de validation

#### CreateCompanySchema
```typescript
{
  name: string (min: 1),
  logoUrl?: string,
  annualLeaveDays: number (min: 25)
}
```

#### CreateLeaveSchema
```typescript
{
  type: LeaveType,
  startDate: Date,
  endDate: Date,
  halfDayPeriod?: HalfDayPeriod,
  reason?: string
}
```

#### InviteMemberSchema
```typescript
{
  email: string (email format),
  role: UserRole
}
```

#### ReviewLeaveSchema
```typescript
{
  status: "APPROVED" | "REJECTED",
  managerNote?: string
}
```

## Codes d'erreur

### Codes de statut HTTP

- `200` : Succès
- `201` : Créé avec succès
- `204` : Supprimé avec succès
- `400` : Données invalides
- `401` : Non authentifié
- `403` : Accès interdit
- `404` : Ressource non trouvée
- `500` : Erreur serveur

### Format des erreurs

```json
{
  "error": "Message d'erreur",
  "details": [
    {
      "field": "email",
      "message": "Format email invalide"
    }
  ]
}
```

## Exemples d'utilisation

### Client TypeScript

```typescript
class ArkoaAPI {
  private baseUrl: string
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }
  
  async signIn(email: string, password: string) {
    const response = await fetch(`${this.baseUrl}/auth/sign-in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    })
    
    return response.json()
  }
  
  async getCompanies() {
    const response = await fetch(`${this.baseUrl}/companies`, {
      credentials: 'include'
    })
    
    return response.json()
  }
  
  async createLeave(companyId: string, membershipId: string, leave: {
    type: string
    startDate: string
    endDate: string
    reason?: string
  }) {
    const response = await fetch(
      `${this.baseUrl}/companies/${companyId}/memberships/${membershipId}/leaves`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...leave,
          startDate: new Date(leave.startDate),
          endDate: new Date(leave.endDate)
        })
      }
    )
    
    return response.json()
  }
}

// Utilisation
const api = new ArkoaAPI('https://arkoa.app/api')

// Connexion
await api.signIn('user@example.com', 'password')

// Récupérer les entreprises
const companies = await api.getCompanies()

// Créer une demande de congé
const leave = await api.createLeave(
  'company-id',
  'membership-id',
  {
    type: 'PAID',
    startDate: '2024-02-10',
    endDate: '2024-02-14',
    reason: 'Vacances'
  }
)
```

### Exemple avec curl

```bash
# Connexion
curl -X POST https://arkoa.app/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt

# Lister les entreprises
curl -X GET https://arkoa.app/api/companies \
  -b cookies.txt

# Créer une demande de congé
curl -X POST https://arkoa.app/api/companies/company-id/memberships/membership-id/leaves \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "type": "PAID",
    "startDate": "2024-02-10T00:00:00Z",
    "endDate": "2024-02-14T00:00:00Z",
    "reason": "Vacances d'hiver"
  }'
```

## Environnements

- **Développement** : `http://localhost:3000/api`
- **Staging** : `https://staging.arkoa.app/api`
- **Production** : `https://arkoa.app/api`

## Authentification et sécurité

- Toutes les routes API (sauf `/auth`) nécessitent une authentification
- Les sessions sont gérées via des cookies sécurisés
- Protection CSRF intégrée
- Rate limiting sur les endpoints d'authentification
- Validation des données avec Zod
- Autorisation basée sur les rôles (EMPLOYEE/MANAGER)

## Limitations

- Rate limiting : 5 requêtes/minute pour `/auth`, 20 requêtes/minute pour `/api`
- Taille maximale des requêtes : 1MB
- Timeout des requêtes : 30 secondes
- Sessions expirées après 7 jours d'inactivité

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Support** : [support@arkoa.app](mailto:support@arkoa.app)