### Workflow de Collecte de Dons - Klubr/Donaction

> **Version**: 1.0.0 | **Date**: 2025-01-09 | **Statut**: Documentation de l'existant

---

#### Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Modèle de Données](#2-modèle-de-données)
3. [Configuration par Club](#3-configuration-par-club)
4. [Formulaire de Don](#4-formulaire-de-don)
5. [Flux de Paiement Stripe](#5-flux-de-paiement-stripe)
6. [Cycle de Vie d'un Don](#6-cycle-de-vie-dun-don)
7. [Actions Post-Paiement](#7-actions-post-paiement)
8. [Relances et Dons Non Terminés](#8-relances-et-dons-non-terminés)
9. [Flux Financier](#9-flux-financier)
10. [Facturation des Clubs](#10-facturation-des-clubs)
11. [Affichage dans les Interfaces](#11-affichage-dans-les-interfaces)
12. [Routes API - Référence Complète](#12-routes-api---référence-complète)
13. [Emails Envoyés](#13-emails-envoyés)
14. [Annexes](#14-annexes)

---

#### 1. Vue d'Ensemble

##### 1.1 Objectif du Document

Ce document décrit exhaustivement le workflow de collecte de dons de la plateforme Klubr/Donaction, une solution permettant aux associations sportives françaises de recevoir des dons de particuliers et d'entreprises avec génération automatique de reçus fiscaux.

##### 1.2 Architecture Impliquée

| Application | Framework | Rôle |
|-------------|-----------|------|
| **donaction-api** | Strapi 5 (TypeScript) | Backend API, gestion des dons, webhooks Stripe |
| **donaction-frontend** | Next.js 15 | Site public, espace donateur |
| **donaction-admin** | Angular 21 | Dashboard gestionnaires d'associations |
| **donaction-saas** | Svelte 5 | Web components (formulaire de don) |

##### 1.3 Flux Global

```mermaid
flowchart TB
    subgraph Frontend ["🖥️ Frontend (Svelte Widget)"]
        A[Donateur accède au formulaire] --> B[Step 1: Choix montant + options]
        B --> C[Step 2: Informations donateur]
        C --> D[Step 3: Récapitulatif + CGU]
        D --> E[Step 4: Paiement Stripe]
        E --> F[Step 5: Confirmation]
    end

    subgraph API ["⚙️ API (Strapi)"]
        G[POST /klub-dons - Création don]
        H[POST /klubr-donateurs - Création donateur]
        I[POST /klub-don-payments/create-payment-intent]
        J[Webhook: payment_intent.succeeded]
        K[Génération PDF Attestation]
        L[Génération PDF Reçu Fiscal]
        M[Envoi emails]
    end

    subgraph Stripe ["💳 Stripe"]
        N[PaymentIntent créé]
        O[Paiement confirmé]
        P[Webhook envoyé]
    end

    B --> G
    C --> H
    D --> I
    I --> N
    E --> O
    O --> P
    P --> J
    J --> K
    J --> L
    K --> M
    L --> M
    M --> F
```

---

#### 2. Modèle de Données

##### 2.1 Entités Principales

###### `klub-don` (Don)

| Attribut | Type | Description |
|----------|------|-------------|
| `uuid` | UUID | Identifiant unique public |
| `montant` | decimal | Montant du don en euros |
| `contributionAKlubr` | decimal | Contribution optionnelle à la plateforme |
| `deductionFiscale` | decimal | Montant de la déduction fiscale calculée |
| `statusPaiment` | enum | `notDone`, `pending`, `success`, `error` |
| `datePaiment` | datetime | Date/heure du paiement réussi |
| `estOrganisme` | boolean | true = entreprise, false = particulier |
| `withTaxReduction` | boolean | Souhaite bénéficier de la réduction fiscale |
| `attestationNumber` | string | Numéro unique de l'attestation (ex: `ATT-2025-00001`) |
| `attestationPath` | string | Chemin du fichier PDF attestation |
| `recuPath` | string | Chemin du fichier PDF reçu fiscal |
| `emailSent` | boolean | Email de confirmation envoyé |
| `hasBeenRelaunched` | boolean | Don relancé par email |
| `relaunchCode` | integer | Code de relance (4 chiffres) |
| `isContributionDonation` | boolean | Don de contribution Klubr (auto-généré) |

**Relations:**
- `klubDonateur` → one-to-one → `klubr-donateur`
- `klubr` → one-to-one → `klubr` (association bénéficiaire)
- `klub_projet` → one-to-one → `klub-projet` (projet optionnel)
- `klub_don_payments` → one-to-many → `klub-don-payment`
- `klub_don_contribution` → one-to-one → `klub-don` (don de contribution lié)
- `invoice` → many-to-one → `invoice`
- `invoice_line` → many-to-one → `invoice-line`

###### `klubr-donateur` (Donateur)

| Attribut | Type | Description |
|----------|------|-------------|
| `uuid` | UUID | Identifiant unique public |
| `civilite` | enum | `Madame`, `Monsieur` |
| `nom` | string | Nom de famille |
| `prenom` | string | Prénom |
| `email` | email | Email du donateur |
| `donateurType` | enum | `Particulier`, `Organisme` |
| `raisonSocial` | string | Raison sociale (si organisme) |
| `SIREN` | string | Numéro SIREN (si organisme) |
| `formeJuridique` | string | Forme juridique (si organisme) |
| `adresse` | string | Adresse ligne 1 |
| `adresse2` | string | Adresse ligne 2 |
| `cp` | string | Code postal (5 caractères max) |
| `ville` | string | Ville |
| `pays` | string | Pays (défaut: France) |
| `dateNaissance` | date | Date de naissance |
| `tel` | string | Téléphone |
| `optInAffMontant` | boolean | Afficher montant publiquement |
| `optInAffNom` | boolean | Afficher nom publiquement |
| `logo` | media | Logo entreprise |
| `avatar` | media | Avatar particulier |
| `anonymized` | boolean | Données anonymisées (RGPD) |

**Relations:**
- `klubDon` → one-to-one → `klub-don`
- `users_permissions_user` → one-to-one → User (si connecté)

###### `klub-don-payment` (Paiement Stripe)

| Attribut | Type | Description |
|----------|------|-------------|
| `uuid` | UUID | Identifiant unique |
| `intent_id` | string | ID du PaymentIntent Stripe (ex: `pi_xxx`) |
| `client_secret` | string | Client secret Stripe |
| `amount` | biginteger | Montant en centimes |
| `currency` | string | Devise (`eur`) |
| `payment_method` | string | ID de la méthode de paiement |
| `status` | string | `pending`, `succeeded`, `error` |
| `error_code` | string | Code erreur Stripe (si échec) |
| `created` | biginteger | Timestamp création |

**Relations:**
- `klub_don` → many-to-one → `klub-don`

##### 2.2 Diagramme ERD

```mermaid
erDiagram
    KLUBR ||--o{ KLUB_DON : "reçoit"
    KLUB_PROJET ||--o{ KLUB_DON : "reçoit"
    KLUBR_DONATEUR ||--|| KLUB_DON : "effectue"
    KLUB_DON ||--o{ KLUB_DON_PAYMENT : "a"
    KLUB_DON ||--o| KLUB_DON : "contribution_liée"
    KLUBR ||--|| TRADE_POLICY : "applique"
    INVOICE ||--o{ KLUB_DON : "contient"
    INVOICE_LINE ||--o{ KLUB_DON : "détaille"
    
    KLUB_DON {
        uuid uuid PK
        decimal montant
        decimal contributionAKlubr
        decimal deductionFiscale
        enum statusPaiment
        datetime datePaiment
        boolean estOrganisme
        boolean withTaxReduction
        string attestationNumber
    }
    
    KLUBR_DONATEUR {
        uuid uuid PK
        string nom
        string prenom
        string email
        enum donateurType
        string raisonSocial
        string SIREN
    }
    
    KLUB_DON_PAYMENT {
        uuid uuid PK
        string intent_id
        bigint amount
        string status
    }
    
    TRADE_POLICY {
        uuid uuid PK
        decimal commissionPercentage
        boolean noBilling
        boolean allowKlubrContribution
    }
```

---

#### 3. Configuration par Club

##### 3.1 Activation du Formulaire de Don

Un club peut recevoir des dons si:
- `klubr.donationEligible` = `true`
- `klubr.status` = `published`
- Le club a une `trade_policy` associée

##### 3.2 Politique Commerciale (Trade Policy)

| Attribut | Type | Description | Défaut |
|----------|------|-------------|--------|
| `tradePolicyLabel` | string | Nom de la politique | - |
| `commissionPercentage` | decimal | % commission Klubr | 6% |
| `VATPercentage` | decimal | % TVA sur commission | 20% |
| `noBilling` | boolean | Pas de facturation | false |
| `allowKlubrContribution` | boolean | Autoriser contribution plateforme | true |
| `perDonationCost` | decimal | Coût fixe par don | 0 |
| `klubDonationPercentage` | decimal | % spécifique dons Klubr | 0 |
| `defaultTradePolicy` | boolean | Politique par défaut | false |

##### 3.3 Attribution Automatique

À la création d'un club (`klubr.beforeCreate`), si aucune trade policy n'est définie, la politique par défaut est automatiquement assignée.

```typescript
// klubr/lifecycles.ts
if (!event.params.data?.trade_policy['connect']?.length) {
    event.params.data.trade_policy = await getDefaultTradePolicy();
}
```

---

#### 4. Formulaire de Don

##### 4.1 Points d'Entrée

| Source | URL | Description |
|--------|-----|-------------|
| Widget Svelte | `<donaction-form>` | Embarqué sur site externe |
| Frontend Next.js | `/[slug]?PAYEMENT_FORM=true` | Page club avec modale |
| Relance | `/[slug]?DON_UUID=xxx&RELAUNCH_CODE=1234` | Reprise don abandonné |

##### 4.2 Étapes du Formulaire

```mermaid
flowchart LR
    S1[Step 1<br/>Montant] --> S2[Step 2<br/>Coordonnées]
    S2 --> S3[Step 3<br/>Récapitulatif]
    S3 --> S4[Step 4<br/>Paiement]
    S4 --> S5[Step 5<br/>Confirmation]
```

###### Step 1: Choix du Montant

**Données collectées:**
- `montant`: Montant du don (min: 10€, max: 100 000€)
- `withTaxReduction`: Souhaite réduction fiscale (Oui/Non)
- `estOrganisme`: Particulier ou Entreprise
- Sélection projet (si disponible) ou don au club

**Montants suggérés:** 20€, 50€, 100€, 250€ + montant libre

**Calcul déduction fiscale affichée:**
- Particulier: 66% du montant
- Entreprise: 60% du montant

**Appels API:**
```
POST /api/klub-dons
Body: {
  data: {
    klubr: klubUuid,
    klub_projet: projectUuid | null,
    montant: number,
    withTaxReduction: boolean,
    estOrganisme: boolean,
    statusPaiment: "notDone"
  }
}
```

###### Step 2: Informations Donateur

**Données collectées (Particulier avec réduction):**
- `email` (requis)
- `civilite` (Madame/Monsieur)
- `nom`, `prenom` (requis)
- `dateNaissance` (requis, doit être majeur)
- `adresse`, `cp`, `ville`, `pays` (requis)

**Données collectées (Entreprise avec réduction):**
- `email` (requis)
- `raisonSocial` (requis)
- `SIREN` (requis, validé)
- `formeJuridique` (requis)
- `adresse`, `cp`, `ville`, `pays` (requis)
- `logo` (optionnel)

**Données collectées (Sans réduction):**
- `email` (requis)
- `nom`, `prenom` (requis)
- `dateNaissance` (requis)

**Appels API:**
```
POST /api/klubr-donateurs
Body: {
  data: {
    email, nom, prenom, civilite, dateNaissance,
    adresse, cp, ville, pays,
    donateurType: "Particulier" | "Organisme",
    raisonSocial?, SIREN?, formeJuridique?,
    klubDon: donUuid
  }
}
```

###### Step 3: Récapitulatif

**Affichage:**
- Montant du don
- Contribution Klubr (modifiable via slider, max 25€)
- Total à payer
- Coût après réduction d'impôts
- Documents reçus (Attestation + Reçu fiscal si applicable)

**Options:**
- `displayName`: Afficher nom dans liste donateurs
- `displayAmount`: Afficher montant dans liste donateurs
- `acceptConditions1`: Compréhension Fonds de dotation
- `acceptConditions2`: Acceptation CGU

**Mise à jour don:**
```
PUT /api/klub-dons/{uuid}
Body: {
  data: {
    contributionAKlubr: number
  }
}
```

###### Step 4: Paiement Stripe

**Séquence:**

```mermaid
sequenceDiagram
    participant D as Donateur
    participant W as Widget Svelte
    participant API as Strapi API
    participant S as Stripe

    W->>API: POST /klub-don-payments/create-payment-intent
    Note right of API: price = montant + contributionAKlubr<br/>metadata = {donUuid, klubUuid, projectUuid, donorUuid}
    API->>S: stripe.paymentIntents.create()
    S-->>API: {client_secret, id}
    API->>API: Crée klub-don-payment (status: pending)
    API-->>W: {intent: client_secret}
    
    W->>W: stripe.elements.create('payment')
    D->>W: Saisie carte + validation
    W->>S: stripe.confirmPayment()
    S-->>W: {paymentIntent}
    
    alt Paiement réussi
        W->>API: GET /klub-don-payments/check?clientSecret&donUuid
        API->>S: stripe.paymentIntents.retrieve()
        S-->>API: {status: 'succeeded'}
        API->>API: Update don + payment status
        API-->>W: OK
        W->>W: Passe à Step 5
    else Paiement échoué
        W->>W: Affiche erreur + retry
    end
```

**Création PaymentIntent:**
```typescript
// klub-don-payment.controller.ts
async createPaymentIntent() {
    const { price, metadata } = ctx.request.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(price) * 100, // Centimes
        currency: 'eur',
        metadata: metadata, // {donUuid, klubUuid, projectUuid, donorUuid}
    });
    // Crée entrée klub_don_payment
    await updateDonAndDonPayment({
        status: 'pending',
        donUuid: metadata.donUuid,
        intent: paymentIntent,
    });
    return { intent: paymentIntent.client_secret };
}
```

###### Step 5: Confirmation

**Affichage:**
- Message de remerciement
- Récapitulatif du don
- Liens vers les PDFs (Attestation + Reçu)
- Invitation à créer un compte

##### 4.3 Don au Club vs Don à un Projet

| Type | `klubr` | `klub_projet` | Description |
|------|---------|---------------|-------------|
| Don au club | ✅ | `null` | Financement activités générales |
| Don à un projet | ✅ | ✅ | Financement projet spécifique |

Le choix se fait à l'étape 1 si le club a des projets actifs (`status: published`).

##### 4.4 Contribution à Klubr

La contribution est une **donation séparée** créée automatiquement après paiement réussi:

```typescript
// klub-don.service.ts - createContributionForDon()
const donContributionEntity = await strapi.documents('api::klub-don.klub-don').create({
    data: {
        statusPaiment: 'success',
        montant: klubrDon.contributionAKlubr,
        klubr: process.env.KLUBR_UUID,           // Club Klubr
        klub_projet: process.env.KLUBR_CONTRIBUTION_UUID, // Projet contribution
        withTaxReduction: klubrDon.withTaxReduction,
        attestationNumber: `${originalAttNumber}-CONTRIBUTION`,
        isContributionDonation: true,
    }
});
```

---

#### 5. Flux de Paiement Stripe

##### 5.1 Création du PaymentIntent

**Endpoint:** `POST /api/klub-don-payments/create-payment-intent`

**Payload:**
```json
{
  "price": 70,
  "metadata": {
    "donUuid": "abc-123",
    "klubUuid": "def-456",
    "projectUuid": "ghi-789",
    "donorUuid": "jkl-012"
  }
}
```

**Réponse:**
```json
{
  "intent": "pi_xxx_secret_yyy"
}
```

##### 5.2 Confirmation du Paiement (Client-side)

```typescript
// step4.svelte
const result = await stripe.confirmPayment({
    elements,
    confirmParams: {},
    redirect: 'if_required'
});

if (result.paymentIntent?.status === 'succeeded') {
    index.update((_) => _ + 1); // Passe à step 5
}
```

##### 5.3 Webhooks Stripe

**Endpoint:** `POST /api/klub-don-payments/stripe-web-hooks`

**Configuration:** `auth: false` (pas d'authentification requise)

**Événements gérés:**

| Event | Action |
|-------|--------|
| `payment_intent.created` | Log info, update status → `pending` |
| `payment_intent.succeeded` | Update status → `success`, trigger post-payment |
| `payment_intent.payment_failed` | Update status → `error`, store error_code |

```typescript
// klub-don-payment.controller.ts
async stripeWebHooks() {
    const sig = ctx.request.headers['stripe-signature'];
    const event = stripe.webhooks.constructEvent(
        ctx.request.body[Symbol.for('unparsedBody')],
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
    );

    const { donUuid, donorUuid, klubUuid, projectUuid } = event.data.object.metadata;

    switch (event.type) {
        case 'payment_intent.succeeded':
            await updateDonAndDonPayment({
                status: 'success',
                donUuid,
                intent: event.data.object
            });
            break;
        // ...
    }
}
```

##### 5.4 Vérification Post-Paiement (Check)

**Endpoint:** `GET /api/klub-don-payments/check?clientSecret=xxx&donUuid=yyy`

Utilisé côté client pour vérifier le statut final du paiement après confirmation Stripe.

##### 5.5 Diagramme de Séquence Complet

```mermaid
sequenceDiagram
    participant D as Donateur
    participant W as Widget
    participant API as API Strapi
    participant S as Stripe
    participant WH as Webhook Handler
    participant PDF as PDF Generator
    participant Email as Email Service

    Note over D,Email: Phase 1: Création du don
    D->>W: Remplit formulaire (steps 1-3)
    W->>API: POST /klub-dons (création)
    API-->>W: {uuid: "don-123"}
    W->>API: POST /klubr-donateurs (création)
    API-->>W: {uuid: "donateur-456"}

    Note over D,Email: Phase 2: Paiement
    W->>API: POST /klub-don-payments/create-payment-intent
    API->>S: stripe.paymentIntents.create()
    S-->>API: PaymentIntent {id, client_secret}
    API-->>W: {intent: client_secret}
    
    D->>W: Saisit carte
    W->>S: stripe.confirmPayment()
    S-->>W: {paymentIntent: succeeded}
    
    Note over D,Email: Phase 3: Webhook & Post-traitement
    S->>WH: POST /stripe-web-hooks (payment_intent.succeeded)
    WH->>API: updateDonAndDonPayment(status: success)
    API->>API: Update klub_don.statusPaiment = success
    API->>API: Update klub_don.datePaiment = now()
    API->>API: Generate attestationNumber
    
    Note over D,Email: Phase 4: Génération documents
    API->>PDF: GenerateCertificate(don)
    PDF-->>API: attestationPath
    API->>PDF: GenerateInvoice(don)
    PDF-->>API: recuPath
    
    Note over D,Email: Phase 5: Notifications
    API->>Email: sendDonsConfirmationEmail(don)
    Email-->>D: Email avec PDFs attachés
    API->>Email: sendDonsConfirmationEmailToKlubLeaders(don)
    Email-->>API: Notification managers
    
    W->>API: GET /check?clientSecret&donUuid
    API-->>W: {status: success}
    W->>D: Affiche confirmation (step 5)
```

---

#### 6. Cycle de Vie d'un Don

##### 6.1 États Possibles

| État | Valeur `statusPaiment` | Description |
|------|------------------------|-------------|
| 🆕 Créé | `notDone` | Don initialisé, pas de paiement |
| ⏳ En cours | `pending` | PaymentIntent créé, paiement en cours |
| ✅ Réussi | `success` | Paiement confirmé |
| ❌ Échoué | `error` | Paiement refusé |

##### 6.2 Transitions d'État

```mermaid
stateDiagram-v2
    [*] --> notDone: POST /klub-dons
    
    notDone --> pending: create-payment-intent
    notDone --> [*]: Abandon (nettoyé par cron)
    
    pending --> success: webhook payment_intent.succeeded
    pending --> error: webhook payment_intent.failed
    pending --> notDone: Timeout / Abandon
    
    error --> pending: Retry paiement
    
    success --> success: Documents générés
    
    note right of success
        Actions déclenchées:
        - Génération attestation PDF
        - Génération reçu fiscal PDF
        - Envoi emails
        - Création don contribution
        - Mise à jour montant projet
    end note
```

##### 6.3 Actions par Transition

| Transition | Actions déclenchées |
|------------|---------------------|
| `notDone` → `pending` | Création `klub_don_payment` |
| `pending` → `success` | `afterUpdate` lifecycle: PDFs, emails, contribution |
| `pending` → `error` | Stockage `error_code`, log |
| `notDone` (>10min) | Cron: Relance email si donateur existe |

---

#### 7. Actions Post-Paiement

##### 7.1 Génération du Reçu Fiscal (PDF)

**Fichier:** `helpers/klubrPDF/generateInvoice/index.ts`

**Template:** Cerfa adapté selon type donateur
- `recu-template.pdf` (particulier)
- `recu-pro-template.pdf` (organisme)

**Données injectées:**
- Numéro de reçu (format: `R-{attestationNumber}`)
- Date du don
- Montant en chiffres et en lettres
- Informations donateur (nom, adresse, SIREN si applicable)
- Informations association bénéficiaire
- Articles de loi (200 ou 238 bis CGI)

**Stockage:** `/private-pdf/recus/{recuNumber}.pdf`

**Conditions:** Généré uniquement si `withTaxReduction = true`

##### 7.2 Génération de l'Attestation (PDF)

**Fichier:** `helpers/klubrPDF/generateCertificate/index.ts`

**Contenu:**
- Numéro d'attestation
- Date et heure du paiement
- Montant
- Informations donateur
- Informations bénéficiaire (club/projet)
- Status: "Payé"

**Stockage:** `/private-pdf/attestations/{attestationNumber}.pdf`

**Conditions:** Généré pour tous les dons réussis

##### 7.3 Envoi des Emails

**Service:** Brevo (SendinBlue) API

**Configuration:**
```typescript
// helpers/emails/sendBrevoTransacEmail.ts
const BREVO_TEMPLATES = {
    DONATION_DONOR_CONFIRMATION: 8,    // Confirmation donateur
    DONATION_ADMIN_NOTIFICATION: 7,     // Notification managers
    DONATION_DONOR_RELAUNCH: 21,        // Relance don abandonné
    CLUB_INVOICE: 13,                   // Facture club
    // ...
};
```

###### Email au Donateur

**Template:** `DONATION_DONOR_CONFIRMATION` (ID: 8)

**Pièces jointes:**
- Attestation de paiement (PDF)
- Reçu fiscal (PDF) si `withTaxReduction`
- Reçu contribution Klubr (PDF) si `contributionAKlubr > 0`

**Paramètres:**
```json
{
  "RECEIVER_FULLNAME": "Jean Dupont",
  "CLUB_DENOMINATION": "FC Lyon",
  "CLUB_LOGO_URL": "https://...",
  "PROJECT_TITLE": "Nouveau terrain",
  "DONATION_AMOUNT": 100,
  "DONATION_CONTRIBUTION": 10,
  "DONATION_DATE": "09/01/2025"
}
```

###### Email aux Managers du Club

**Template:** `DONATION_ADMIN_NOTIFICATION` (ID: 7)

**Destinataires:**
- Responsable du projet (si don à un projet)
- Leader du club
- Admin Klubr (copie)

**Paramètres:** Informations don + donateur

##### 7.4 Mise à Jour des Statistiques

**Projet (si applicable):**
```typescript
// klub-don/lifecycles.ts - afterUpdate
if (result.statusPaiment === 'success') {
    await strapi.documents('api::klub-projet.klub-projet').update({
        documentId: projekt.documentId,
        data: {
            montantTotalDonations: currentTotal + result.montant,
            nbDons: currentNbDons + 1
        }
    });
    // Marquer comme compté
    await strapi.documents('api::klub-don.klub-don').update({
        documentId: result.documentId,
        data: { montantAjouteAuMontantTotalDuProjet: true }
    });
}
```

---

#### 8. Relances et Dons Non Terminés

##### 8.1 Détection des Abandons

**Critères:**
- `statusPaiment` = `notDone` ou `pending`
- `updatedAt` < (now - 10 minutes)
- `hasBeenRelaunched` = `false`
- `relaunchCode` existe ou sera généré
- `klubDonateur.email` existe

##### 8.2 Mécanisme de Relance

**Cron:** `relaunchPendingDonations` - Toutes les 10 minutes

```typescript
// klub-don.service.ts - relaunchPendingDonations()
const entries = await strapi.db.query('api::klub-don.klub-don').findMany({
    where: {
        statusPaiment: { $in: ['notDone', 'pending'] },
        updatedAt: { $lt: new Date(Date.now() - 10 * 60 * 1000) },
        hasBeenRelaunched: false,
        relaunchCode: { $notNull: true }
    },
    populate: { klubDonateur: true, klubr: true, klub_projet: true }
});

for (const entry of entries) {
    const relaunchCode = entry.relaunchCode || Math.floor(1000 + Math.random() * 9000);
    const link = `${NEXTAUTH_URL}/${entry.klubr.slug}${
        entry.klub_projet ? '/nos-projets/' + entry.klub_projet.slug : ''
    }?PAYEMENT_FORM=true&DON_UUID=${entry.uuid}&RELAUNCH_CODE=${relaunchCode}`;
    
    await sendBrevoTransacEmail({
        to: [{ email: entry.klubDonateur.email }],
        templateId: BREVO_TEMPLATES.DONATION_DONOR_RELAUNCH,
        params: {
            RECEIVER_FULLNAME: `${entry.klubDonateur.prenom} ${entry.klubDonateur.nom}`,
            RELAUNCH_LINK: link
        }
    });
    
    await strapi.documents('api::klub-don.klub-don').update({
        documentId: entry.documentId,
        data: { hasBeenRelaunched: true, relaunchCode }
    });
}
```

##### 8.3 Cron Jobs Associés

| Cron | Fréquence | Action |
|------|-----------|--------|
| `relaunchPendingDonations` | */10 * * * * | Relance dons abandonnés |
| `cleanAllKlubDons` | 0 * * * * | Nettoyage dons orphelins |
| `anonymizeData` | Au démarrage (non-prod) | Anonymisation RGPD |

---

#### 9. Flux Financier

##### 9.1 Description du Circuit de l'Argent

```mermaid
flowchart TB
    subgraph Donateur
        D[💰 Don: 100€<br/>+ Contribution: 10€<br/>= Total: 110€]
    end
    
    subgraph Stripe ["Stripe (Paiement Direct)"]
        S[Compte Klubr<br/>Reçoit 110€]
        SF[Frais Stripe ~2%<br/>≈ 2.20€]
    end
    
    subgraph Redistribution ["Redistribution Mensuelle"]
        K[🏢 Klubr<br/>Commission 6% = 6€<br/>+ Contribution = 10€]
        C[⚽ Club<br/>Don net = 94€]
    end
    
    D -->|Paiement carte| S
    S -->|Prélèvement| SF
    S -->|Virement mensuel| K
    S -->|Virement mensuel| C
```

##### 9.2 Répartition des Fonds

**Pour un don de 100€ avec contribution de 10€:**

| Destinataire | Montant | Calcul |
|--------------|---------|--------|
| **Club/Association** | 94€ | 100€ - 6% commission |
| **Klubr (commission)** | 6€ | 6% de 100€ |
| **Klubr (contribution)** | 10€ | Contribution volontaire |
| **Stripe (frais)** | ~2.20€ | ~2% du total |

> **Note:** Les frais Stripe sont actuellement supportés par Klubr. La migration vers Stripe Connect changera ce modèle.

##### 9.3 Taux de Déduction Fiscale

```typescript
// constants.ts
export const TAUX_DEDUCTION_FISCALE_PART = 0.66; // 66% pour particuliers
export const TAUX_DEDUCTION_FISCALE_PRO = 0.60;  // 60% pour entreprises
```

**Calcul côté API:**
```typescript
// klub-don.service.ts
updateBodyWithDeductionFiscale(body, don) {
    const montant = body?.data?.montant || don?.montant;
    const estOrganisme = body?.data?.estOrganisme || don?.estOrganisme;
    const withTaxReduction = body?.data?.withTaxReduction || don?.withTaxReduction;
    
    if (withTaxReduction) {
        const deductionFiscale = montant * (estOrganisme 
            ? TAUX_DEDUCTION_FISCALE_PRO 
            : TAUX_DEDUCTION_FISCALE_PART);
        body.data.deductionFiscale = deductionFiscale;
    }
    return body;
}
```

---

#### 10. Facturation des Clubs

##### 10.1 Modèle de Facturation

**Entité `invoice`:**

| Attribut | Type | Description |
|----------|------|-------------|
| `invoiceNumber` | string | Numéro unique (ex: `FAC-2025-001`) |
| `dateInvoice` | date | Date de facturation |
| `billingPeriod` | string | Période (ex: "Janvier 2025") |
| `klubr` | relation | Club facturé |
| `amountExcludingTax` | decimal | Montant HT |
| `VAT` | decimal | TVA |
| `amountIncludingTax` | decimal | Montant TTC |
| `creditTotalAmount` | decimal | Total dons (crédit) |
| `commissionPercentage` | decimal | % commission appliqué |
| `invoicePdfPath` | string | Chemin PDF généré |

##### 10.2 Génération des Factures

**Service:** `invoice.service.ts - createInvoices()`

**Processus:**
1. Récupère tous les clubs avec `trade_policy.noBilling = false`
2. Pour chaque club, récupère les dons du mois (`statusPaiment = success`)
3. Groupe les dons par type (club / projets)
4. Calcule les commissions selon la `trade_policy`
5. Crée les `invoice_lines`
6. Génère le PDF
7. Envoie par email aux leaders du club

**Calcul des lignes:**
```typescript
// Ligne crédit: Dons au club
{
    reference: "DONS CLUB",
    description: `Financement des activités d'intérêt général - ${month}/${year}`,
    isCreditLine: true
}

// Ligne crédit: Dons par projet
{
    reference: "DONS PROJET",
    description: `${project.titre} - ${month}/${year}`,
    isCreditLine: true,
    klub_projet: project.id
}

// Ligne débit: Commission
{
    reference: tradePolicy.reference,
    description: tradePolicy.billingDescription,
    amountExcludingTax: commissionTotalAmount
}
```

##### 10.3 Cycle de Facturation

| Étape | Timing | Action |
|-------|--------|--------|
| 1 | Fin de mois | Admin déclenche génération |
| 2 | J+1 | Création invoices pour chaque club |
| 3 | J+2 | Génération PDFs |
| 4 | J+3 | Envoi emails aux leaders |
| 5 | J+30 | Virement aux clubs |

---

#### 11. Affichage dans les Interfaces

##### 11.1 Dashboard Admin (donaction-admin)

**Route:** `/dons`

**Colonnes affichées:**
- Date paiement
- Donateur (nom ou raison sociale)
- Club bénéficiaire
- Projet (si applicable)
- Montant
- Contribution Klubr
- Statut paiement
- Actions (PDF, détails)

**Filtres disponibles:**
- Par club
- Par projet
- Par statut
- Par période

##### 11.2 Espace Donateur (donaction-frontend)

**Route:** `/mes-dons`

**Endpoint:** `GET /api/klub-dons/my-dons`

**Affichage:**
- Liste des dons de l'utilisateur connecté
- Lien vers Attestation PDF
- Lien vers Reçu Fiscal PDF
- Statut de chaque don

##### 11.3 Liste des Donateurs (Public)

**Route:** `/{club-slug}` ou `/{club-slug}/nos-projets/{project-slug}`

**Endpoint:** `GET /api/klubr-donateurs/byKlub`

**Affichage (si opt-in):**
- Nom/Prénom ou Raison sociale
- Montant (si `optInAffMontant = true`)
- Avatar/Logo

---

#### 12. Routes API - Référence Complète

##### 12.1 Endpoints Dons (`/api/klub-dons`)

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| GET | `/klub-dons` | find | Liste tous les dons (admin) |
| POST | `/klub-dons` | create | Crée un don |
| PUT | `/klub-dons/:id` | update | Met à jour un don |
| DELETE | `/klub-dons/:id` | delete | Supprime un don |
| GET | `/klub-dons/byKlub` | findByKlubForFront | Dons d'un club (public) |
| GET | `/klub-dons/byProject` | findByProjectForFront | Dons d'un projet |
| GET | `/klub-dons/my-dons` | findForCtxUser | Mes dons (connecté) |
| GET | `/klub-dons/received-dons` | findReceivedForCtxUser | Dons reçus (manager) |
| GET | `/klub-dons/:id/att-pdf` | attPdf | Télécharge attestation |
| GET | `/klub-dons/:id/recu-pdf` | recuPdf | Télécharge reçu fiscal |
| GET | `/klub-dons/relaunch/:id` | findOne + middleware | Accès don via relance |

##### 12.2 Endpoints Donateurs (`/api/klubr-donateurs`)

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| GET | `/klubr-donateurs` | find | Liste donateurs |
| GET | `/klubr-donateurs/:id` | findOne | Détail donateur |
| POST | `/klubr-donateurs` | create | Crée donateur |
| PUT | `/klubr-donateurs/:id` | update | Met à jour donateur |
| GET | `/klubr-donateurs/byKlub` | findByKlubForFront | Donateurs d'un club |
| GET | `/klubr-donateurs/my-last` | findLastDonateurForCtxUser | Dernier profil donateur |

##### 12.3 Endpoints Paiements (`/api/klub-don-payments`)

| Méthode | Route | Handler | Auth | Description |
|---------|-------|---------|------|-------------|
| POST | `/klub-don-payments` | create | ✅ | Crée enregistrement paiement |
| GET | `/klub-don-payments/check` | check | ✅ | Vérifie statut paiement |
| POST | `/klub-don-payments/create-payment-intent` | createPaymentIntent | ✅ | Crée PaymentIntent Stripe |
| POST | `/klub-don-payments/stripe-web-hooks` | stripeWebHooks | ❌ | Webhook Stripe |

##### 12.4 Endpoints Factures (`/api/invoices`)

| Méthode | Route | Handler | Description |
|---------|-------|---------|-------------|
| GET | `/invoices` | find | Liste factures |
| GET | `/invoices/:uuid/pdf` | generateInvoicePdf | Génère/télécharge PDF |
| POST | `/invoices/generate` | createInvoices | Génère factures du mois |

---

#### 13. Emails Envoyés

##### 13.1 Liste des Templates Brevo

| ID | Nom | Usage |
|----|-----|-------|
| 7 | DONATION_ADMIN_NOTIFICATION | Notification managers nouveau don |
| 8 | DONATION_DONOR_CONFIRMATION | Confirmation don au donateur |
| 21 | DONATION_DONOR_RELAUNCH | Relance don abandonné |
| 13 | CLUB_INVOICE | Envoi facture club |
| 27 | ADMIN_ALERT | Alerte admin (erreurs) |

##### 13.2 Déclencheurs par Email

| Email | Déclencheur | Destinataires |
|-------|-------------|---------------|
| Confirmation don | `statusPaiment` → `success` | Donateur |
| Notification don | `statusPaiment` → `success` | Manager club + auteur projet + admin |
| Relance don | Cron 10min, don abandonné | Donateur |
| Facture club | Génération facture mensuelle | Leaders club |
| Alerte admin | Erreur critique | Super admin |

##### 13.3 Données Injectées

**Commun à tous:**
- `NEXT_URL`: URL frontend
- `SHOW_SOCIAL_MEDIA_LINKS`: Afficher liens réseaux sociaux

**Confirmation don:**
```json
{
  "RECEIVER_FULLNAME": "Jean Dupont",
  "CLUB_DENOMINATION": "FC Lyon",
  "CLUB_LOGO_URL": "https://...",
  "CLUB_LOGO_ALT": "Logo FC Lyon",
  "PROJECT_TITLE": "Nouveau terrain",
  "DONATION_AMOUNT": 100,
  "DONATION_CONTRIBUTION": 10,
  "DONOR_IMAGE_URL": "https://...",
  "DONOR_FULLNAME": "Jean Dupont",
  "DONOR_ADDRESS": "1 rue du Stade",
  "DONOR_ADDRESS_2": "69000 Lyon, France"
}
```

---

#### 14. Annexes

##### 14.1 Variables d'Environnement Liées

```env
### Stripe
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

### Brevo (emails)
EMAIL_BREVO_API_KEY=xxx
EMAIL_BREVO_ENV=prod|staging

### URLs
NEXTAUTH_URL=https://donaction.fr

### Klubr contribution
KLUBR_UUID=xxx           # UUID du club Klubr
KLUBR_CONTRIBUTION_UUID=xxx  # UUID du projet contribution

### Admin
SUPER_ADMIN_EMAIL=admin@donaction.fr
```

##### 14.2 Dépendances Techniques

| Package | Version | Usage |
|---------|---------|-------|
| `stripe` | ^14.x | API Stripe |
| `sib-api-v3-sdk` | ^8.x | API Brevo |
| `pdf-lib` | ^1.x | Génération PDF |
| `date-fns` | ^3.x | Formatage dates |

##### 14.3 Points d'Attention pour la Migration Stripe Connect

| Aspect Actuel | Migration Connect |
|---------------|-------------------|
| Paiement direct compte Klubr | Paiement vers compte connecté association |
| Commission prélevée manuellement | Commission automatique via `application_fee` |
| Reçu émis par Klubr | Reçu émis par association |
| Un compte Stripe | Comptes Express par association |
| Webhooks globaux | Webhooks par compte + plateforme |

##### 14.4 Constantes Métier

```typescript
// Taux déduction fiscale
TAUX_DEDUCTION_FISCALE_PART = 0.66  // 66%
TAUX_DEDUCTION_FISCALE_PRO = 0.60   // 60%

// Limites formulaire
MONTANT_MIN = 10      // €
MONTANT_MAX = 100000  // €
CONTRIBUTION_MAX = 25 // €

// Relance
RELAUNCH_DELAY = 10   // minutes
RELAUNCH_CODE_MIN = 1000
RELAUNCH_CODE_MAX = 9999
```

---

> **Document généré le:** 2025-01-09  
> **Source:** Analyse du code source donaction-api, donaction-saas  
> **Auteur:** Claude (Anthropic)


### Stratégie de Collecte de Dons DONACTION — Stripe Connect

> **Version**: 1.0.0 | **Date**: 2025-01-09 | **Statut**: Document Stratégique Final

---

#### 1. Executive Summary

DONACTION migre d'un modèle Stripe Standard (compte unique Fond Klubr) vers **Stripe Connect Express** pour permettre aux associations sportives françaises de recevoir les dons directement sur leurs comptes connectés. Cette transformation apporte :

- **Transparence financière** : Les associations reçoivent 100% du montant intentionnel du don
- **Conformité fiscale** : Reçus émis au nom de l'association (non plus DONACTION)
- **Modèle "Donor Pays Fee"** : Le donateur prend en charge les frais Stripe (~1.5% + 0.25€) et la commission plateforme (4%)
- **Automatisation** : Prélèvement automatique via `application_fee_amount`
- **Simplification KYC** : Onboarding hébergé par Stripe (Express accounts)

L'implémentation backend est déjà réalisée (Phases 1-3). Ce document consolide la stratégie complète et identifie les ajustements nécessaires pour garantir la cohérence du système.

---

#### 2. Architecture du Flux de Paiement

##### 2.1 Parcours Donateur (5 étapes)

```mermaid
flowchart TB
    subgraph Step1["📊 Step 1: Choix du Montant"]
        A1[Sélection montant<br/>Min 10€ / Max 100k€]
        A2[Avec réduction fiscale ?<br/>Oui/Non]
        A3[Particulier ou Entreprise ?]
        A4[Projet spécifique ?<br/>ou Don au club]
        A1 --> A2 --> A3 --> A4
    end

    subgraph Step2["👤 Step 2: Informations Donateur"]
        B1{Type donateur}
        B2[Particulier<br/>Nom, Prénom, Email<br/>Date naissance, Adresse]
        B3[Entreprise<br/>Raison sociale, SIREN<br/>Forme juridique, Logo]
        B1 -->|Particulier| B2
        B1 -->|Organisme| B3
    end

    subgraph Step3["📋 Step 3: Récapitulatif"]
        C1[Montant du don]
        C2[Contribution DONACTION<br/>optionnelle max 25€]
        C3[Décomposition des frais<br/>transparent]
        C4[Total à payer]
        C5[✅ Acceptation CGU]
        C1 --> C2 --> C3 --> C4 --> C5
    end

    subgraph Step4["💳 Step 4: Paiement Stripe"]
        D1[Stripe Elements<br/>Card / Apple Pay / Google Pay]
        D2[Confirmation paiement]
        D3{Résultat}
        D4[✅ Succès]
        D5[❌ Échec + Retry]
        D1 --> D2 --> D3
        D3 -->|succeeded| D4
        D3 -->|failed| D5
    end

    subgraph Step5["🎉 Step 5: Confirmation"]
        E1[Message remerciement]
        E2[📄 Attestation PDF]
        E3[📄 Reçu fiscal PDF<br/>si applicable]
        E4[Invitation créer compte]
        E1 --> E2 --> E3 --> E4
    end

    Step1 --> Step2 --> Step3 --> Step4 --> Step5
```

##### 2.2 Calcul des Frais — Modèle "Donor Pays Fee"

###### 2.2.1 Paramètres de Configuration

Basé sur le schéma `trade_policy` existant, **avec évolutions** :

| Paramètre | Type | Valeur par défaut | Description |
|-----------|------|-------------------|-------------|
| `fee_model` | enum | `percentage_only` | Mode de calcul des frais |
| `commissionPercentage` | decimal | 6% → **4%** | Commission plateforme DONACTION |
| `fixed_amount` | decimal | 0€ | Montant fixe par transaction |
| ~~`donor_pays_fee`~~ | ~~boolean~~ | ~~false~~ | **REMPLACÉ** par les 2 champs ci-dessous |
| `donor_pays_fee_project` | boolean | **`true`** | **NOUVEAU** - Défaut pour dons à un projet |
| `donor_pays_fee_club` | boolean | **`false`** | **NOUVEAU** - Défaut pour dons au club |
| `allow_donor_fee_choice` | boolean | **`true`** | **NOUVEAU** - Autoriser le donateur à choisir |
| `stripe_connect` | boolean | `true` | Utiliser Stripe Connect |

**Évolutions clés :**
1. **Différenciation projet/club** : Deux paramètres distincts permettent de configurer des comportements différents selon le type de don
2. **Choix donateur** : Si `allow_donor_fee_choice = true`, le donateur peut modifier le comportement par défaut à l'étape 3

**Note importante** : La commission actuelle de 6% doit être revue à **4%** selon les spécifications du nouveau modèle.

###### 2.2.2 Logique de Détermination du `donorPaysFee`

```typescript
// helpers/fee-calculation-helper.ts
interface FeeContext {
    tradePolicy: TradePolicyEntity;
    isProjectDonation: boolean;       // true si don à un projet
    donorChoice: boolean | null;      // Choix explicite du donateur (null = pas de choix)
}

function determineDonorPaysFee(context: FeeContext): boolean {
    const { tradePolicy, isProjectDonation, donorChoice } = context;
    
    // 1. Si le donateur a fait un choix explicite ET que c'est autorisé
    if (donorChoice !== null && tradePolicy.allow_donor_fee_choice) {
        return donorChoice;
    }
    
    // 2. Sinon, utiliser la valeur par défaut selon le type de don
    return isProjectDonation 
        ? tradePolicy.donor_pays_fee_project 
        : tradePolicy.donor_pays_fee_club;
}
```

**Exemples de configurations :**

| Scénario | `donor_pays_fee_project` | `donor_pays_fee_club` | `allow_donor_fee_choice` | Résultat |
|----------|--------------------------|----------------------|--------------------------|----------|
| **Standard** | `true` | `false` | `true` | Projet: donateur paie (modifiable) / Club: frais déduits (modifiable) |
| **Tout transparent** | `true` | `true` | `false` | Tous les dons: donateur paie (non modifiable) |
| **Tout intégré** | `false` | `false` | `false` | Tous les dons: frais déduits (non modifiable) |
| **Flexible total** | `true` | `false` | `true` | Défauts différents, donateur choisit toujours |

###### 2.2.3 Formules de Calcul

**Variables :**
- `MONTANT_SAISI` = Montant saisi par le donateur dans le formulaire
- `CONTRIBUTION_DONACTION` = Contribution optionnelle à la plateforme (0-25€)
- `TAUX_COMMISSION` = 4% (commission DONACTION)
- `TAUX_STRIPE` = 1.5% + 0.25€ (frais Stripe standard EU)

---

**Scénario A : Donor Pays Fee = TRUE** (défaut projets)
> *"Je donne 100€, l'association reçoit 100€, je paie les frais en plus"*

```
MONTANT_DON_REEL = MONTANT_SAISI (inchangé)
Commission DONACTION = MONTANT_DON_REEL × 4%
Frais Stripe estimés = (MONTANT_DON_REEL + CONTRIBUTION) × 1.5% + 0.25€
Application Fee = Commission + Frais Stripe

TOTAL_PRELEVE = MONTANT_DON_REEL + CONTRIBUTION + Application Fee
NET_ASSOCIATION = MONTANT_DON_REEL (100%)
MONTANT_RECU_FISCAL = MONTANT_DON_REEL (100€)
```

**Exemple (Don 100€ + Contribution 10€, Donor Pays Fee = TRUE) :**

```
┌─────────────────────────────────────────────────────────────┐
│  💳 CE QUE LE DONATEUR PAIE                                 │
├─────────────────────────────────────────────────────────────┤
│  Montant du don                    : 100,00 €               │
│  Contribution DONACTION            :  10,00 €               │
│  ─────────────────────────────────────────────              │
│  Sous-total                        : 110,00 €               │
│                                                             │
│  + Frais de traitement (4% + Stripe)                        │
│    Commission plateforme (4%)      :   4,00 €               │
│    Frais bancaires (~1.5% + 0.25€) :   1,90 €               │
│  ─────────────────────────────────────────────              │
│  TOTAL DÉBITÉ                      : 115,90 €               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📊 RÉPARTITION                                             │
├─────────────────────────────────────────────────────────────┤
│  → Association reçoit     : 100,00 € (100% de votre don)    │
│  → DONACTION reçoit       :  14,00 € (contribution + comm.) │
│  → Stripe prélève         :  ~1,90 € (frais bancaires)      │
├─────────────────────────────────────────────────────────────┤
│  📄 REÇU FISCAL           : 100,00 €                        │
│     Réduction d'impôts    :  66,00 € (particulier)          │
│     Coût réel du don      :  49,90 € (115,90 - 66)          │
└─────────────────────────────────────────────────────────────┘
```

---

**Scénario B : Donor Pays Fee = FALSE** (défaut club)
> *"Je donne 100€ tout compris, l'association reçoit le net après frais"*

```
MONTANT_DON_BRUT = MONTANT_SAISI
Commission DONACTION = MONTANT_DON_BRUT × 4%
Application Fee = Commission (pas de surcharge Stripe visible)

TOTAL_PRELEVE = MONTANT_DON_BRUT + CONTRIBUTION
NET_ASSOCIATION = MONTANT_DON_BRUT - Application Fee (96%)
MONTANT_RECU_FISCAL = NET_ASSOCIATION (96€)
```

**Exemple (Don 100€ + Contribution 10€, Donor Pays Fee = FALSE) :**

```
┌─────────────────────────────────────────────────────────────┐
│  💳 CE QUE LE DONATEUR PAIE                                 │
├─────────────────────────────────────────────────────────────┤
│  Montant du don (frais inclus)     : 100,00 €               │
│  Contribution DONACTION            :  10,00 €               │
│  ─────────────────────────────────────────────              │
│  TOTAL DÉBITÉ                      : 110,00 €               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📊 RÉPARTITION                                             │
├─────────────────────────────────────────────────────────────┤
│  → Association reçoit     :  96,00 € (don - 4% commission)  │
│  → DONACTION reçoit       :  14,00 € (contribution + 4€)    │
│  → Stripe prélève         :  ~1,90 € (sur DONACTION)        │
├─────────────────────────────────────────────────────────────┤
│  📄 REÇU FISCAL           :  96,00 € (montant net reçu)     │
│     Réduction d'impôts    :  63,36 € (particulier)          │
│     Coût réel du don      :  46,64 € (110 - 63,36)          │
└─────────────────────────────────────────────────────────────┘
```

---

**⚠️ Point clé : Impact sur le Reçu Fiscal**

| Scénario | Montant reçu fiscal | Justification |
|----------|---------------------|---------------|
| **Donor Pays Fee = TRUE** | 100% du montant saisi | L'association reçoit l'intégralité |
| **Donor Pays Fee = FALSE** | Montant net (96%) | Le reçu doit refléter ce que l'association reçoit réellement |

Le reçu fiscal doit **toujours** correspondre au montant effectivement reçu par l'association pour être conforme aux exigences Cerfa.

##### 2.3 UX Formulaire — Choix Donor Pays Fee (Step 3)

###### 2.3.1 Condition d'Affichage

Le choix n'est affiché que si `trade_policy.allow_donor_fee_choice = true`. Sinon, la valeur par défaut (projet ou club) s'applique automatiquement.

###### 2.3.2 Maquette UI

```
┌─────────────────────────────────────────────────────────────────────┐
│  📋 RÉCAPITULATIF DE VOTRE DON                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Bénéficiaire : FC Lyon                                             │
│  Projet : Nouveau terrain synthétique (ou "Fonctionnement général") │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Montant de votre don                              100,00 €         │
│  Contribution à DONACTION (optionnel)        [━━━━○━━] 10,00 €      │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  💡 COMMENT SOUHAITEZ-VOUS GÉRER LES FRAIS DE TRAITEMENT ?          │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ◉ Je paie les frais en plus de mon don                      │    │
│  │   ─────────────────────────────────────────────────────     │    │
│  │   L'association reçoit 100% de votre don (100,00€)          │    │
│  │   Frais de traitement : +4,00€                              │    │
│  │   ┌───────────────────────────────────────────────────┐     │    │
│  │   │ Reçu fiscal : 100,00€ • Total débité : 114,00€   │     │    │
│  │   └───────────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ ○ J'intègre les frais au montant de mon don                 │    │
│  │   ─────────────────────────────────────────────────────     │    │
│  │   L'association reçoit votre don moins les frais (96,00€)   │    │
│  │   Frais de traitement : -4,00€ (déduits)                    │    │
│  │   ┌───────────────────────────────────────────────────┐     │    │
│  │   │ Reçu fiscal : 96,00€ • Total débité : 110,00€    │     │    │
│  │   └───────────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ℹ️  Les frais (4%) couvrent les coûts bancaires et le             │
│     fonctionnement de la plateforme DONACTION.                      │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ☑️ J'accepte les CGU                                               │
│  ☑️ Je comprends que mon don sera versé au Fonds de dotation        │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│  │ TOTAL À PAYER                                      114,00€ │    │
│  │ Réduction d'impôts (66%)                           -66,00€ │    │
│  │ COÛT RÉEL DE VOTRE DON                              48,00€ │    │
│  ═══════════════════════════════════════════════════════════════    │
│                                                                     │
│                    [ ← Retour ]      [ Payer 114,00€ → ]            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

###### 2.3.3 Implémentation Svelte (Step 3)

```svelte
<!-- step3.svelte -->
<script lang="ts">
    import { DEFAULT_VALUES, SUBSCRIPTION } from '../logic/useSponsorshipForm.svelte';
    
    // Déterminer si c'est un don projet ou club
    $: isProjectDonation = SUBSCRIPTION.project?.uuid 
        && SUBSCRIPTION.project.uuid !== SUBSCRIPTION.klubr.uuid;
    
    // Récupérer la trade policy
    $: tradePolicy = SUBSCRIPTION.klubr?.trade_policy;
    
    // Valeur par défaut selon type de don
    $: defaultDonorPaysFee = isProjectDonation 
        ? tradePolicy?.donor_pays_fee_project ?? true
        : tradePolicy?.donor_pays_fee_club ?? false;
    
    // Choix du donateur (initialisé au défaut)
    let donorPaysFee = $state(defaultDonorPaysFee);
    
    // Afficher le choix ?
    $: showFeeChoice = tradePolicy?.allow_donor_fee_choice ?? true;
    
    // Calculs dynamiques
    $: commission = DEFAULT_VALUES.montant * 0.04;
    
    $: feeBreakdown = {
        commission,
        totalWithFee: DEFAULT_VALUES.montant + DEFAULT_VALUES.contributionAKlubr + commission,
        totalWithoutFee: DEFAULT_VALUES.montant + DEFAULT_VALUES.contributionAKlubr,
        receiptWithFee: DEFAULT_VALUES.montant,
        receiptWithoutFee: DEFAULT_VALUES.montant - commission,
    };
    
    $: totalToPay = donorPaysFee 
        ? feeBreakdown.totalWithFee 
        : feeBreakdown.totalWithoutFee;
    
    $: receiptAmount = donorPaysFee 
        ? feeBreakdown.receiptWithFee 
        : feeBreakdown.receiptWithoutFee;
    
    // Exporter le choix pour le paiement
    $: DEFAULT_VALUES.donorPaysFee = donorPaysFee;
</script>

{#if showFeeChoice}
    <div class="fee-choice-section">
        <h4>💡 Comment souhaitez-vous gérer les frais de traitement ?</h4>
        
        <label class="fee-option" class:selected={donorPaysFee}>
            <input type="radio" bind:group={donorPaysFee} value={true} />
            <div class="fee-option-content">
                <strong>Je paie les frais en plus de mon don</strong>
                <p>L'association reçoit 100% de votre don ({feeBreakdown.receiptWithFee.toFixed(2)}€)</p>
                <div class="fee-summary">
                    <span>Reçu fiscal : {feeBreakdown.receiptWithFee.toFixed(2)}€</span>
                    <span>Total débité : {feeBreakdown.totalWithFee.toFixed(2)}€</span>
                </div>
            </div>
        </label>
        
        <label class="fee-option" class:selected={!donorPaysFee}>
            <input type="radio" bind:group={donorPaysFee} value={false} />
            <div class="fee-option-content">
                <strong>J'intègre les frais au montant de mon don</strong>
                <p>L'association reçoit votre don moins les frais ({feeBreakdown.receiptWithoutFee.toFixed(2)}€)</p>
                <div class="fee-summary">
                    <span>Reçu fiscal : {feeBreakdown.receiptWithoutFee.toFixed(2)}€</span>
                    <span>Total débité : {feeBreakdown.totalWithoutFee.toFixed(2)}€</span>
                </div>
            </div>
        </label>
        
        <p class="fee-info">
            ℹ️ Les frais (4%) couvrent les coûts bancaires et le fonctionnement de DONACTION.
        </p>
    </div>
{/if}
```

###### 2.3.4 Mise à jour du Schéma `klub-don`

Ajouter le champ pour stocker le choix du donateur :

```typescript
// api/klub-don/content-types/klub-don/schema.json
{
    "donor_pays_fee": {
        "type": "boolean",
        "required": false,
        "default": null  // null = utiliser la valeur par défaut de trade_policy
    }
}
```

###### 2.3.5 Implémentation Backend (Contrôleur mis à jour)

Le code dans `klub-don-payment.controller.ts` doit être mis à jour pour gérer la nouvelle logique :

```typescript
// helpers/stripe-connect-helper.ts

/**
 * Détermine si le donateur paie les frais
 * Prend en compte : choix explicite du donateur > défaut selon type de don
 */
export function determineDonorPaysFee(
    klubDon: KlubDonEntity,
    tradePolicy: TradePolicyEntity
): boolean {
    // 1. Si le donateur a fait un choix explicite (stocké dans klub_don)
    if (klubDon.donor_pays_fee !== null && klubDon.donor_pays_fee !== undefined) {
        // Vérifier que le choix est autorisé
        if (tradePolicy.allow_donor_fee_choice) {
            return klubDon.donor_pays_fee;
        }
    }
    
    // 2. Sinon, utiliser la valeur par défaut selon le type de don
    const isProjectDonation = klubDon.klub_projet !== null;
    
    return isProjectDonation 
        ? tradePolicy.donor_pays_fee_project 
        : tradePolicy.donor_pays_fee_club;
}

export function calculateApplicationFee(
    amountInCents: number,
    tradePolicy: TradePolicyEntity
): number {
    const { fee_model, commissionPercentage, fixed_amount } = tradePolicy;
    
    switch (fee_model) {
        case 'percentage_only':
            return Math.round(amountInCents * (commissionPercentage / 100));
            
        case 'fixed_only':
            return Math.round((fixed_amount || 0) * 100);
            
        case 'percentage_plus_fixed':
            const percentageFee = amountInCents * (commissionPercentage / 100);
            const fixedFee = (fixed_amount || 0) * 100;
            return Math.round(percentageFee + fixedFee);
            
        default:
            return Math.round(amountInCents * 0.04); // Fallback 4%
    }
}
```

```typescript
// klub-don-payment.controller.ts - createPaymentIntent() mis à jour
async createPaymentIntent() {
    const ctx = strapi.requestContext.get();
    try {
        const { price, metadata, idempotencyKey } = ctx.request.body;
        // Note: donorPaysFee n'est plus passé directement, on le récupère du don

        // ... validations existantes ...

        // Récupérer le don avec son choix donor_pays_fee
        const klubDon = await strapi.db.query('api::klub-don.klub-don').findOne({
            where: { uuid: metadata.donUuid },
            populate: { klub_projet: true },
        });

        // Fetch klubr with trade_policy and connected_account
        const klubr: KlubrEntity = await strapi.db.query('api::klubr.klubr').findOne({
            where: { uuid: metadata.klubUuid },
            populate: { trade_policy: true, connected_account: true },
        });

        const tradePolicy = klubr.trade_policy as TradePolicyEntity;
        const connectedAccount = klubr.connected_account as ConnectedAccountEntity;

        // Déterminer le donor_pays_fee effectif
        const actualDonorPaysFee = determineDonorPaysFee(klubDon, tradePolicy);

        // Calculate base amount in cents
        let amountInCents = Number(price) * 100;
        let applicationFeeAmount = 0;

        if (tradePolicy?.stripe_connect && connectedAccount?.charges_enabled) {
            // Calculate application fee
            applicationFeeAmount = calculateApplicationFee(amountInCents, tradePolicy);

            // If donor pays fee, add it to total amount
            if (actualDonorPaysFee) {
                amountInCents += applicationFeeAmount;
            }

            console.log('\n💳 ════════════════════════════════════════');
            console.log('💳 CRÉATION PAYMENT INTENT (STRIPE CONNECT)');
            console.log(`💳 Montant base: ${price}€`);
            console.log(`💳 Type don: ${klubDon.klub_projet ? 'Projet' : 'Club'}`);
            console.log(`💳 Donor pays fee: ${actualDonorPaysFee}`);
            console.log(`💳 Application fee: ${applicationFeeAmount / 100}€`);
            console.log(`💳 Total prélevé: ${amountInCents / 100}€`);
            console.log('💳 ════════════════════════════════════════\n');

            // Create PaymentIntent
            const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
                amount: amountInCents,
                currency: 'eur',
                metadata: {
                    ...metadata,
                    payment_method: 'stripe_connect',
                    donor_pays_fee: String(actualDonorPaysFee),
                    is_project_donation: String(!!klubDon.klub_projet),
                },
                on_behalf_of: connectedAccount.stripe_account_id,
                transfer_data: {
                    destination: connectedAccount.stripe_account_id,
                },
                application_fee_amount: applicationFeeAmount,
            };

            const paymentIntent = await stripe.paymentIntents.create(
                paymentIntentParams,
                { idempotencyKey: idempotencyKey || undefined }
            );

            // ... reste du code ...
        }
    }
}
```

##### 2.4 Organisation des Champs `trade_policy`

Le champ `stripe_connect` détermine deux modes de fonctionnement radicalement différents :

| Mode | `stripe_connect` | Flux Financier | Facturation |
|------|------------------|----------------|-------------|
| **Stripe Connect** | `true` | Paiement direct vers association, frais prélevés automatiquement via `application_fee_amount` | **Aucune** - Relevé de frais informatif uniquement |
| **Stripe Classic (Legacy)** | `false` | Paiement vers compte unique DONACTION, redistribution mensuelle | **Facturation mensuelle** aux associations |

###### 2.4.1 Champs COMMUNS (les deux modes)

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `uuid` | UUID | auto | Identifiant unique |
| `tradePolicyLabel` | string | - | Nom de la politique (ex: "Standard", "Partenaire", "Premium") |
| `defaultTradePolicy` | boolean | `false` | Politique par défaut pour les nouveaux clubs |
| `allowKlubrContribution` | boolean | `true` | Autoriser la contribution optionnelle à DONACTION (0-25€) |
| `stripe_connect` | boolean | `true` | **Switch principal** : `true` = Connect, `false` = Classic |

###### 2.4.2 Champs STRIPE CONNECT (`stripe_connect = true`)

Ces champs gèrent le prélèvement automatique des frais via Stripe.

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `fee_model` | enum | `percentage_only` | Mode de calcul : `percentage_only`, `fixed_only`, `percentage_plus_fixed` |
| `commissionPercentage` | decimal | 4 | % de commission DONACTION (utilisé si fee_model inclut percentage) |
| `fixed_amount` | decimal | 0 | Montant fixe en € (utilisé si fee_model inclut fixed) |
| `donor_pays_fee_project` | boolean | `true` | **NOUVEAU** - Défaut pour dons projet : donateur paie les frais |
| `donor_pays_fee_club` | boolean | `false` | **NOUVEAU** - Défaut pour dons club : frais déduits du don |
| `allow_donor_fee_choice` | boolean | `true` | **NOUVEAU** - Autoriser le donateur à modifier le défaut |

**Logique Stripe Connect :**
- Les frais sont calculés selon `fee_model` + `commissionPercentage` + `fixed_amount`
- Le mode `donor_pays_fee` est déterminé par : choix donateur > défaut projet/club
- Pas de facturation : Stripe prélève automatiquement via `application_fee_amount`
- Relevé de frais mensuel **informatif** (pas une facture)

###### 2.4.3 Champs STRIPE CLASSIC / LEGACY (`stripe_connect = false`)

Ces champs gèrent la facturation mensuelle traditionnelle.

| Champ | Type | Défaut | Description |
|-------|------|--------|-------------|
| `noBilling` | boolean | `false` | Si `true`, pas de facturation (club exonéré) |
| `commissionPercentage` | decimal | 6 | % de commission sur les dons (pour facturation) |
| `VATPercentage` | decimal | 20 | % TVA appliquée sur la commission |
| `reference` | string | - | Référence affichée sur la facture |
| `billingDescription` | string | - | Description ligne de facturation |
| `perDonationCost` | decimal | 0 | Coût fixe par don (en plus du %) |
| `klubDonationReference` | string | - | Référence pour la ligne contribution Klubr |
| `klubDonationDescription` | string | - | Description ligne contribution Klubr |
| `klubDonationPercentage` | decimal | 0 | % spécifique pour contributions Klubr |

**Logique Stripe Classic :**
- DONACTION collecte tous les paiements sur son compte unique
- Facture mensuelle générée pour chaque club
- Redistribution après paiement de la facture

###### 2.4.4 Champ Partagé avec Usage Différent

| Champ | Stripe Connect | Stripe Classic |
|-------|----------------|----------------|
| `commissionPercentage` | Utilisé pour `application_fee_amount` (prélèvement auto, défaut 4%) | Utilisé pour calcul facture mensuelle (défaut 6%) |

###### 2.4.5 Schéma Visuel

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        TRADE POLICY SCHEMA                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    COMMUNS (tous modes)                         │    │
│  ├─────────────────────────────────────────────────────────────────┤    │
│  │  uuid, tradePolicyLabel, defaultTradePolicy,                    │    │
│  │  allowKlubrContribution, stripe_connect                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                              │                                          │
│               ┌──────────────┴──────────────┐                           │
│               ▼                              ▼                          │
│  ┌─────────────────────────┐    ┌─────────────────────────────────┐    │
│  │   STRIPE CONNECT        │    │      STRIPE CLASSIC (Legacy)    │    │
│  │   stripe_connect=true   │    │      stripe_connect=false       │    │
│  ├─────────────────────────┤    ├─────────────────────────────────┤    │
│  │  fee_model              │    │  noBilling                      │    │
│  │  commissionPercentage*  │    │  commissionPercentage*          │    │
│  │  fixed_amount           │    │  VATPercentage                  │    │
│  │  donor_pays_fee_project │    │  reference                      │    │
│  │  donor_pays_fee_club    │    │  billingDescription             │    │
│  │  allow_donor_fee_choice │    │  perDonationCost                │    │
│  │                         │    │  klubDonationReference          │    │
│  │                         │    │  klubDonationDescription        │    │
│  │                         │    │  klubDonationPercentage         │    │
│  └─────────────────────────┘    └─────────────────────────────────┘    │
│                                                                         │
│  * commissionPercentage : usage différent selon le mode                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

###### 2.4.6 Recommandations d'Implémentation

1. **Conserver tous les champs legacy** pour la rétrocompatibilité (clubs non migrés vers Connect)
2. **Supprimer l'ancien `donor_pays_fee`** unique et le remplacer par les 3 nouveaux champs
3. **Dashboard Admin** : Masquer dynamiquement les champs non pertinents selon `stripe_connect`
4. **Valeur par défaut** : Nouveaux clubs créés avec `stripe_connect = true`
5. **Migration** : Script pour migrer les `trade_policy` existantes (voir section 9.5)

---

##### 2.5 Configuration Stripe Connect

###### 2.5.1 Type de Charge : Destination Charges

**Choix retenu : Destination Charges** (confirmé par l'implémentation actuelle)

| Type | Avantages | Inconvénients |
|------|-----------|---------------|
| **Direct Charges** | Association gère tout | Complexe pour non-tech |
| **Destination Charges** ✅ | Simple, DONACTION contrôle | Moins de flexibilité |
| **Separate Charges & Transfers** | Contrôle total | Plus complexe à implémenter |

**Justification du choix :**
1. DONACTION reste le "merchant of record" (responsable légal)
2. L'`application_fee_amount` est prélevé automatiquement
3. Stripe gère les soldes négatifs (paramètre `controller.losses.payments`)
4. Simplification du reporting et de la réconciliation

###### 2.5.2 Paramètres de l'appel API PaymentIntent.create()

```typescript
// Implémentation confirmée dans klub-don-payment.controller.ts
const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: amountInCents, // Montant total (avec frais si donorPaysFee)
    currency: 'eur',
    metadata: {
        donUuid: metadata.donUuid,
        klubUuid: metadata.klubUuid,
        projectUuid: metadata.projectUuid || null,
        donorUuid: metadata.donorUuid,
        payment_method: 'stripe_connect',
        donor_pays_fee: String(actualDonorPaysFee),
    },
    // Destination Charges parameters
    on_behalf_of: connectedAccount.stripe_account_id,
    transfer_data: {
        destination: connectedAccount.stripe_account_id,
    },
    application_fee_amount: applicationFeeAmount,
};

const paymentIntent = await stripe.paymentIntents.create(
    paymentIntentParams,
    {
        idempotencyKey: idempotencyKey || undefined,
    }
);
```

###### 2.5.3 Gestion des Soldes Négatifs

Lors de la création du compte Express, configurer :

```typescript
// Lors de account.create
const account = await stripe.accounts.create({
    type: 'express',
    country: 'FR',
    capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
    },
    business_type: 'non_profit', // ou 'company' selon le cas
    settings: {
        payouts: {
            schedule: {
                interval: 'manual', // ou 'weekly'
            },
        },
    },
    controller: {
        losses: {
            payments: 'stripe', // Stripe supporte les pertes
        },
        fees: {
            payer: 'application', // DONACTION paie les frais Stripe
        },
        stripe_dashboard: {
            type: 'express',
        },
    },
});
```

---

#### 3. Webhooks et Idempotence

##### 3.1 Matrice des Événements Webhook

###### 3.1.1 Événements Compte Connecté

| Événement | Source | Action Backend | Criticité | Retry |
|-----------|--------|----------------|-----------|-------|
| `account.updated` | Connect | Sync statut KYC, `charges_enabled`, `payouts_enabled` | **Haute** | Oui |
| `account.application.deauthorized` | Connect | Désactiver compte, notifier admin | **Haute** | Oui |
| `capability.updated` | Connect | Mettre à jour `capabilities` JSON | Moyenne | Oui |
| `person.created` | Connect | Log audit (KYC progression) | Basse | Non |
| `person.updated` | Connect | Log audit | Basse | Non |

###### 3.1.2 Événements Paiement

| Événement | Source | Action Backend | Criticité | Retry |
|-----------|--------|----------------|-----------|-------|
| `payment_intent.created` | Plateforme | Update `klub_don_payment` status → `pending` | Moyenne | Oui |
| `payment_intent.succeeded` | Plateforme | **CRITIQUE** : Update status → `success`, générer PDFs, envoyer emails | **Critique** | Oui |
| `payment_intent.payment_failed` | Plateforme | Update status → `error`, stocker `error_code` | **Haute** | Oui |
| `charge.refunded` | Plateforme | **CRITIQUE** : Workflow remboursement exceptionnel | **Critique** | Oui |
| `charge.dispute.created` | Plateforme | Alerter admin, geler remboursement | **Haute** | Oui |
| `transfer.created` | Connect | Log transfert vers association | Moyenne | Non |
| `payout.paid` | Connect | Log virement bancaire association | Moyenne | Non |
| `payout.failed` | Connect | Alerter admin + association | **Haute** | Oui |

##### 3.2 Stratégie d'Idempotence

###### 3.2.1 Format de la Clé d'Idempotence

**Pattern recommandé :**

```
{donUuid}-{timestamp}-{action}
```

**Exemples :**
- `abc123-1704812400000-create` (création initiale)
- `abc123-1704812400000-retry-1` (première tentative retry)
- `abc123-1704812400000-retry-2` (deuxième tentative retry)

###### 3.2.2 Implémentation

```typescript
// helpers/idempotency-helper.ts

export function generateIdempotencyKey(
    donUuid: string,
    action: 'create' | 'retry' = 'create',
    retryCount: number = 0
): string {
    const timestamp = Date.now();
    const base = `${donUuid}-${timestamp}-${action}`;
    return retryCount > 0 ? `${base}-${retryCount}` : base;
}

export function isValidIdempotencyKey(key: string): boolean {
    // Format: uuid-timestamp-action(-retryCount)?
    const pattern = /^[a-f0-9-]{36}-\d{13}-(create|retry)(-\d+)?$/;
    return pattern.test(key);
}

export async function findExistingPaymentByIdempotencyKey(
    idempotencyKey: string
): Promise<KlubDonPaymentEntity | null> {
    return await strapi.db
        .query('api::klub-don-payment.klub-don-payment')
        .findOne({
            where: { idempotency_key: idempotencyKey },
            select: ['client_secret', 'status', 'intent_id'],
        });
}
```

###### 3.2.3 Durée de Validité

- **PaymentIntent** : 24 heures (durée standard Stripe)
- **Réutilisation du `client_secret`** : Autorisée si PaymentIntent non expiré
- **Clé d'idempotence Stripe** : 24 heures (limite Stripe)

##### 3.3 Schéma de la Table `webhook_logs`

```typescript
// Nouveau content-type à créer: api::webhook-log.webhook-log

// schema.json
{
  "kind": "collectionType",
  "collectionName": "webhook_logs",
  "info": {
    "singularName": "webhook-log",
    "pluralName": "webhook-logs",
    "displayName": "Webhook Log"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "event_id": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "event_type": {
      "type": "string",
      "required": true
    },
    "source": {
      "type": "enumeration",
      "enum": ["platform", "connect"],
      "required": true
    },
    "stripe_account_id": {
      "type": "string"
    },
    "payload": {
      "type": "json",
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["received", "processing", "processed", "failed", "ignored"],
      "default": "received"
    },
    "processing_error": {
      "type": "text"
    },
    "retry_count": {
      "type": "integer",
      "default": 0
    },
    "processed_at": {
      "type": "datetime"
    },
    "related_don": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::klub-don.klub-don"
    },
    "related_klubr": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::klubr.klubr"
    }
  }
}
```

**Index recommandés :**
```sql
CREATE INDEX idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at);
```

##### 3.4 Endpoint Webhook Connect

Créer un nouvel endpoint dédié aux webhooks des comptes connectés :

```typescript
// api/stripe-connect/routes/stripe-connect-custom.ts
export default {
    routes: [
        {
            method: 'POST',
            path: '/stripe-connect/webhook',
            handler: 'stripe-connect.handleWebhook',
            config: {
                auth: false,
            },
        },
    ],
};

// api/stripe-connect/controllers/stripe-connect.ts
async handleWebhook() {
    const ctx = strapi.requestContext.get();
    const sig = ctx.request.headers['stripe-signature'];
    
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            ctx.request.body[Symbol.for('unparsedBody')],
            sig,
            process.env.STRIPE_WEBHOOK_SECRET_CONNECT
        );
    } catch (err) {
        console.error('⚠️ Webhook signature verification failed:', err.message);
        return ctx.badRequest(`Webhook Error: ${err.message}`);
    }

    // Log webhook
    await strapi.documents('api::webhook-log.webhook-log').create({
        data: {
            event_id: event.id,
            event_type: event.type,
            source: 'connect',
            stripe_account_id: event.account,
            payload: event.data.object,
            status: 'received',
        },
    });

    // Handle event
    switch (event.type) {
        case 'account.updated':
            await this.handleAccountUpdated(event);
            break;
        case 'account.application.deauthorized':
            await this.handleAccountDeauthorized(event);
            break;
        // ... autres événements
    }

    ctx.send({ received: true });
}
```

---

#### 4. Onboarding Association

##### 4.1 Parcours en 3 Phases

```mermaid
flowchart TB
    subgraph PhaseA["📋 Phase A: Informations Association"]
        A1[Inscription initiale<br/>Next.js Frontend]
        A2[Création User + Klubr<br/>+ Connected Account]
        A3[Email avec lien activation]
        A4[Connexion Dashboard Angular]
        A5[Compléter infos obligatoires]
        A6[requiredFieldsCompletion = 100%]
        A1 --> A2 --> A3 --> A4 --> A5 --> A6
    end

    subgraph PhaseB["📁 Phase B: Documents Juridiques"]
        B1[Upload statuts association]
        B2[Upload récépissé préfecture]
        B3[Upload RIB association]
        B4[Upload signature responsable]
        B5[Validation manuelle DONACTION]
        B6[requiredDocsValidatedCompletion = 100%]
        B1 --> B2 --> B3 --> B4 --> B5 --> B6
    end

    subgraph PhaseC["💳 Phase C: Activation Stripe"]
        C1[Clic 'Activer compte paiement']
        C2[Génération lien onboarding Stripe]
        C3[Onboarding hébergé Stripe<br/>KYC, coordonnées bancaires]
        C4[Webhook account.updated]
        C5{charges_enabled?}
        C6[✅ COMPTE ACTIF<br/>Collecte possible]
        C7[⚠️ KYC incomplet<br/>Relancer onboarding]
        C1 --> C2 --> C3 --> C4 --> C5
        C5 -->|true| C6
        C5 -->|false| C7 --> C2
    end

    PhaseA --> PhaseB --> PhaseC
```

##### 4.2 Phase A — Informations Association

###### 4.2.1 Champs Requis pour `requiredFieldsCompletion = 100%`

| Champ | Type | Obligatoire | Validation |
|-------|------|-------------|------------|
| `denomination` | string | ✅ | Min 3 caractères |
| `acronyme` | string | ❌ | - |
| `adresse` | string | ✅ | Adresse complète |
| `codePostal` | string | ✅ | Format FR (5 chiffres) |
| `ville` | string | ✅ | - |
| `pays` | string | ✅ | Default: France |
| `numeroRNA` | string | ✅ | Format W + 9 chiffres |
| `SIREN` | string | ✅ | 9 chiffres, validé via API |
| `legalStatus` | enum | ✅ | Association loi 1901, etc. |
| `sportType` | relation | ✅ | Type de sport |
| `email` | email | ✅ | Email de contact |
| `telephone` | string | ✅ | Format FR |
| `objetAssociation` | text | ✅ | Min 50 caractères |
| `logo` | media | ✅ | Image (PNG, JPG) |

###### 4.2.2 Calcul du Pourcentage de Complétion

```typescript
// klubr.service.ts
function calculateRequiredFieldsCompletion(klubr: KlubrEntity): number {
    const requiredFields = [
        'denomination',
        'adresse',
        'codePostal',
        'ville',
        'pays',
        'numeroRNA',
        'SIREN',
        'legalStatus',
        'sportType',
        'email',
        'telephone',
        'objetAssociation',
        'logo',
    ];
    
    const filledFields = requiredFields.filter(field => {
        const value = klubr[field];
        return value !== null && value !== undefined && value !== '';
    });
    
    return Math.round((filledFields.length / requiredFields.length) * 100);
}
```

##### 4.3 Phase B — Documents Juridiques

###### 4.3.1 Liste des Documents Requis

| Document | Champ | Format | Validation |
|----------|-------|--------|------------|
| Statuts à jour | `statutsDocument` | PDF | Signature + date |
| Récépissé préfecture | `recepisseDocument` | PDF | Numéro RNA lisible |
| RIB association | `ribDocument` | PDF/Image | IBAN FR valide |
| **Signature responsable** | `managerSignature` | PNG/JPG | **NOUVEAU** - Pour reçu fiscal |
| PV dernière AG | `pvAgDocument` | PDF | Date < 2 ans |

###### 4.3.2 Nouveau Champ : `managerSignature`

```typescript
// klubr/content-types/klubr/schema.json - À AJOUTER
{
    "managerSignature": {
        "type": "media",
        "allowedTypes": ["images"],
        "required": false
    }
}
```

**Spécifications :**
- Format : PNG ou JPG avec fond transparent recommandé
- Taille : Max 500x200 pixels
- Usage : Incrustation sur le reçu fiscal Cerfa

###### 4.3.3 Processus de Validation Manuelle

1. Association uploade les documents
2. Notification email à l'admin DONACTION
3. Admin vérifie dans `/admin/klub/listing`
4. Actions possibles :
   - ✅ Valider → `requiredDocsValidatedCompletion = 100%`
   - ❌ Rejeter → Email avec motif + demande nouvelle version
   - ⏳ En attente → Demande de complément

##### 4.4 Phase C — Activation Compte Stripe

###### 4.4.1 Création du Compte Express

```typescript
// api/stripe-connect/services/stripe-connect.ts
async createConnectedAccount(klubr: KlubrEntity): Promise<ConnectedAccountEntity> {
    // Vérifier pré-requis
    if (klubr.requiredFieldsCompletion < 100) {
        throw new Error('Informations association incomplètes');
    }

    // Créer compte Stripe Express
    const account = await stripe.accounts.create({
        type: 'express',
        country: 'FR',
        email: klubr.email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
        business_type: 'non_profit',
        business_profile: {
            name: klubr.denomination,
            url: `https://donaction.fr/${klubr.slug}`,
            mcc: '8398', // Charitable organizations
        },
        metadata: {
            klubr_uuid: klubr.uuid,
            klubr_siren: klubr.SIREN,
        },
    });

    // Créer entrée connected_account
    const connectedAccount = await strapi.documents('api::connected-account.connected-account').create({
        data: {
            stripe_account_id: account.id,
            klubr: klubr.id,
            account_status: 'pending',
            verification_status: 'unverified',
            onboarding_completed: false,
            charges_enabled: false,
            payouts_enabled: false,
            country: 'FR',
            business_type: 'non_profit',
            created_at_stripe: new Date(account.created * 1000),
            last_sync: new Date(),
        },
    });

    return connectedAccount;
}
```

###### 4.4.2 Génération du Lien d'Onboarding

```typescript
// api/stripe-connect/controllers/stripe-connect.ts
async generateOnboardingLink() {
    const ctx = strapi.requestContext.get();
    const { klubrId } = ctx.params;

    const klubr = await strapi.documents('api::klubr.klubr').findOne({
        documentId: klubrId,
        populate: ['connected_account'],
    });

    if (!klubr.connected_account) {
        return ctx.badRequest('Compte Stripe non créé');
    }

    const accountLink = await stripe.accountLinks.create({
        account: klubr.connected_account.stripe_account_id,
        refresh_url: `${process.env.ADMIN_URL}/payment-setup?refresh=true`,
        return_url: `${process.env.ADMIN_URL}/payment-setup?success=true`,
        type: 'account_onboarding',
    });

    return { url: accountLink.url };
}
```

##### 4.5 Checklist d'Activation Complète

**Conditions pour activer la collecte de dons :**

```typescript
function canAcceptDonations(klubr: KlubrEntity): {
    eligible: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];

    // Vérifications klubr
    if (klubr.requiredFieldsCompletion < 100) {
        reasons.push(`Informations incomplètes (${klubr.requiredFieldsCompletion}%)`);
    }
    if (klubr.requiredDocsValidatedCompletion < 100) {
        reasons.push(`Documents non validés (${klubr.requiredDocsValidatedCompletion}%)`);
    }
    if (!klubr.donationEligible) {
        reasons.push('Collecte de dons non activée par admin');
    }
    if (klubr.status !== 'published') {
        reasons.push('Profil non publié');
    }

    // Vérifications Stripe Connect
    const connectedAccount = klubr.connected_account;
    if (!connectedAccount) {
        reasons.push('Compte Stripe non créé');
    } else {
        if (!connectedAccount.charges_enabled) {
            reasons.push('Paiements non activés sur Stripe');
        }
        if (connectedAccount.account_status === 'restricted') {
            reasons.push('Compte Stripe restreint');
        }
        if (connectedAccount.account_status === 'disabled') {
            reasons.push('Compte Stripe désactivé');
        }
    }

    return {
        eligible: reasons.length === 0,
        reasons,
    };
}
```

##### 4.6 Widget de Progression Dashboard

**Composant Angular pour `/dashboard`** :

```typescript
// admin/routes/dashboard/ui/completion-widget.component.ts
interface CompletionStatus {
    klubInfo: {
        percentage: number;
        missingFields: string[];
    };
    documents: {
        percentage: number;
        pendingDocs: string[];
    };
    stripe: {
        status: 'not_started' | 'pending' | 'active' | 'restricted';
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
    };
    overall: {
        canAcceptDonations: boolean;
        nextAction: string;
    };
}
```

**Affichage :**
```
┌─────────────────────────────────────────────────────────┐
│  📊 Statut d'Activation                                 │
├─────────────────────────────────────────────────────────┤
│  Informations Klub    ████████████░░░░  75%   [→]       │
│  Documents            ██████████░░░░░░  60%   [→]       │
│  Compte Paiement      ⏳ En attente KYC       [→]       │
├─────────────────────────────────────────────────────────┤
│  ⚠️ Action requise: Compléter les informations          │
│     [Compléter mon profil]                              │
└─────────────────────────────────────────────────────────┘
```

---

#### 5. Documents Fiscaux

##### 5.1 Reçu Fiscal Cerfa

###### 5.1.1 Changements Majeurs

| Aspect | Ancien Modèle | Nouveau Modèle |
|--------|---------------|----------------|
| **Émetteur** | DONACTION (Fond Klubr) | Association bénéficiaire |
| **Signature** | Signature DONACTION | `managerSignature` de l'association |
| **Montant** | Montant brut | Montant net reçu (= intentionnel si donorPaysFee) |
| **Numéro SIREN** | SIREN DONACTION | SIREN Association |

###### 5.1.2 Structure du Reçu

```
┌─────────────────────────────────────────────────────────────────┐
│                    REÇU AU TITRE DES DONS                       │
│            À UN ORGANISME D'INTÉRÊT GÉNÉRAL                     │
│                    (Article 200-1 du CGI)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  BÉNÉFICIAIRE DU DON                                            │
│  ─────────────────────                                          │
│  Nom: [klubr.denomination]                                      │
│  Adresse: [klubr.adresse], [klubr.codePostal] [klubr.ville]     │
│  SIREN: [klubr.SIREN]                                           │
│  Objet: [klubr.objetAssociation]                                │
│                                                                 │
│  DONATEUR                                                       │
│  ────────                                                       │
│  [Si particulier]                                               │
│  Civilité: [donateur.civilite]                                  │
│  Nom: [donateur.nom] [donateur.prenom]                          │
│  Adresse: [donateur.adresse], [donateur.cp] [donateur.ville]    │
│                                                                 │
│  [Si organisme]                                                 │
│  Raison sociale: [donateur.raisonSocial]                        │
│  SIREN: [donateur.SIREN]                                        │
│  Adresse: [donateur.adresse], [donateur.cp] [donateur.ville]    │
│                                                                 │
│  DON                                                            │
│  ───                                                            │
│  Date: [don.datePaiment]                                        │
│  Montant: [montant_en_chiffres] € ([montant_en_lettres] euros)  │
│  Mode de versement: Paiement en ligne (carte bancaire)          │
│  Nature du don: Numéraire                                       │
│                                                                 │
│  ═══════════════════════════════════════════════════════════    │
│  Le bénéficiaire certifie que le don n'ouvre droit à aucune     │
│  contrepartie directe ou indirecte au profit du donateur.       │
│                                                                 │
│  Signature du responsable:                                      │
│  [Image: klubr.managerSignature]                                │
│                                                                 │
│  Numéro d'ordre: R-[attestationNumber]                          │
│  Date d'émission: [date_generation]                             │
├─────────────────────────────────────────────────────────────────┤
│  [Si particulier] Article 200 du CGI - Réduction 66%            │
│  [Si organisme]   Article 238 bis du CGI - Réduction 60%        │
└─────────────────────────────────────────────────────────────────┘
```

###### 5.1.3 Calcul du Montant sur le Reçu

```typescript
function getReceiptAmount(don: KlubDonEntity, tradePolicy: TradePolicyEntity): number {
    // Si Donor Pays Fee : le montant du reçu = montant intentionnel
    if (tradePolicy.donor_pays_fee) {
        return don.montant; // Montant original sans frais
    }
    
    // Si frais déduits : montant = ce que l'association reçoit vraiment
    const applicationFee = calculateApplicationFee(don.montant * 100, tradePolicy) / 100;
    return don.montant - applicationFee;
}
```

**Important :** Avec le modèle "Donor Pays Fee", le reçu fiscal correspond exactement au montant que le donateur a voulu donner, ce qui est plus transparent et cohérent.

###### 5.1.4 Génération PDF

```typescript
// helpers/klubrPDF/generateInvoice/index.ts - À MODIFIER
async function generateRecuFiscal(don: KlubDonEntity): Promise<string> {
    const klubr = don.klubr;
    const donateur = don.klubDonateur;
    const tradePolicy = klubr.trade_policy;
    
    // Charger le template approprié
    const templatePath = donateur.donateurType === 'Organisme'
        ? 'templates/recu-pro-template.pdf'
        : 'templates/recu-template.pdf';
    
    // Calculer le montant à afficher
    const montantRecu = getReceiptAmount(don, tradePolicy);
    
    // Charger la signature du responsable
    const signatureImage = await loadImage(klubr.managerSignature?.url);
    
    // Générer le PDF avec les données de l'ASSOCIATION (pas DONACTION)
    const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
    const form = pdfDoc.getForm();
    
    // Données émetteur = Association
    form.getTextField('emetteur_nom').setText(klubr.denomination);
    form.getTextField('emetteur_adresse').setText(
        `${klubr.adresse}, ${klubr.codePostal} ${klubr.ville}`
    );
    form.getTextField('emetteur_siren').setText(klubr.SIREN);
    form.getTextField('emetteur_objet').setText(klubr.objetAssociation);
    
    // Données donateur
    if (donateur.donateurType === 'Organisme') {
        form.getTextField('donateur_raison').setText(donateur.raisonSocial);
        form.getTextField('donateur_siren').setText(donateur.SIREN);
    } else {
        form.getTextField('donateur_nom').setText(
            `${donateur.civilite} ${donateur.prenom} ${donateur.nom}`
        );
    }
    form.getTextField('donateur_adresse').setText(
        `${donateur.adresse}, ${donateur.cp} ${donateur.ville}`
    );
    
    // Montant
    form.getTextField('montant_chiffres').setText(`${montantRecu.toFixed(2)} €`);
    form.getTextField('montant_lettres').setText(numberToWords(montantRecu));
    form.getTextField('date_don').setText(formatDate(don.datePaiment));
    
    // Signature
    if (signatureImage) {
        const signaturePage = pdfDoc.getPages()[0];
        signaturePage.drawImage(signatureImage, {
            x: 350,
            y: 100,
            width: 150,
            height: 60,
        });
    }
    
    // Numéro et date d'émission
    form.getTextField('numero_recu').setText(`R-${don.attestationNumber}`);
    form.getTextField('date_emission').setText(formatDate(new Date()));
    
    // Sauvegarder
    const pdfBytes = await pdfDoc.save();
    const outputPath = `private-pdf/recus/R-${don.attestationNumber}.pdf`;
    fs.writeFileSync(outputPath, pdfBytes);
    
    return outputPath;
}
```

##### 5.2 Workflow Remboursement Exceptionnel

###### 5.2.1 Principe Fondamental

> **Un reçu fiscal émis est IMMUABLE.** En cas de remboursement, on ne modifie jamais le reçu original — on crée une attestation d'annulation séparée.

###### 5.2.2 Cas Déclencheurs

| Cas | Priorité | Workflow Spécifique |
|-----|----------|---------------------|
| **Fraude avérée** | P0 | Signalement TRACFIN si > 10k€, blocage donateur |
| **Litige juridique** | P1 | Gel jusqu'à décision, conservation preuves |
| **Erreur de paiement** | P2 | Fast-track si reçu non généré |
| **Demande donateur** | P3 | Circuit standard avec déclaration |
| **Rétractation 14j** | P3 | Simplifié si reçu non généré |

###### 5.2.3 Diagramme du Workflow

```mermaid
sequenceDiagram
    participant D as Donateur
    participant S as Support
    participant AL as Association Leader
    participant Admin as Dashboard Admin
    participant Sys as Système
    participant Stripe as Stripe
    participant Tax as Fisc (si applicable)

    Note over D,Tax: Phase 1: Demande de Remboursement
    D->>S: Email demande remboursement
    S->>AL: Transmission demande
    AL->>Admin: Créer requête /refunds
    Admin->>Sys: Submit (type, raison, montant)
    Sys->>Sys: Status: awaiting_declaration
    Sys->>D: Email: "Merci de signer la déclaration"

    Note over D,Tax: Phase 2: Déclaration Donateur
    D->>D: Télécharge, signe PDF
    D->>S: Renvoie déclaration signée
    S->>AL: Transmet
    AL->>Admin: Upload déclaration
    Admin->>Sys: Stocke fichier
    Sys->>Sys: Status: pending_approval
    Sys->>AL: Notification: "Prêt pour approbation"

    Note over D,Tax: Phase 3: Approbation
    AL->>Admin: Revue demande complète
    
    alt Approuvé
        AL->>Admin: Clic "Approuver"
        Admin->>Sys: Approbation
        Sys->>Sys: Crée ReceiptCancellation
        Sys->>Sys: Génère attestation annulation PDF
        Sys->>Stripe: stripe.refunds.create()
        Stripe-->>Sys: Refund ID
        Sys->>Sys: Update don.refund_status = completed
        Sys->>Sys: Log FinancialAuditLog
        Sys->>D: Email: "Remboursement effectué" + PDF
        Sys->>AL: Email: "Remboursement traité"
        
        alt Montant > Seuil fiscal
            Sys->>Tax: Notification autorité fiscale
        end
    else Refusé
        AL->>Admin: Clic "Refuser" + motif
        Admin->>Sys: Refus enregistré
        Sys->>D: Email: "Remboursement refusé" + motif
    end
```

###### 5.2.4 Structure de l'Attestation d'Annulation

```
┌─────────────────────────────────────────────────────────────────┐
│            ATTESTATION D'ANNULATION DE REÇU FISCAL              │
│                                                                 │
│  Numéro du reçu annulé: R-[attestationNumber]                   │
│  Date d'émission du reçu: [date_recu_original]                  │
│                                                                 │
│  MOTIF DE L'ANNULATION                                          │
│  ─────────────────────                                          │
│  [X] Demande du donateur                                        │
│  [ ] Erreur de paiement                                         │
│  [ ] Fraude détectée                                            │
│  [ ] Litige juridique                                           │
│                                                                 │
│  REMBOURSEMENT                                                  │
│  ────────────                                                   │
│  Montant remboursé: [montant] €                                 │
│  Date du remboursement: [date_remboursement]                    │
│  Référence Stripe: [refund_id]                                  │
│                                                                 │
│  DÉCLARATION DU DONATEUR                                        │
│  ───────────────────────                                        │
│  Le donateur soussigné déclare:                                 │
│  - Ne pas avoir utilisé le reçu annulé pour déduction fiscale   │
│  - S'engager à ne pas utiliser le reçu annulé ultérieurement    │
│                                                                 │
│  Document de déclaration signé: [Référence pièce jointe]        │
│                                                                 │
│  ÉMETTEUR                                                       │
│  ────────                                                       │
│  [klubr.denomination]                                           │
│  SIREN: [klubr.SIREN]                                           │
│                                                                 │
│  Fait le [date], par [admin_name]                               │
│  Numéro d'annulation: ANN-[attestationNumber]                   │
└─────────────────────────────────────────────────────────────────┘
```

###### 5.2.5 Table `receipt_cancellations` (Mise à jour)

```typescript
// Schéma existant à compléter
{
    "attributes": {
        // Existants
        "original_receipt_number": { "type": "string", "required": true },
        "cancellation_reason": {
            "type": "enumeration",
            "enum": ["donor_request", "payment_error", "fraud", "legal_dispute"],
            "required": true
        },
        "donor_declaration_path": { "type": "string" },
        "cancellation_attestation_path": { "type": "string" },
        "refund_amount": { "type": "decimal", "required": true },
        "stripe_refund_id": { "type": "string" },
        
        // À AJOUTER
        "status": {
            "type": "enumeration",
            "enum": ["awaiting_declaration", "pending_approval", "approved", "denied", "processing", "completed"],
            "default": "awaiting_declaration",
            "required": true
        },
        "approved_by": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "plugin::users-permissions.user"
        },
        "approved_at": { "type": "datetime" },
        "denied_by": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "plugin::users-permissions.user"
        },
        "denied_at": { "type": "datetime" },
        "denial_reason": { "type": "text" },
        "tax_authority_notified": { "type": "boolean", "default": false },
        "tax_notification_date": { "type": "datetime" },
        
        // Relations
        "klub_don": {
            "type": "relation",
            "relation": "oneToOne",
            "target": "api::klub-don.klub-don"
        },
        "klubr": {
            "type": "relation",
            "relation": "manyToOne",
            "target": "api::klubr.klubr"
        }
    }
}
```

---

#### 6. Gestion des Erreurs

##### 6.1 Matrice des Scénarios d'Erreur

| Scénario | Détection | Action Automatique | Action Manuelle | Impact UX |
|----------|-----------|-------------------|-----------------|-----------|
| **Compte association inactif** | `charges_enabled: false` avant PaymentIntent | Bloquer formulaire don, afficher message | Admin relance onboarding Stripe | Donateur ne peut pas donner |
| **KYC incomplet** | `verification_status !== 'verified'` | Griser bouton "Finaliser", afficher statut | Association complète KYC | Association ne peut pas recevoir |
| **Paiement échoué (carte)** | Webhook `payment_failed` | Retry button + email relance | Support contacte si récurrent | Donateur peut réessayer |
| **Double paiement** | Clé idempotence existante | Retourner `client_secret` existant | - | Transparent pour donateur |
| **Remboursement post-reçu** | Demande manuelle | Workflow approbation | Validation admin + déclaration | Processus long |
| **Webhook perdu** | Cron vérifie PaymentIntents orphelins | Réconciliation automatique | Alerte si > 24h | Retard génération PDF |
| **Compte déconnecté** | Webhook `account.application.deauthorized` | Désactiver collecte, notifier | Admin contacte association | Collecte suspendue |
| **Solde négatif** | Stripe Dashboard alert | Stripe gère (controller.losses) | Monitoring admin | Aucun (Stripe absorbe) |
| **Fraude suspectée** | Analyse patterns manuels | Gel compte | Investigation + signalement | Blocage préventif |

##### 6.2 Stratégie de Retry

###### 6.2.1 Retry Instantané (Côté Donateur)

```typescript
// donaction-saas/src/components/sponsorshipForm/components/step4.svelte
async function handlePaymentError(error: StripeError) {
    paymentError = error.message;
    
    // Afficher bouton retry
    showRetryButton = true;
    
    // Si le PaymentIntent est encore valide (< 24h)
    if (currentPaymentIntent && !isExpired(currentPaymentIntent)) {
        // Réutiliser le même client_secret
        canRetryWithSameIntent = true;
    } else {
        // Créer un nouveau PaymentIntent
        canRetryWithSameIntent = false;
    }
}

async function retryPayment() {
    if (canRetryWithSameIntent) {
        // Réutiliser l'intent existant
        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: 'if_required',
        });
    } else {
        // Nouveau PaymentIntent avec nouvelle clé idempotence
        const newKey = generateIdempotencyKey(donUuid, 'retry', retryCount++);
        const { intent } = await createPaymentIntent(price, newKey, donorPaysFee);
        currentClientSecret = intent;
        // Puis confirmer...
    }
}
```

###### 6.2.2 Cron Job de Backup

```typescript
// api/klub-don-payment/services/klub-don-payment.ts
async reconcilePendingPayments() {
    // Trouver les paiements "pending" depuis plus de 30 minutes
    const pendingPayments = await strapi.db
        .query('api::klub-don-payment.klub-don-payment')
        .findMany({
            where: {
                status: 'pending',
                updatedAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) },
            },
            populate: { klub_don: true },
        });

    for (const payment of pendingPayments) {
        try {
            // Vérifier le statut réel sur Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(payment.intent_id);
            
            if (paymentIntent.status === 'succeeded') {
                // Webhook manqué - traiter maintenant
                await this.updateDonAndDonPayment({
                    status: 'success',
                    donUuid: payment.klub_don.uuid,
                    intent: paymentIntent,
                });
                
                console.log(`✅ Réconciliation: ${payment.intent_id} marqué succès`);
            } else if (['canceled', 'requires_payment_method'].includes(paymentIntent.status)) {
                // Marquer comme échoué
                await strapi.documents('api::klub-don-payment.klub-don-payment').update({
                    documentId: payment.documentId,
                    data: { status: 'error' },
                });
            }
        } catch (err) {
            console.error(`❌ Erreur réconciliation ${payment.intent_id}:`, err);
        }
    }
}

// Cron config
// 0 */15 * * * * - Toutes les 15 minutes
```

###### 6.2.3 Politique de Réutilisation du `client_secret`

| Situation | Action | Raison |
|-----------|--------|--------|
| PaymentIntent < 24h, status `requires_payment_method` | Réutiliser | Économise création |
| PaymentIntent < 24h, status `requires_confirmation` | Réutiliser | Paiement en cours |
| PaymentIntent > 24h | Nouveau PaymentIntent | Expiration Stripe |
| PaymentIntent status `succeeded` | Ne pas réutiliser | Déjà payé |
| PaymentIntent status `canceled` | Nouveau PaymentIntent | Annulé |

##### 6.3 Messages d'Erreur Utilisateur

```typescript
// Mapping erreurs Stripe → Messages FR
const STRIPE_ERROR_MESSAGES: Record<string, string> = {
    'card_declined': 'Votre carte a été refusée. Veuillez essayer une autre carte.',
    'insufficient_funds': 'Fonds insuffisants. Veuillez vérifier votre solde.',
    'expired_card': 'Votre carte a expiré. Veuillez utiliser une autre carte.',
    'incorrect_cvc': 'Le code de sécurité (CVC) est incorrect.',
    'processing_error': 'Une erreur technique est survenue. Veuillez réessayer.',
    'account_inactive': 'Cette association ne peut temporairement pas recevoir de dons. Veuillez réessayer plus tard.',
    'account_kyc_incomplete': 'Le compte de l\'association est en cours de vérification. Veuillez réessayer ultérieurement.',
};

function getErrorMessage(error: StripeError): string {
    return STRIPE_ERROR_MESSAGES[error.code] 
        || 'Une erreur est survenue lors du paiement. Veuillez réessayer.';
}
```

---

#### 7. Reporting et Monitoring

##### 7.1 Dashboard Superadmin

###### 7.1.1 Métriques Temps Réel

| Métrique | Source | Rafraîchissement | Alerte si |
|----------|--------|------------------|-----------|
| Dons en cours (pending) | `klub_don_payment.status` | 1 min | > 50 |
| Dons échoués (24h) | `klub_don_payment.status = error` | 5 min | > 10% |
| Volume total (jour) | `klub_don.montant` agrégé | 5 min | - |
| Commissions (jour) | `application_fee_amount` | 5 min | - |
| Webhooks en erreur | `webhook_logs.status = failed` | 1 min | > 5 |
| Comptes restreints | `connected_account.account_status` | 1h | > 0 |
| KYC incomplets | `connected_account.charges_enabled = false` | 1h | - |

###### 7.1.2 Écran `/admin/monitoring`

```
┌─────────────────────────────────────────────────────────────────────┐
│  📊 DONACTION - Monitoring Temps Réel                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  💰 AUJOURD'HUI                    📈 TENDANCE (7j)                 │
│  ────────────────                  ─────────────────                │
│  Dons réussis: 47                  [Graphique sparkline]            │
│  Volume: 3 450 €                   +12% vs semaine dernière         │
│  Commissions: 138 €                                                 │
│                                                                     │
│  ⚠️ ALERTES                        🔄 WEBHOOKS                      │
│  ────────                          ─────────                        │
│  [!] 2 paiements pending > 30min   Reçus (1h): 156                  │
│  [!] 1 compte restreint            Traités: 154                     │
│      → FC Lyon (voir)              Erreurs: 2 (1.3%)                │
│                                                                     │
│  🏦 COMPTES STRIPE                                                  │
│  ────────────────                                                   │
│  Actifs: 145 | Pending KYC: 12 | Restreints: 1 | Total: 158        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

###### 7.1.3 Alertes Automatiques

```typescript
// Notifications Slack/Discord + Email
interface AlertConfig {
    type: 'slack' | 'discord' | 'email';
    conditions: {
        pending_payments_count?: number;      // Alerte si > X
        failed_payments_percentage?: number;  // Alerte si > X%
        restricted_accounts_count?: number;   // Alerte si > 0
        webhook_failures_count?: number;      // Alerte si > X
    };
    recipients: string[];
}

const ALERT_CONFIG: AlertConfig[] = [
    {
        type: 'slack',
        conditions: {
            pending_payments_count: 50,
            webhook_failures_count: 5,
        },
        recipients: ['#donaction-alerts'],
    },
    {
        type: 'email',
        conditions: {
            restricted_accounts_count: 1,
        },
        recipients: ['admin@donaction.fr'],
    },
];
```

##### 7.2 Relevé de Frais Mensuel Association

###### 7.2.1 Contenu du Document

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RELEVÉ DE FRAIS MENSUEL                         │
│                         Janvier 2025                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ASSOCIATION                                                        │
│  ───────────                                                        │
│  FC Lyon                                                            │
│  SIREN: 123 456 789                                                 │
│  12 rue du Stade, 69001 Lyon                                        │
│                                                                     │
│  PÉRIODE                                                            │
│  ───────                                                            │
│  Du 01/01/2025 au 31/01/2025                                        │
│                                                                     │
│  RÉCAPITULATIF                                                      │
│  ─────────────                                                      │
│  Nombre de dons reçus: 47                                           │
│  Montant total collecté: 3 450,00 €                                 │
│                                                                     │
│  DÉTAIL DES FRAIS                                                   │
│  ───────────────                                                    │
│  ┌──────────┬────────────┬────────────┬────────────┬──────────────┐ │
│  │ Date     │ Donateur   │ Montant    │ Commission │ Mode frais   │ │
│  ├──────────┼────────────┼────────────┼────────────┼──────────────┤ │
│  │ 02/01/25 │ J. Dupont  │ 100,00 €   │ 4,00 €     │ Donor Pays   │ │
│  │ 05/01/25 │ SAS Martin │ 500,00 €   │ 20,00 €    │ Donor Pays   │ │
│  │ ...      │ ...        │ ...        │ ...        │ ...          │ │
│  └──────────┴────────────┴────────────┴────────────┴──────────────┘ │
│                                                                     │
│  TOTAL COMMISSIONS: 138,00 €                                        │
│  Mode de prélèvement: Prélevé au donateur (Donor Pays Fee)          │
│                                                                     │
│  ═══════════════════════════════════════════════════════════════    │
│  Ce document est un relevé d'information.                           │
│  Il ne constitue pas une facture.                                   │
│  Les commissions ont été prélevées automatiquement lors de chaque   │
│  transaction via Stripe Connect.                                    │
│                                                                     │
│  Généré le: 01/02/2025                                              │
│  Référence: REL-2025-01-FCLYON                                      │
└─────────────────────────────────────────────────────────────────────┘
```

###### 7.2.2 Génération et Distribution

```typescript
// api/fee-statement/services/fee-statement.ts
async generateMonthlyStatements(month: number, year: number) {
    // Récupérer tous les klubrs avec dons ce mois
    const klubrsWithDons = await strapi.db.query('api::klubr.klubr').findMany({
        where: {
            klub_dons: {
                statusPaiment: 'success',
                datePaiment: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1),
                },
            },
        },
        populate: {
            klub_dons: {
                filters: {
                    statusPaiment: 'success',
                    datePaiment: {
                        $gte: new Date(year, month - 1, 1),
                        $lt: new Date(year, month, 1),
                    },
                },
                populate: ['klubDonateur', 'klub_don_payments'],
            },
            trade_policy: true,
            leaders: true,
        },
    });

    for (const klubr of klubrsWithDons) {
        // Calculer les totaux
        const summary = calculateStatementSummary(klubr.klub_dons, klubr.trade_policy);
        
        // Générer PDF
        const pdfPath = await generateStatementPDF({
            klubr,
            month,
            year,
            dons: klubr.klub_dons,
            summary,
        });

        // Sauvegarder l'enregistrement
        await strapi.documents('api::fee-statement.fee-statement').create({
            data: {
                klubr: klubr.id,
                period: `${year}-${String(month).padStart(2, '0')}`,
                total_donations: summary.totalDonations,
                total_commissions: summary.totalCommissions,
                pdf_path: pdfPath,
            },
        });

        // Envoyer par email aux leaders
        for (const leader of klubr.leaders) {
            await sendBrevoTransacEmail({
                to: [{ email: leader.email }],
                templateId: BREVO_TEMPLATES.FEE_STATEMENT,
                params: {
                    LEADER_NAME: `${leader.prenom} ${leader.nom}`,
                    CLUB_NAME: klubr.denomination,
                    PERIOD: `${getMonthName(month)} ${year}`,
                    TOTAL_DONATIONS: formatCurrency(summary.totalDonations),
                    TOTAL_COMMISSIONS: formatCurrency(summary.totalCommissions),
                },
                attachment: [{ content: pdfPath, name: `releve-${year}-${month}.pdf` }],
            });
        }
    }
}
```

---

#### 8. Plan de Migration

##### 8.1 Phases de Déploiement

```mermaid
gantt
    title Plan de Migration Stripe Connect
    dateFormat  YYYY-MM-DD
    section Phase 0
    Revue code existant (Phases 1-3)    :done, p0, 2025-01-09, 3d
    Tests unitaires                      :active, p0t, after p0, 5d
    
    section Phase 1 - Pilote
    Sélection 5 associations pilotes    :p1a, after p0t, 2d
    Onboarding pilotes                  :p1b, after p1a, 7d
    Tests en production                 :p1c, after p1b, 14d
    Collecte feedback                   :p1d, after p1b, 14d
    
    section Phase 2 - Rollout
    Communication générale              :p2a, after p1c, 3d
    Onboarding par vagues (10/semaine)  :p2b, after p2a, 28d
    Support renforcé                    :p2c, after p2a, 35d
    
    section Phase 3 - Dépréciation
    Désactivation ancien système        :p3a, after p2b, 7d
    Migration données legacy            :p3b, after p3a, 14d
    Archivage                           :p3c, after p3b, 7d
