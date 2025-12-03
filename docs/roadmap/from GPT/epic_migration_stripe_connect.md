# EPIC --- Migration Stripe Standard → Stripe Connect (Version corrigée)

## 1. Objectif

Permettre à Klubr de devenir un SaaS autonome en déléguant la gestion
financière aux associations via Stripe Connect.

## 2. Pourquoi migrer

-   Conformité légale accrue.
-   Paiements versés directement aux associations.
-   Génération des reçus fiscaux au nom des associations.
-   Réduction de la responsabilité financière de Klubr.
-   Frais de plateforme natifs.
-   Adapté au multi-tenant.

## 3. Impacts sur l'expérience utilisateur

### 3.1 Associations (Angular Dashboard + Next.js onboarding)

-   Parcours unifié d'inscription association → Next.js.
-   Création du compte Stripe Connect pendant l'inscription.
-   Dashboard Angular :
    -   Suivi état du compte de paiement.
    -   Gestion documents/validation Stripe.
    -   Facturation Klubr (frais, abonnements).
    -   Vue historique des dons pour l'association.
    -   Vue superadmin : dons globaux multi-tenant.

### 3.2 Donateurs (Svelte --- Web component)

-   Pas de changement visuel majeur.
-   Le bénéficiaire affiché = l'association (et non Klubr).
-   Le web component Svelte créera les `PaymentIntents` avec
    `stripeAccount`.
-   Reçus fiscaux générés au nom de l'association.

### 3.3 Équipe Klubr (Superadmin)

-   Monitoring des comptes connectés (KYC complet / incomplet /
    suspendu).
-   Vue globale des dons, frais, reversements.
-   Logs Stripe (webhooks).
-   Export comptable.

## 4. Impacts techniques

### Backend (Strapi)

-   Nouveau modèle ConnectedAccount.
-   Routes : onboarding, refresh onboarding link, create paymentIntent,
    sync account info.
-   Webhooks obligatoires (account.updated, payment_intent.succeeded,
    etc.)
-   Adaptation du fiscaux-service.

### Frontend

#### Svelte (formulaire don)

-   Mise à jour du payment flow.
-   Intégration `stripeAccount` dans les appels backend.
-   Gestion des erreurs spécifiques Connect (ex: account disabled).

#### Next.js (inscription)

-   Création du compte Stripe Connect au moment de l'inscription.
-   Écran "Continue onboarding Stripe".

#### Angular Dashboard

-   Nouveaux écrans :
    -   Activation compte de paiement.
    -   Suivi état KYC.
    -   Facturation (Kubr → association).
    -   Dashboard global dons.
-   Multi-tenant: sélecteurs de marque/domaines.

## 5. Risques

-   Associations novices → besoin d'accompagnement.
-   Incomplétude KYC entraînant suspension.
-   Besoin d'emails de relance KYC automatisés.

## 6. Livrables de l'EPIC

-   Parcours Stripe Connect complet (Next.js + Angular).
-   Web component Svelte mis à jour.
-   Implémentation Strapi + Webhooks.
-   Templates reçus fiscaux mis à jour.
-   Nouveaux dashboards.
-   Documentation technique/produit.

## 7. Critères d'acceptation

-   Une association peut activer son compte Stripe Connect sans aide.
-   Un don peut être réalisé dès activation.
-   Klubr perçoit les frais automatiquement.
-   100% des paiements passent par les comptes connectés.
