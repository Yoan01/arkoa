# Product Requirements Document (PRD) - Arkoa

## Document Information

- **Product Name**: Arkoa - Plateforme de Gestion des Congés
- **Version**: 1.0
- **Date**: January 2025
- **Status**: Draft
- **Owner**: Product Team
- **Stakeholders**: Engineering, Design, Business

---

## Table des matières

1. [Vue d'ensemble du produit](#vue-densemble-du-produit)
2. [Objectifs et métriques](#objectifs-et-métriques)
3. [Personas et cas d'usage](#personas-et-cas-dusage)
4. [Fonctionnalités détaillées](#fonctionnalités-détaillées)
5. [Exigences techniques](#exigences-techniques)
6. [Exigences non-fonctionnelles](#exigences-non-fonctionnelles)
7. [Interface utilisateur](#interface-utilisateur)
8. [Intégrations](#intégrations)
9. [Sécurité et conformité](#sécurité-et-conformité)
10. [Plan de déploiement](#plan-de-déploiement)
11. [Métriques de succès](#métriques-de-succès)
12. [Risques et mitigation](#risques-et-mitigation)

---

## Vue d'ensemble du produit

### Vision
Arkoa vise à simplifier et moderniser la gestion des congés en entreprise en offrant une plateforme intuitive, sécurisée et complète qui automatise les processus d'approbation et améliore la visibilité sur les plannings d'équipe.

### Mission
Fournir aux entreprises de toutes tailles un outil de gestion des congés qui :
- Réduit la charge administrative
- Améliore la transparence des processus
- Facilite la planification des équipes
- Assure la conformité réglementaire

### Proposition de valeur
- **Pour les employés** : Interface simple pour demander des congés et suivre leurs soldes
- **Pour les managers** : Outils d'approbation efficaces et vue d'ensemble des plannings
- **Pour les RH** : Tableau de bord complet avec statistiques et gestion centralisée
- **Pour l'entreprise** : Réduction des coûts administratifs et amélioration de la satisfaction employé

### Positionnement marché
Arkoa se positionne comme une alternative moderne aux solutions legacy, ciblant les PME et ETI qui cherchent une solution cloud native, sécurisée et facile à déployer.

---

## Objectifs et métriques

### Objectifs business
1. **Acquisition** : Acquérir 100 entreprises clientes dans les 12 premiers mois
2. **Rétention** : Maintenir un taux de rétention > 90%
3. **Satisfaction** : Atteindre un NPS > 50
4. **Croissance** : Augmenter l'ARR de 200% année sur année

### Objectifs produit
1. **Adoption** : 80% des employés utilisent activement la plateforme
2. **Efficacité** : Réduire le temps de traitement des demandes de 70%
3. **Fiabilité** : Uptime > 99.9%
4. **Performance** : Temps de réponse < 200ms

### KPIs clés
- Nombre d'entreprises actives
- Nombre d'utilisateurs actifs mensuels (MAU)
- Temps moyen de traitement des demandes
- Taux d'adoption par fonctionnalité
- Score de satisfaction utilisateur

---

## Personas et cas d'usage

### Persona 1 : Sarah - Employée
**Profil** : Développeuse, 28 ans, travaille en remote
**Besoins** :
- Demander des congés rapidement
- Voir ses soldes en temps réel
- Planifier ses vacances à l'avance

**Cas d'usage** :
- Demande de congés payés pour vacances d'été
- Consultation du solde RTT restant
- Demande de congé maladie en urgence

### Persona 2 : Marc - Manager
**Profil** : Chef d'équipe, 35 ans, manage 8 personnes
**Besoins** :
- Approuver/rejeter les demandes efficacement
- Voir la disponibilité de son équipe
- Planifier les projets selon les absences

**Cas d'usage** :
- Approbation de demandes de congés
- Consultation du planning équipe
- Gestion des conflits de planning

### Persona 3 : Julie - RH
**Profil** : Responsable RH, 42 ans, gère 150 employés
**Besoins** :
- Vue d'ensemble de l'entreprise
- Statistiques et rapports
- Gestion des politiques de congés

**Cas d'usage** :
- Configuration des types de congés
- Génération de rapports mensuels
- Audit des soldes de congés

---

## Fonctionnalités détaillées

### 1. Authentification et gestion des comptes

#### 1.1 Inscription et connexion
- **Exigence** : Système d'authentification sécurisé
- **Fonctionnalités** :
  - Inscription par email/mot de passe
  - Connexion avec session persistante
  - Récupération de mot de passe
  - Validation d'email
- **Critères d'acceptation** :
  - L'utilisateur peut créer un compte avec email valide
  - Le mot de passe respecte les critères de sécurité
  - La session reste active pendant 7 jours
  - L'email de validation est envoyé dans les 5 minutes

#### 1.2 Gestion des profils
- **Fonctionnalités** :
  - Modification des informations personnelles
  - Changement de mot de passe
  - Préférences de notification
- **Critères d'acceptation** :
  - L'utilisateur peut modifier son nom et email
  - Le changement de mot de passe nécessite l'ancien mot de passe
  - Les préférences sont sauvegardées automatiquement

### 2. Gestion des entreprises

#### 2.1 Création d'entreprise
- **Exigence** : Permettre la création et configuration d'entreprises
- **Fonctionnalités** :
  - Création d'entreprise avec nom et logo
  - Configuration des jours de congés annuels
  - Paramétrage des types de congés autorisés
- **Critères d'acceptation** :
  - Une entreprise doit avoir un nom unique
  - Le logo est optionnel (formats : PNG, JPG, SVG)
  - Les jours de congés annuels sont configurables (0-50)

#### 2.2 Gestion des membres
- **Fonctionnalités** :
  - Invitation de nouveaux membres par email
  - Attribution de rôles (EMPLOYEE, MANAGER, ADMIN)
  - Désactivation/réactivation de comptes
- **Critères d'acceptation** :
  - L'invitation génère un lien unique valide 7 jours
  - Les rôles déterminent les permissions d'accès
  - Un membre désactivé ne peut plus se connecter

### 3. Gestion des congés

#### 3.1 Types de congés supportés
- **Congés payés** (PAID) : Congés annuels standard
- **RTT** : Réduction du temps de travail
- **Congé sans solde** (UNPAID) : Sans déduction du solde
- **Maladie** (SICK) : Arrêt maladie
- **Maternité/Paternité** (MATERNITY/PATERNITY)
- **Congé parental** (PARENTAL)
- **Deuil** (BEREAVEMENT)
- **Mariage** (MARRIAGE)
- **Déménagement** (MOVING)
- **Enfant malade** (CHILD_SICK)
- **Formation** (TRAINING)
- **Absence injustifiée** (UNJUSTIFIED)
- **Ajustement manuel** (ADJUSTMENT)

#### 3.2 Demande de congés
- **Fonctionnalités** :
  - Sélection du type de congé
  - Choix des dates de début et fin
  - Option demi-journée (matin/après-midi)
  - Ajout d'une note explicative
  - Calcul automatique des jours ouvrés
- **Critères d'acceptation** :
  - La date de fin doit être >= date de début
  - Les weekends sont exclus du calcul
  - Le solde disponible est vérifié avant soumission
  - Les chevauchements avec d'autres congés sont détectés

#### 3.3 Workflow d'approbation
- **Fonctionnalités** :
  - Soumission automatique au manager
  - Approbation/rejet avec commentaire
  - Notifications par email
  - Historique des actions
- **Critères d'acceptation** :
  - Le manager reçoit une notification dans l'heure
  - L'employé est notifié de la décision
  - Les commentaires sont obligatoires en cas de rejet
  - L'historique est conservé indéfiniment

### 4. Gestion des soldes

#### 4.1 Calcul des soldes
- **Fonctionnalités** :
  - Attribution automatique des congés annuels
  - Calcul prorata selon la date d'arrivée
  - Report de solde d'une année sur l'autre
  - Ajustements manuels par les RH
- **Critères d'acceptation** :
  - Les congés sont attribués au 1er janvier
  - Le prorata est calculé au mois près
  - Le report est limité selon la politique entreprise
  - Les ajustements sont tracés avec justification

#### 4.2 Historique des soldes
- **Fonctionnalités** :
  - Suivi de toutes les modifications
  - Catégorisation des mouvements
  - Export des données
- **Critères d'acceptation** :
  - Chaque modification est horodatée
  - L'auteur de la modification est enregistré
  - Les données sont exportables en CSV

### 5. Tableaux de bord et statistiques

**Note** : Les tableaux de bord avancés sont prévus pour les phases 2 et 3 du développement.

#### 5.1 Dashboard employé (MVP - Phase 1)
- **Fonctionnalités actuelles** :
  - Vue des soldes actuels
  - Historique des demandes
- **Prévues Phase 2** :
  - Calendrier personnel
  - Prochaines absences de l'équipe

#### 5.2 Dashboard manager (Phase 2)
- **Fonctionnalités prévues** :
  - Demandes en attente d'approbation
  - Planning de l'équipe
  - Statistiques d'utilisation
  - Alertes de conflits

#### 5.3 Dashboard RH/Admin (Phase 3)
- **Fonctionnalités prévues** :
  - Vue d'ensemble entreprise
  - Statistiques détaillées
  - Rapports personnalisables
  - Gestion des politiques

---

## Exigences techniques

### Architecture
- **Frontend** : Next.js 15 avec App Router
- **Backend** : API Routes Next.js
- **Base de données** : PostgreSQL 14+
- **ORM** : Prisma
- **Authentification** : Better Auth
- **Validation** : Zod
- **Styling** : Tailwind CSS
- **Tests** : Jest + Testing Library + Playwright

### Infrastructure
- **Hébergement** : Cloud provider (AWS/GCP/Azure)
- **Base de données** : PostgreSQL managée
- **CDN** : CloudFront ou équivalent
- **Monitoring** : Application et infrastructure
- **Backup** : Sauvegarde quotidienne automatique

### APIs et intégrations
- **API REST** : Endpoints standardisés
- **Webhooks** : Notifications externes
- **Export** : CSV, PDF pour les rapports
- **Import** : Données utilisateurs en masse

---

## Exigences non-fonctionnelles

### Performance
- **Temps de réponse** : < 200ms pour 95% des requêtes
- **Temps de chargement** : < 2s pour la première visite
- **Throughput** : Support de 1000 utilisateurs simultanés

### Fiabilité
- **Uptime** : 99.9% de disponibilité
- **RTO** : < 4h en cas de panne majeure
- **RPO** : < 1h de perte de données maximum

### Sécurité
- **Authentification** : Multi-facteur optionnel
- **Chiffrement** : HTTPS obligatoire, données sensibles chiffrées
- **Audit** : Logs de toutes les actions sensibles
- **Conformité** : RGPD, SOC2 Type II

### Scalabilité
- **Utilisateurs** : Support de 10,000 utilisateurs par instance
- **Données** : Gestion de 1M+ enregistrements de congés
- **Croissance** : Architecture horizontalement scalable

### Usabilité
- **Responsive** : Support mobile et desktop
- **Accessibilité** : Conformité WCAG 2.1 AA
- **Internationalisation** : Support français/anglais
- **Offline** : Fonctionnalités de base en mode hors ligne

---

## Interface utilisateur

### Principes de design
- **Simplicité** : Interface épurée et intuitive
- **Cohérence** : Design system unifié
- **Accessibilité** : Contraste élevé, navigation clavier
- **Responsive** : Adaptation mobile-first

### Composants clés
- **Navigation** : Menu principal avec breadcrumbs
- **Formulaires** : Validation en temps réel
- **Tableaux** : Tri, filtrage, pagination
- **Calendrier** : Vue mensuelle/hebdomadaire
- **Notifications** : Toast messages et badges

### Wireframes principaux
1. **Page d'accueil** : Dashboard personnalisé par rôle
2. **Demande de congé** : Formulaire en étapes
3. **Approbations** : Liste avec actions rapides
4. **Planning équipe** : Vue calendrier avec filtres
5. **Statistiques** : Graphiques et métriques

---

## Intégrations

### Intégrations prioritaires
1. **Email** : SMTP pour notifications
2. **Calendrier** : Export iCal/Google Calendar
3. **SIRH** : Import/export données employés
4. **SSO** : Active Directory, Google Workspace

### Intégrations futures
1. **Slack/Teams** : Notifications et commandes
2. **Jira/Asana** : Planification projets
3. **Payroll** : Systèmes de paie
4. **Analytics** : Google Analytics, Mixpanel

---

## Sécurité et conformité

### Mesures de sécurité
- **Authentification** : Sessions sécurisées, rate limiting
- **Autorisation** : RBAC (Role-Based Access Control)
- **Données** : Chiffrement AES-256, hachage bcrypt
- **Transport** : TLS 1.3, HSTS headers
- **Audit** : Logs détaillés, monitoring anomalies

### Conformité RGPD
- **Consentement** : Opt-in explicite pour les données
- **Portabilité** : Export des données utilisateur
- **Suppression** : Droit à l'oubli implémenté
- **Transparence** : Politique de confidentialité claire

### Tests de sécurité
- **Penetration testing** : Trimestriel
- **Vulnerability scanning** : Hebdomadaire
- **Code review** : Obligatoire pour toute modification
- **Dependency scanning** : Automatique sur chaque build

---

## Plan de déploiement

### Phases de déploiement

#### Phase 1 : MVP (Mois 1-3)
- Authentification et gestion utilisateurs
- Gestion basique des congés (demande/approbation)
- Dashboard simple
- Déploiement en staging

#### Phase 2 : Core Features (Mois 4-6)
- Tous les types de congés
- Gestion des soldes
- Notifications email
- Déploiement en production (beta)

#### Phase 3 : Advanced Features (Mois 7-9)
- Statistiques avancées
- Export/import
- API publique
- Intégrations tierces

#### Phase 4 : Scale & Polish (Mois 10-12)
- Optimisations performance
- Fonctionnalités avancées
- Mobile app
- Expansion internationale

### Stratégie de rollout
1. **Alpha** : Équipe interne (50 utilisateurs)
2. **Beta fermée** : Clients pilotes (500 utilisateurs)
3. **Beta ouverte** : Early adopters (5,000 utilisateurs)
4. **GA** : Disponibilité générale

---

## Métriques de succès

### Métriques d'adoption
- **Taux d'activation** : % d'utilisateurs qui créent leur première demande
- **Engagement** : Nombre de sessions par utilisateur/mois
- **Rétention** : % d'utilisateurs actifs après 30/90 jours

### Métriques d'efficacité
- **Temps de traitement** : Délai moyen approbation/rejet
- **Taux d'approbation** : % de demandes approuvées
- **Erreurs utilisateur** : Nombre de demandes invalides

### Métriques business
- **Customer Acquisition Cost (CAC)**
- **Customer Lifetime Value (CLV)**
- **Monthly Recurring Revenue (MRR)**
- **Churn rate**

### Métriques techniques
- **Uptime** : Disponibilité du service
- **Performance** : Temps de réponse API
- **Erreurs** : Taux d'erreur 5xx
- **Sécurité** : Tentatives d'intrusion détectées

---

## Risques et mitigation

### Risques techniques

#### Risque : Performance dégradée avec la montée en charge
- **Probabilité** : Moyenne
- **Impact** : Élevé
- **Mitigation** :
  - Tests de charge réguliers
  - Architecture scalable dès le départ
  - Monitoring proactif
  - Plan de scaling automatique

#### Risque : Faille de sécurité
- **Probabilité** : Faible
- **Impact** : Critique
- **Mitigation** :
  - Security by design
  - Audits de sécurité réguliers
  - Bug bounty program
  - Plan de réponse aux incidents

### Risques business

#### Risque : Adoption lente par les utilisateurs
- **Probabilité** : Moyenne
- **Impact** : Élevé
- **Mitigation** :
  - UX research approfondie
  - Programme de formation
  - Support client réactif
  - Feedback loops courts

#### Risque : Concurrence agressive
- **Probabilité** : Élevée
- **Impact** : Moyen
- **Mitigation** :
  - Différenciation produit claire
  - Innovation continue
  - Fidélisation client
  - Partenariats stratégiques

### Risques réglementaires

#### Risque : Non-conformité RGPD
- **Probabilité** : Faible
- **Impact** : Critique
- **Mitigation** :
  - Privacy by design
  - Audit de conformité
  - Formation équipe
  - Conseil juridique spécialisé

---

## Annexes

### A. Glossaire
- **RTT** : Réduction du Temps de Travail
- **SIRH** : Système d'Information de Gestion des Ressources Humaines
- **RBAC** : Role-Based Access Control
- **SLA** : Service Level Agreement
- **RTO** : Recovery Time Objective
- **RPO** : Recovery Point Objective

### B. Références
- Code du travail français
- Réglementation RGPD
- Standards de sécurité ISO 27001
- Guidelines d'accessibilité WCAG 2.1

### C. Contacts
- **Product Owner** : [nom@arkoa.app]
- **Tech Lead** : [nom@arkoa.app]
- **Design Lead** : [nom@arkoa.app]
- **Security Officer** : [nom@arkoa.app]

---

*Ce document est un document vivant qui sera mis à jour régulièrement en fonction de l'évolution du produit et des retours utilisateurs.*

**Dernière mise à jour** : January 2025
**Version** : 1.0
**Statut** : Draft