```

##### 8.2 Détail des Phases

###### Phase 0 : Préparation (Semaine 1-2)

| Tâche | Responsable | Livrable |
|-------|-------------|----------|
| Revue du code Phases 1-3 | Tech Lead | Liste corrections |
| Ajout tests unitaires | Dev Backend | Coverage > 80% |
| Test intégration Stripe sandbox | Dev Backend | Rapport tests |
| Création environnement staging | DevOps | Env fonctionnel |
| Documentation API interne | Dev Backend | OpenAPI spec |
| Formation équipe support | Product Owner | Guide support |

###### Phase 1 : Pilote (Semaine 3-6)

**Critères de sélection des pilotes :**
- Association avec volume > 10 dons/mois
- Leader technophile et réactif
- Représentativité : 1 grand club, 2 moyens, 2 petits
- Accord de participation au pilote

**Actions :**
1. Contact personnalisé des 5 associations
2. Session d'onboarding individuelle (visio)
3. Suivi quotidien pendant 2 semaines
4. Collecte de feedback structuré
5. Correction des bugs identifiés

###### Phase 2 : Rollout (Semaine 7-14)

**Communication :**
- Email d'annonce à toutes les associations
- FAQ dédiée sur le site
- Webinaire de présentation (enregistré)
- Tutoriel vidéo étape par étape

**Rythme d'onboarding :**
- Semaine 7-8 : 10 associations
- Semaine 9-10 : 20 associations
- Semaine 11-12 : 30 associations
- Semaine 13-14 : Reste des associations

###### Phase 3 : Dépréciation (Semaine 15-18)

**Désactivation de l'ancien système :**
1. Blocage des nouveaux dons via ancien système
2. Migration des dons en cours vers nouveau système
3. Archivage des données legacy
4. Redirection des webhooks

##### 8.3 KPIs de Succès

| KPI | Cible | Mesure |
|-----|-------|--------|
| **Taux d'onboarding** | > 90% associations actives en 8 semaines | `connected_accounts.charges_enabled / klubrs.donationEligible` |
| **Taux de conversion formulaire** | ≥ taux actuel (-2% max) | Dons réussis / Formulaires ouverts |
| **Temps moyen onboarding** | < 48h | Création compte → charges_enabled |
| **Taux d'erreur paiement** | < 5% | Erreurs / Total tentatives |
| **NPS Associations** | > 40 | Enquête post-onboarding |
| **Volume dons** | Pas de baisse | Comparaison M-1, M-12 |
| **Tickets support** | < 10/semaine après rollout | Zendesk/Email |

##### 8.4 Plan de Rollback

En cas de problème critique :

```typescript
// Configuration feature flag
const STRIPE_CONNECT_ENABLED = process.env.STRIPE_CONNECT_ENABLED === 'true';

// Dans le contrôleur
async createPaymentIntent() {
    const klubr = await getKlubr(klubrUuid);
    const useStripeConnect = STRIPE_CONNECT_ENABLED 
        && klubr.trade_policy?.stripe_connect 
        && klubr.connected_account?.charges_enabled;
    
    if (useStripeConnect) {
        // Nouveau flow Stripe Connect
        return this.createConnectPaymentIntent(...);
    } else {
        // Fallback ancien flow
        return this.createClassicPaymentIntent(...);
    }
}
```

**Procédure de rollback :**
1. Désactiver `STRIPE_CONNECT_ENABLED` en variable d'environnement
2. Redéployer l'API
3. Communiquer aux associations impactées
4. Investiguer et corriger
5. Réactiver progressivement

---

#### 9. Annexes

##### 9.1 Exemples de Payloads API

###### 9.1.1 Création PaymentIntent (Stripe Connect)

**Request :**
```json
POST /api/klub-don-payments/create-payment-intent
Content-Type: application/json

{
    "price": 100,
    "idempotencyKey": "abc123-1704812400000-create",
    "donorPaysFee": true,
    "metadata": {
        "donUuid": "abc123",
        "klubUuid": "def456",
        "projectUuid": "ghi789",
        "donorUuid": "jkl012"
    }
}
```

**Response (succès) :**
```json
{
    "intent": "pi_3QfXXXXXXXXXXXXX_secret_XXXXXXXXX",
    "reused": false
}
```

**Response (réutilisation idempotence) :**
```json
{
    "intent": "pi_3QfXXXXXXXXXXXXX_secret_XXXXXXXXX",
    "reused": true
}
```

###### 9.1.2 Webhook `payment_intent.succeeded`

```json
{
    "id": "evt_1234567890",
    "object": "event",
    "type": "payment_intent.succeeded",
    "data": {
        "object": {
            "id": "pi_3QfXXXXXXXXXXXXX",
            "object": "payment_intent",
            "amount": 10590,
            "currency": "eur",
            "status": "succeeded",
            "metadata": {
                "donUuid": "abc123",
                "klubUuid": "def456",
                "projectUuid": "ghi789",
                "donorUuid": "jkl012",
                "payment_method": "stripe_connect",
                "donor_pays_fee": "true"
            },
            "on_behalf_of": "acct_1234567890",
            "transfer_data": {
                "destination": "acct_1234567890"
            },
            "application_fee_amount": 590
        }
    }
}
```

###### 9.1.3 Création Compte Express

**Request :**
```json
POST /api/stripe-connect/create-account
Content-Type: application/json

{
    "klubrId": "abc123"
}
```

**Response :**
```json
{
    "stripeAccountId": "acct_1234567890",
    "onboardingUrl": "https://connect.stripe.com/express/onboarding/..."
}
```

##### 9.2 Templates de Documents

###### 9.2.1 Email Template : Confirmation Don

**ID Brevo : 8** (à mettre à jour)

```html
Objet : Merci pour votre don à {{CLUB_DENOMINATION}} 🎉

Bonjour {{RECEIVER_FULLNAME}},

Nous avons le plaisir de vous confirmer la réception de votre don.

📋 Récapitulatif :
• Association : {{CLUB_DENOMINATION}}
{{#if PROJECT_TITLE}}• Projet : {{PROJECT_TITLE}}{{/if}}
• Montant du don : {{DONATION_AMOUNT}} €
{{#if DONATION_CONTRIBUTION}}• Contribution DONACTION : {{DONATION_CONTRIBUTION}} €{{/if}}
• Date : {{DONATION_DATE}}

📎 Vos documents sont joints à cet email :
• Attestation de paiement
{{#if WITH_TAX_REDUCTION}}• Reçu fiscal (à conserver pour votre déclaration d'impôts){{/if}}

💡 Votre don permet à {{CLUB_DENOMINATION}} de poursuivre ses activités d'intérêt général.

Sportivement,
L'équipe DONACTION
```

###### 9.2.2 Email Template : Relance Onboarding

**ID Brevo : Nouveau**

```html
Objet : Finalisez votre compte de collecte {{CLUB_NAME}}

Bonjour {{LEADER_NAME}},

Votre association {{CLUB_NAME}} a commencé son inscription sur DONACTION, mais l'activation du compte de paiement n'est pas terminée.

📊 Statut actuel :
• Informations association : {{CLUB_INFO_PERCENT}}%
• Documents : {{DOCS_PERCENT}}%
• Compte paiement : En attente

➡️ Pour finaliser et commencer à recevoir des dons :
{{ONBOARDING_LINK}}

Cette étape prend environ 5 minutes et nécessite :
• Un justificatif d'identité du responsable
• Les coordonnées bancaires de l'association

Besoin d'aide ? Répondez à cet email.

L'équipe DONACTION
```

##### 9.3 Glossaire

| Terme | Définition |
|-------|------------|
| **Application Fee** | Commission prélevée par DONACTION sur chaque transaction |
| **Connected Account** | Compte Stripe Express d'une association, lié à la plateforme DONACTION |
| **Destination Charges** | Type de flux Stripe où le paiement arrive sur le compte plateforme puis est transféré |
| **Donor Pays Fee** | Modèle où le donateur prend en charge les frais (Stripe + commission) |
| **Express Account** | Type de compte Stripe avec onboarding hébergé par Stripe |
| **Idempotency Key** | Clé unique empêchant les double-facturations |
| **KYC** | Know Your Customer - Vérification d'identité |
| **PaymentIntent** | Objet Stripe représentant une intention de paiement |
| **Reçu Fiscal** | Document Cerfa permettant la déduction fiscale |
| **Trade Policy** | Configuration des frais et commissions par association |
| **Webhook** | Notification HTTP envoyée par Stripe lors d'un événement |

##### 9.4 Points d'Attention Identifiés dans le Code Actuel

Après analyse du code fourni (Documents 14, 16, 33, 37), voici les ajustements recommandés :

| Fichier | Constat | Recommandation |
|---------|---------|----------------|
| `trade_policy/schema.json` | `commissionPercentage` default = 6% | Ajuster à 4% pour nouveau modèle |
| `trade_policy/schema.json` | Champ unique `donor_pays_fee` | **REMPLACER** par `donor_pays_fee_project` + `donor_pays_fee_club` + `allow_donor_fee_choice` |
| `klub-don/schema.json` | Pas de champ `donor_pays_fee` | **AJOUTER** pour stocker le choix du donateur |
| `klub-don-payment.controller.ts` | Calcul frais ne gère pas tous les `fee_model` | Implémenter les 3 modes |
| `connected-account/schema.json` | Pas de champ `business_profile` | Ajouter pour enrichir données |
| `api.ts` (Svelte) | Pas de gestion erreur détaillée | Ajouter mapping erreurs FR |
| - | Manque `webhook_logs` content-type | Créer pour audit trail |
| - | Manque `receipt_cancellations` complet | Compléter schéma |
| - | Manque endpoint webhook Connect | Créer `/stripe-connect/webhook` |

##### 9.5 Évolution du Schéma `trade_policy`

**Modifications à apporter au fichier `trade_policy/schema.json` :**

```json
{
  "kind": "collectionType",
  "collectionName": "trade_policies",
  "info": {
    "singularName": "trade-policy",
    "pluralName": "trade-policies",
    "displayName": "Trade policy"
  },
  "attributes": {
    // ... attributs existants ...
    
    // SUPPRIMER ce champ
    // "donor_pays_fee": { ... }
    
    // AJOUTER ces 3 nouveaux champs
    "donor_pays_fee_project": {
      "type": "boolean",
      "default": true,
      "required": true
    },
    "donor_pays_fee_club": {
      "type": "boolean",
      "default": false,
      "required": true
    },
    "allow_donor_fee_choice": {
      "type": "boolean",
      "default": true,
      "required": true
    }
  }
}
```

**Migration de données (si des trade_policies existantes) :**

```typescript
// Script de migration
async function migrateDonorPaysFeeFields() {
    const tradePolicies = await strapi.db.query('api::trade-policy.trade-policy').findMany();
    
    for (const policy of tradePolicies) {
        await strapi.db.query('api::trade-policy.trade-policy').update({
            where: { id: policy.id },
            data: {
                donor_pays_fee_project: policy.donor_pays_fee ?? true,
                donor_pays_fee_club: policy.donor_pays_fee ?? false,
                allow_donor_fee_choice: true,
            },
        });
    }
    
    console.log(`✅ Migré ${tradePolicies.length} trade policies`);
}
```

##### 9.6 Évolution du Schéma `klub-don`

**Ajout du champ pour stocker le choix du donateur :**

```json
// À ajouter dans klub-don/schema.json
{
  "donor_pays_fee": {
    "type": "boolean",
    "required": false
  }
}
```

**Note :** Si `null`, le système utilisera la valeur par défaut de la `trade_policy` selon le type de don (projet ou club).

---

#### 10. Checklist de Validation

##### Avant Mise en Production

- [ ] Tests unitaires coverage > 80%
- [ ] Tests d'intégration Stripe sandbox OK
- [ ] Calcul des frais validé avec comptable
- [ ] Templates PDF reçu fiscal validés
- [ ] Webhooks testés (tous les événements)
- [ ] Stratégie d'idempotence testée
- [ ] Rollback testé en staging
- [ ] Documentation support rédigée
- [ ] Équipe support formée
- [ ] KPIs de monitoring configurés
- [ ] Alertes Slack/Discord configurées
- [ ] Feature flag fonctionnel
- [ ] Plan de communication prêt

##### Pour Chaque Association Onboardée

- [ ] `requiredFieldsCompletion` = 100%
- [ ] `requiredDocsValidatedCompletion` = 100%
- [ ] `managerSignature` uploadée
- [ ] Connected Account créé
- [ ] `charges_enabled` = true
- [ ] `payouts_enabled` = true
- [ ] Premier don test réussi
- [ ] Reçu fiscal généré correctement
- [ ] Email confirmation reçu

---

#### 11. Configuration du Compte Stripe pour Connect

##### 11.1 Prérequis

Avant de configurer Stripe Connect, vérifiez que vous disposez de :

| Élément | Statut | Description |
|---------|--------|-------------|
| Compte Stripe activé | ✅ Requis | Compte live avec vérification d'identité complète |
| Entreprise en France | ✅ Requis | DONACTION doit être une entité française |
| Site web HTTPS | ✅ Requis | URLs de production accessibles en HTTPS |
| Conditions d'utilisation | ✅ Requis | CGU mentionnant Stripe (sous-traitant de paiement) |

##### 11.2 Accès aux Paramètres Connect

**Chemin :** Dashboard Stripe → Plus (+) → Connect

Si Connect n'est pas visible :
1. Aller dans **Settings** → **Product settings** → **Connect**
2. Activer Connect pour votre compte
3. Compléter le **Platform Profile** (questionnaire sur votre modèle)

##### 11.3 Configuration du Platform Profile

Lors de la première activation, Stripe pose des questions pour configurer votre plateforme :

| Question | Réponse pour DONACTION |
|----------|------------------------|
| **Type de plateforme** | Marketplace / Plateforme de dons |
| **Qui sont vos utilisateurs ?** | Associations / Non-profits |
| **Comment collectez-vous les paiements ?** | Au nom des associations |
| **Qui gère les remboursements ?** | La plateforme (DONACTION) |
| **Pays des comptes connectés** | France (FR) uniquement pour v1 |

##### 11.4 Paramètres Connect Settings

**Chemin :** Dashboard → Connect → Settings

###### 11.4.1 Account Types (Types de comptes)

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ CONFIGURATION DES COMPTES CONNECTÉS                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Type de compte : ◉ Express  ○ Custom  ○ Standard           │
│                                                             │
│  ▸ Express = Stripe gère l'onboarding KYC                   │
│  ▸ Associations redirigées vers formulaire Stripe           │
│  ▸ Express Dashboard pour voir leurs paiements              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Choix recommandé : Express**
- Stripe gère la vérification d'identité (KYC)
- Onboarding hébergé par Stripe (moins de développement)
- Associations ont accès à l'Express Dashboard
- Conformité automatique aux évolutions réglementaires

###### 11.4.2 Capabilities (Fonctionnalités)

**Chemin :** Connect → Settings → Capabilities

Activer les capabilities suivantes pour les nouveaux comptes :

| Capability | Activer | Description |
|------------|---------|-------------|
| `card_payments` | ✅ Oui | Accepter les paiements par carte |
| `transfers` | ✅ Oui | Recevoir des transferts de la plateforme |
| `cartes_bancaires` | ⚠️ Optionnel | Cartes Bancaires françaises (ajoute des vérifications) |

> **Note France :** Pour accepter Cartes Bancaires, l'association doit fournir son numéro SIREN dans le formulaire d'onboarding.

###### 11.4.3 Payout Settings (Virements)

**Chemin :** Connect → Settings → Payouts

| Paramètre | Valeur recommandée | Description |
|-----------|-------------------|-------------|
| **Payout schedule** | `daily` ou `weekly` | Fréquence des virements |
| **Delay days** | `7` (minimum légal FR) | Délai avant virement |
| **Allow manual payouts** | ✅ Activé | Associations peuvent déclencher un virement |
| **Debit negative balances** | ✅ Activé | Débiter le compte en cas de solde négatif |

###### 11.4.4 Branding (Personnalisation)

**Chemin :** Connect → Settings → Branding

```
┌─────────────────────────────────────────────────────────────┐
│  🎨 BRANDING DE LA PLATEFORME                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Business name :  DONACTION                                 │
│  Icon :           [📤 Upload logo 512x512 PNG]              │
│  Primary color :  #73cfa8 (vert DONACTION)                  │
│  Secondary color: #fb9289 (corail)                          │
│                                                             │
│  ✅ Copy platform branding to connected accounts            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Ce branding apparaît :
- Sur le formulaire d'onboarding Stripe des associations
- Dans l'Express Dashboard des associations
- Sur les emails envoyés par Stripe aux associations

##### 11.5 Configuration des Webhooks

Stripe Connect nécessite **2 types de webhooks** distincts :

###### 11.5.1 Webhook Account (Paiements)

**Chemin :** Developers → Webhooks → Add endpoint

| Paramètre | Valeur |
|-----------|--------|
| **Endpoint URL** | `https://www.donaction.fr/service/api/klub-don-payments/stripe-web-hooks` |
| **Listen to** | ◉ Events on your account |
| **Events** | `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` |

###### 11.5.2 Webhook Connect (Comptes connectés)

**Chemin :** Developers → Webhooks → Add endpoint

| Paramètre | Valeur |
|-----------|--------|
| **Endpoint URL** | `https://www.donaction.fr/service/api/stripe-connect/webhook` |
| **Listen to** | ◉ Events on Connected accounts |
| **Events sélectionnés** | Voir liste ci-dessous |

**Événements Connect à écouter :**

| Événement | Description |
|-----------|-------------|
| `account.updated` | Statut KYC mis à jour |
| `account.application.deauthorized` | Association déconnectée |
| `capability.updated` | Capability activée/désactivée |
| `person.created` | Représentant légal ajouté |
| `person.updated` | Infos représentant mises à jour |
| `payout.created` | Virement initié |
| `payout.paid` | Virement effectué |
| `payout.failed` | Échec virement |
| `charge.dispute.created` | **Litige ouvert** |
| `charge.dispute.updated` | **Litige mis à jour** |
| `charge.dispute.closed` | **Litige fermé** |

###### 11.5.3 Récupération des Webhook Secrets

Après création de chaque webhook :

1. Cliquer sur le webhook créé
2. Dans **Signing secret**, cliquer **Reveal**
3. Copier la clé `whsec_...`

```bash
### Variables d'environnement à configurer
STRIPE_WEBHOOK_SECRET=whsec_xxx...      # Webhook Account (paiements)
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_yyy... # Webhook Connect (comptes)
```

##### 11.6 Clés API

**Chemin :** Developers → API keys

###### 11.6.1 Clés Disponibles

| Type | Format | Usage |
|------|--------|-------|
| **Publishable key** | `pk_live_...` | Frontend (Svelte, Next.js) |
| **Secret key** | `sk_live_...` | Backend (Strapi) - ⚠️ NE JAMAIS EXPOSER |

###### 11.6.2 Variables d'Environnement

```bash
### Backend (donaction-api/.env.prod)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_...

### Frontend (donaction-frontend/.env.prod)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

### SaaS Widget (donaction-saas/.env.prod)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

###### 11.6.3 Clés de Test (Sandbox)

Pour l'environnement staging (`re7.donaction.fr`), utiliser les clés test :

| Type | Format |
|------|--------|
| **Publishable key** | `pk_test_...` |
| **Secret key** | `sk_test_...` |

> **Basculer Test/Live :** Toggle en haut à droite du Dashboard Stripe

##### 11.7 Configuration Onboarding Express

**Chemin :** Connect → Settings → Express

###### 11.7.1 Onboarding Interface

| Paramètre | Configuration |
|-----------|---------------|
| **Countries** | ✅ France uniquement |
| **Business types** | ✅ Non-profit, ✅ Company |
| **Individual accounts** | ❌ Désactivé (associations uniquement) |

###### 11.7.2 Information Collection

| Information | Requis | Description |
|-------------|--------|-------------|
| **External account** | ✅ Oui | IBAN pour les virements |
| **Statement descriptor** | ✅ Oui | Nom affiché sur relevés bancaires donateurs |
| **Support info** | ✅ Oui | Email/téléphone support association |

###### 11.7.3 Express Dashboard Features

| Feature | Activer | Description |
|---------|---------|-------------|
| **View transactions** | ✅ | Voir les paiements reçus |
| **View payouts** | ✅ | Voir les virements |
| **Manage payout schedule** | ⚠️ Optionnel | Laisser associations changer fréquence |
| **Issue refunds** | ❌ Non | DONACTION gère les remboursements |
| **View disputes** | ✅ | Voir les litiges |

##### 11.8 Tarification Stripe Connect

###### 11.8.1 Frais de Traitement des Paiements (France)

| Type de carte | Frais Stripe | Notes |
|---------------|--------------|-------|
| **Cartes européennes** | 1.5% + 0.25€ | Visa, Mastercard, CB domestiques |
| **Cartes UK post-Brexit** | 2.5% + 0.25€ | Cartes émises au Royaume-Uni |
| **Cartes internationales** | 2.9% + 0.25€ | Hors Europe |
| **Cartes Bancaires (CB)** | 1.5% + 0.25€ | Réseau français, nécessite SIREN |

###### 11.8.2 Frais Connect Spécifiques

| Service | Tarif | Description |
|---------|-------|-------------|
| **Compte Express actif** | 2€/mois/compte* | Comptes ayant reçu ≥1 payout dans le mois |
| **Virements (payouts)** | 0.25€/virement | Virement vers compte bancaire |
| **Virements intra-zone euro** | 0€ cross-border | Pas de frais supplémentaires |
| **Instant Payouts** | 1% (min 0.50€) | Virements instantanés (optionnel) |

*Note : Le tarif exact des comptes Express peut varier. Vérifier sur [stripe.com/connect/pricing](https://stripe.com/connect/pricing).

###### 11.8.3 Frais de Litiges (Disputes)

| Événement | Frais | Remboursable ? |
|-----------|-------|----------------|
| **Litige ouvert (chargeback)** | 15€ | Non (sauf Mexique) |
| **Litige contesté** | +15€ additionnel | Non |
| **CB (Cartes Bancaires)** | 0€ | Zone SEPA exemptée |

###### 11.8.4 Synthèse des Frais pour un Don Type

**Exemple : Don de 100€ (carte européenne)**

```
┌───────────────────────────────────────────────────────────────────────┐
│  💳 DÉCOMPOSITION FRAIS - DON 100€                                    │
├───────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Montant intentionnel du don :            100.00 €                    │
│                                                                       │
│  ─── Si "Donor Pays Fee" = true ───                                   │
│                                                                       │
│  + Frais Stripe (1.5% + 0.25€) :          +  1.75 €                   │
│  + Commission DONACTION (4%) :            +  4.00 €                   │
│  ═══════════════════════════════════════════════════                  │
│  Total débité au donateur :               105.75 €                    │
│                                                                       │
│  → Association reçoit :                   100.00 € ✅                 │
│  → DONACTION reçoit :                       4.00 € (application_fee)  │
│  → Stripe prélève :                         1.75 € (sur plateforme)   │
│                                                                       │
│  ─── Si "Donor Pays Fee" = false ───                                  │
│                                                                       │
│  Total débité au donateur :               100.00 €                    │
│                                                                       │
│  → Association reçoit :                    94.25 € (100 - 5.75)       │
│  → DONACTION reçoit :                       4.00 €                    │
│  → Stripe prélève :                         1.75 €                    │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

###### 11.8.5 Estimation Mensuelle des Coûts

| Volume mensuel | Frais Stripe (~1.8%) | Comptes actifs | Total estimé |
|----------------|---------------------|----------------|--------------|
| 10 000€ (50 dons) | ~180€ | ~5 × 2€ = 10€ | ~190€ |
| 50 000€ (250 dons) | ~900€ | ~25 × 2€ = 50€ | ~950€ |
| 100 000€ (500 dons) | ~1 800€ | ~50 × 2€ = 100€ | ~1 900€ |

> **Important :** Dans le modèle "Donor Pays Fee", ces frais Stripe sont inclus dans le montant payé par le donateur. DONACTION ne supporte que les frais des comptes Express actifs.

##### 11.9 Gestion des Disputes (Chargebacks)

###### 11.9.1 Responsabilités avec Destination Charges

Avec les **destination charges** utilisées par DONACTION :

```
┌────────────────────────────────────────────────────────────────────────┐
│  ⚖️ RESPONSABILITÉ DES LITIGES - DESTINATION CHARGES                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  La charge est créée sur le compte PLATEFORME (DONACTION)              │
│  puis transférée vers le compte ASSOCIATION (connected account)        │
│                                                                        │
│  En cas de litige :                                                    │
│                                                                        │
│  1️⃣ Stripe débite le montant du compte PLATEFORME                     │
│  2️⃣ DONACTION doit reverser le transfer vers l'association            │
│  3️⃣ DONACTION est responsable des soldes négatifs                     │
│                                                                        │
│  ⚠️ DONACTION EST ULTIMEMENT RESPONSABLE                               │
│     (même si l'association a un solde positif)                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

###### 11.9.2 Cycle de Vie d'un Litige

```mermaid
stateDiagram-v2
    [*] --> EarlyFraudWarning: Signal fraude potentielle
    EarlyFraudWarning --> Inquiry: Escalade optionnelle
    EarlyFraudWarning --> [*]: Pas d'action requise
    
    [*] --> Inquiry: Demande d'info (AmEx/Discover)
    Inquiry --> DisputeCreated: Escalade en chargeback
    Inquiry --> [*]: Résolu sans chargeback
    
    [*] --> DisputeCreated: Chargeback initié
    
    DisputeCreated --> NeedsResponse: En attente preuves
    NeedsResponse --> UnderReview: Preuves soumises
    NeedsResponse --> Lost: Délai expiré (auto-perdu)
    
    UnderReview --> Won: Banque favorable
    UnderReview --> Lost: Banque défavorable
    
    Won --> [*]: Fonds restitués
    Lost --> [*]: Fonds perdus définitivement
```

###### 11.9.3 Délais de Réponse

| Phase | Délai | Action requise |
|-------|-------|----------------|
| **Early Fraud Warning** | N/A | Optionnel : rembourser préventivement |
| **Inquiry** | 7-14 jours | Fournir informations demandées |
| **Dispute (chargeback)** | **7-21 jours** | Soumettre preuves via Dashboard/API |
| **Arbitration** | 10-45 jours | Dernier recours (frais supplémentaires) |

> **Critique :** Les litiges non contestés dans les délais sont **automatiquement perdus**.

###### 11.9.4 Flux de Gestion des Litiges

```mermaid
sequenceDiagram
    participant Donateur
    participant Banque as Banque Émettrice
    participant Stripe
    participant DONACTION
    participant Association

    Donateur->>Banque: Conteste le paiement
    Banque->>Stripe: Initie chargeback
    
    Stripe->>DONACTION: Webhook: charge.dispute.created
    Note right of Stripe: Fonds bloqués sur<br/>compte DONACTION
    
    Stripe->>DONACTION: Notification email
    
    DONACTION->>DONACTION: Évalue le litige
    
    alt Litige légitime (erreur/fraude avérée)
        DONACTION->>Stripe: Accepte le litige
        Stripe->>Banque: Fonds restitués au donateur
        DONACTION->>Association: Reverse le transfer
        Note over DONACTION,Association: Association doit<br/>rembourser DONACTION
    else Litige contestable
        DONACTION->>Association: Demande preuves<br/>(reçu, confirmation, etc.)
        Association->>DONACTION: Fournit documents
        DONACTION->>Stripe: Soumet preuves via API
        Stripe->>Banque: Transmet dossier
        
        alt Litige gagné
            Banque->>Stripe: Décision favorable
            Stripe->>DONACTION: Webhook: charge.dispute.closed (won)
            Note right of DONACTION: Fonds débloqués
        else Litige perdu
            Banque->>Stripe: Décision défavorable
            Stripe->>DONACTION: Webhook: charge.dispute.closed (lost)
            DONACTION->>Association: Reverse le transfer
            Note over DONACTION,Association: Perte financière<br/>pour l'association
        end
    end
```

###### 11.9.5 Preuves à Collecter pour Contester

Pour les **dons**, les preuves suivantes sont pertinentes :

| Preuve | Description | Poids |
|--------|-------------|-------|
| **Confirmation email** | Email envoyé au donateur après le don | ⭐⭐⭐ |
| **Reçu fiscal PDF** | Preuve de la transaction et du destinataire | ⭐⭐⭐ |
| **Attestation de don** | Document signé si don en personne | ⭐⭐ |
| **IP address** | Adresse IP lors du paiement | ⭐⭐ |
| **AVS/CVC check** | Résultat des vérifications carte | ⭐⭐ |
| **3D Secure** | Authentification forte (SCA) | ⭐⭐⭐ |
| **Logs d'activité** | Historique des actions du donateur | ⭐ |
| **Correspondance** | Échanges avec le donateur | ⭐⭐ |

> **Avantage dons :** Les transactions avec 3D Secure (obligatoire en France via SCA/PSD2) bénéficient d'un **liability shift** : la responsabilité fraude passe à la banque émettrice.

###### 11.9.6 Implémentation Backend

**Webhook Handler pour les Disputes :**

```typescript
// api/stripe-connect/controllers/webhook.ts

async handleDisputeEvent(event: Stripe.Event) {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId = dispute.payment_intent as string;
    
    // Récupérer le don associé
    const klubDonPayment = await strapi.db
        .query('api::klub-don-payment.klub-don-payment')
        .findOne({
            where: { intent_id: paymentIntentId },
            populate: { klub_don: { populate: ['klubr', 'klubDonateur'] } }
        });
    
    if (!klubDonPayment) {
        console.error(`❌ Dispute: PaymentIntent ${paymentIntentId} non trouvé`);
        return;
    }
    
    const klubDon = klubDonPayment.klub_don;
    
    switch (event.type) {
        case 'charge.dispute.created':
            console.log(`⚠️ LITIGE OUVERT - Don ${klubDon.uuid}`);
            
            // 1. Logger l'événement
            await logFinancialAction(
                'dispute_created',
                klubDon.klubr.id,
                klubDon.id,
                dispute.amount,
                paymentIntentId,
                {
                    dispute_id: dispute.id,
                    reason: dispute.reason,
                    status: dispute.status
                }
            );
            
            // 2. Mettre à jour le statut du don
            await strapi.documents('api::klub-don.klub-don').update({
                documentId: klubDon.documentId,
                data: { 
                    disputeStatus: 'open',
                    disputeId: dispute.id,
                    disputeReason: dispute.reason
                }
            });
            
            // 3. Notifier l'équipe DONACTION
            await sendDisputeAlert({
                type: 'dispute_opened',
                don: klubDon,
                dispute: dispute,
                deadline: new Date(dispute.evidence_details.due_by * 1000)
            });
            
            // 4. Notifier l'association
            await sendDisputeNotificationToKlub({
                klubr: klubDon.klubr,
                don: klubDon,
                dispute: dispute
            });
            break;
            
        case 'charge.dispute.updated':
            console.log(`📝 LITIGE MIS À JOUR - ${dispute.status}`);
            
            await strapi.documents('api::klub-don.klub-don').update({
                documentId: klubDon.documentId,
                data: { disputeStatus: dispute.status }
            });
            break;
            
        case 'charge.dispute.closed':
            const won = dispute.status === 'won';
            console.log(`${won ? '✅' : '❌'} LITIGE FERMÉ - ${dispute.status}`);
            
            await strapi.documents('api::klub-don.klub-don').update({
                documentId: klubDon.documentId,
                data: { 
                    disputeStatus: dispute.status,
                    disputeClosedAt: new Date()
                }
            });
            
            await logFinancialAction(
                won ? 'dispute_won' : 'dispute_lost',
                klubDon.klubr.id,
                klubDon.id,
                dispute.amount,
                paymentIntentId,
                { dispute_id: dispute.id }
            );
            
            if (!won) {
                // Reverser le transfer vers l'association
                await reverseTransferForDispute(klubDon, dispute);
            }
            break;
    }
}
```

**Service de Reverse Transfer :**

```typescript
// helpers/stripe-connect-helper.ts

export async function reverseTransferForDispute(
    klubDon: KlubDonEntity,
    dispute: Stripe.Dispute
): Promise<void> {
    // Récupérer le transfer original
    const paymentIntent = await stripe.paymentIntents.retrieve(
        dispute.payment_intent as string,
        { expand: ['latest_charge.transfer'] }
    );
    
    const transfer = (paymentIntent.latest_charge as Stripe.Charge)?.transfer;
    
    if (!transfer) {
        console.error(`❌ Pas de transfer trouvé pour le dispute ${dispute.id}`);
        return;
    }
    
    try {
        // Reverser le transfer
        const reversal = await stripe.transfers.createReversal(
            typeof transfer === 'string' ? transfer : transfer.id,
            {
                amount: dispute.amount,
                description: `Reversal suite au litige ${dispute.id}`
            }
        );
        
        console.log(`✅ Transfer reversé: ${reversal.id}`);
        
        // Logger l'action
        await logFinancialAction(
            'transfer_reversed_dispute',
            klubDon.klubr.id,
            klubDon.id,
            dispute.amount,
            dispute.payment_intent as string,
            { 
                reversal_id: reversal.id,
                dispute_id: dispute.id
            }
        );
        
    } catch (error) {
        console.error(`❌ Échec reversal transfer:`, error);
        // Alerter l'équipe pour intervention manuelle
        await sendDisputeAlert({
            type: 'reversal_failed',
            don: klubDon,
            dispute: dispute,
            error: error.message
        });
    }
}
```

###### 11.9.7 Évolutions Schéma pour les Disputes

**Ajouts dans `klub-don/schema.json` :**

```json
{
  "disputeStatus": {
    "type": "enumeration",
    "enum": ["none", "warning_received", "open", "under_review", "won", "lost"],
    "default": "none"
  },
  "disputeId": {
    "type": "string"
  },
  "disputeReason": {
    "type": "string"
  },
  "disputeClosedAt": {
    "type": "datetime"
  }
}
```

###### 11.9.8 Prévention des Litiges

| Mesure | Description | Efficacité |
|--------|-------------|------------|
| **3D Secure (SCA)** | Authentification forte obligatoire en France | ⭐⭐⭐ |
| **AVS/CVC checks** | Vérification adresse + code de sécurité | ⭐⭐ |
| **Email confirmation** | Envoi immédiat après le don | ⭐⭐⭐ |
| **Statement descriptor clair** | `DONACTION - NomAssociation` | ⭐⭐ |
| **Radar for Fraud Teams** | Règles ML anti-fraude Stripe | ⭐⭐⭐ |
| **Blocklist** | Bloquer donateurs frauduleux récidivistes | ⭐⭐ |

> **Statistique :** Les plateformes de dons ont généralement un taux de dispute < 0.1% grâce à la nature volontaire des transactions.

###### 11.9.9 Tableau de Bord Disputes (Admin)

Prévoir une section dans le dashboard admin pour :

| Fonctionnalité | Priorité |
|----------------|----------|
| Liste des litiges en cours | ✅ P1 |
| Statut et deadline de chaque litige | ✅ P1 |
| Bouton "Voir dans Stripe Dashboard" | ✅ P1 |
| Historique des litiges fermés | ⚠️ P2 |
| Statistiques (taux de dispute, wins/losses) | ⚠️ P2 |
| Upload de preuves directement (embedded component) | ❌ P3 |

##### 11.10 Test en Mode Sandbox

###### 11.10.1 Créer un Compte Test

```bash
### Via Stripe CLI
stripe accounts create \
  --type=express \
  --country=FR \
  --capabilities[card_payments][requested]=true \
  --capabilities[transfers][requested]=true \
  --business_type=non_profit
```

###### 11.10.2 Simuler l'Onboarding

```bash
### Générer lien d'onboarding
stripe account_links create \
  --account=acct_xxx \
  --refresh_url="https://re7.donaction.fr/onboarding/refresh" \
  --return_url="https://re7.donaction.fr/onboarding/complete" \
  --type=account_onboarding
```

###### 11.10.3 Tester les Webhooks Localement

```bash
### Écouter les webhooks en local
stripe listen --forward-to localhost:1437/api/klub-don-payments/stripe-web-hooks

### Pour les événements Connect
stripe listen --forward-connect-to localhost:1437/api/stripe-connect/webhook

### Déclencher un événement test
stripe trigger payment_intent.succeeded
stripe trigger charge.dispute.created
```

###### 11.10.4 Cartes de Test

| Numéro | Résultat |
|--------|----------|
| `4242 4242 4242 4242` | Paiement réussi |
| `4000 0000 0000 0002` | Carte refusée |
| `4000 0025 0000 3155` | Requiert 3D Secure |
| `4000 0000 0000 9995` | Fonds insuffisants |
| `4000 0000 0000 0259` | **Génère un dispute** |

##### 11.11 Checklist de Configuration

```
□ Platform Profile complété
□ Account type = Express
□ Capabilities configurées (card_payments, transfers)
□ Branding configuré (logo, couleurs, nom)
□ Webhook Account créé + secret récupéré
□ Webhook Connect créé + secret récupéré (incluant dispute events)
□ Clés API Live récupérées
□ Variables d'environnement configurées
□ Test création compte Express en mode test
□ Test paiement avec destination charge en mode test
□ Test réception webhooks en mode test
□ Test simulation dispute en mode test
□ Handler dispute implémenté
□ Alertes dispute configurées
```

##### 11.12 Ressources et Liens Utiles

| Ressource | URL |
|-----------|-----|
| Dashboard Stripe | https://dashboard.stripe.com |
| Connect Settings | https://dashboard.stripe.com/settings/connect |
| Webhooks | https://dashboard.stripe.com/webhooks |
| API Keys | https://dashboard.stripe.com/apikeys |
| Documentation Connect | https://docs.stripe.com/connect |
| Express Accounts | https://docs.stripe.com/connect/express-accounts |
| Destination Charges | https://docs.stripe.com/connect/destination-charges |
| Disputes Connect | https://docs.stripe.com/connect/disputes |
| Tarification Connect | https://stripe.com/connect/pricing |
| Stripe CLI | https://docs.stripe.com/stripe-cli |

---

> **Document généré le :** 2025-01-10  
> **Auteur :** Claude (Anthropic) - Architecte Solution  
> **Statut :** Prêt pour revue et implémentation
