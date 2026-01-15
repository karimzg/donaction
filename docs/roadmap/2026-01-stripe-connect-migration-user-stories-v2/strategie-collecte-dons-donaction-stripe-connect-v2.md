# StratÃ©gie de Collecte de Dons DONACTION â€” Stripe Connect

> **Version**: 2.0.0 | **Date**: 2026-01-11 | **Statut**: Document StratÃ©gique Final

---

## 1. Executive Summary

DONACTION migre d'un modÃ¨le Stripe Standard (compte unique Fond Klubr) vers **Stripe Connect Express** pour permettre aux associations sportives franÃ§aises de recevoir les dons directement sur leurs comptes connectÃ©s. Cette transformation apporte :

- **Transparence financiÃ¨re** : Les associations reÃ§oivent 100% du montant intentionnel du don
- **ConformitÃ© fiscale** : ReÃ§us Ã©mis au nom de l'association (non plus DONACTION)
- **ModÃ¨le "Donor Pays Fee"** : Le donateur prend en charge les frais Stripe (~1.5% + 0.25â‚¬) et la commission plateforme (4%)
- **Automatisation** : PrÃ©lÃ¨vement automatique via `application_fee_amount`
- **Simplification KYC** : Onboarding hÃ©bergÃ© par Stripe (Express accounts)

L'implÃ©mentation backend est dÃ©jÃ  rÃ©alisÃ©e (Phases 1-3). Ce document consolide la stratÃ©gie complÃ¨te et identifie les ajustements nÃ©cessaires pour garantir la cohÃ©rence du systÃ¨me.

---

## 2. Architecture du Flux de Paiement

### 2.1 Parcours Donateur (5 Ã©tapes)

```mermaid
flowchart TB
    subgraph Step1["ðŸ“Š Step 1: Choix du Montant"]
        A1[SÃ©lection montant<br/>Min 10â‚¬ / Max 100kâ‚¬]
        A2[Avec rÃ©duction fiscale ?<br/>Oui/Non]
        A3[Particulier ou Entreprise ?]
        A4[Projet spÃ©cifique ?<br/>ou Don au club]
        A1 --> A2 --> A3 --> A4
    end

    subgraph Step2["ðŸ‘¤ Step 2: Informations Donateur"]
        B1{Type donateur}
        B2[Particulier<br/>Nom, PrÃ©nom, Email<br/>Date naissance, Adresse]
        B3[Entreprise<br/>Raison sociale, SIREN<br/>Forme juridique, Logo]
        B1 -->|Particulier| B2
        B1 -->|Organisme| B3
    end

    subgraph Step3["ðŸ“‹ Step 3: RÃ©capitulatif"]
        C1[Montant du don]
        C2[Contribution DONACTION<br/>optionnelle max 25â‚¬]
        C3[DÃ©composition des frais<br/>transparent]
        C4[Total Ã  payer]
        C5[âœ… Acceptation CGU]
        C1 --> C2 --> C3 --> C4 --> C5
    end

    subgraph Step4["ðŸ’³ Step 4: Paiement Stripe"]
        D1[Stripe Elements<br/>Card / Apple Pay / Google Pay]
        D2[Confirmation paiement]
        D3{RÃ©sultat}
        D4[âœ… SuccÃ¨s]
        D5[âŒ Ã‰chec + Retry]
        D1 --> D2 --> D3
        D3 -->|succeeded| D4
        D3 -->|failed| D5
    end

    subgraph Step5["ðŸŽ‰ Step 5: Confirmation"]
        E1[Message remerciement]
        E2[ðŸ“„ Attestation PDF]
        E3[ðŸ“„ ReÃ§u fiscal PDF<br/>si applicable]
        E4[Invitation crÃ©er compte]
        E1 --> E2 --> E3 --> E4
    end

    Step1 --> Step2 --> Step3 --> Step4 --> Step5
```

### 2.2 Calcul des Frais â€” ModÃ¨le "Donor Pays Fee"

#### 2.2.1 ParamÃ¨tres de Configuration

BasÃ© sur le schÃ©ma `trade_policy` existant, **avec Ã©volutions** :

| ParamÃ¨tre | Type | Valeur par dÃ©faut | Description |
|-----------|------|-------------------|-------------|
| `fee_model` | enum | `percentage_only` | Mode de calcul des frais |
| `commissionPercentage` | decimal | 6% â†’ **4%** | Commission plateforme DONACTION |
| `fixed_amount` | decimal | 0â‚¬ | Montant fixe par transaction |
| ~~`donor_pays_fee`~~ | ~~boolean~~ | ~~false~~ | **REMPLACÃ‰** par les 2 champs ci-dessous |
| `donor_pays_fee_project` | boolean | **`true`** | **NOUVEAU** - DÃ©faut pour dons Ã  un projet |
| `donor_pays_fee_club` | boolean | **`false`** | **NOUVEAU** - DÃ©faut pour dons au club |
| `allow_donor_fee_choice` | boolean | **`true`** | **NOUVEAU** - Autoriser le donateur Ã  choisir |
| `stripe_connect` | boolean | `true` | Utiliser Stripe Connect |

**Ã‰volutions clÃ©s :**
1. **DiffÃ©renciation projet/club** : Deux paramÃ¨tres distincts permettent de configurer des comportements diffÃ©rents selon le type de don
2. **Choix donateur** : Si `allow_donor_fee_choice = true`, le donateur peut modifier le comportement par dÃ©faut Ã  l'Ã©tape 3

**Note importante** : La commission actuelle de 6% doit Ãªtre revue Ã  **4%** selon les spÃ©cifications du nouveau modÃ¨le.

#### 2.2.2 Logique de DÃ©termination du `donorPaysFee`

```typescript
// helpers/fee-calculation-helper.ts
interface FeeContext {
    tradePolicy: TradePolicyEntity;
    isProjectDonation: boolean;       // true si don Ã  un projet
    donorChoice: boolean | null;      // Choix explicite du donateur (null = pas de choix)
}

function determineDonorPaysFee(context: FeeContext): boolean {
    const { tradePolicy, isProjectDonation, donorChoice } = context;
    
    // 1. Si le donateur a fait un choix explicite ET que c'est autorisÃ©
    if (donorChoice !== null && tradePolicy.allow_donor_fee_choice) {
        return donorChoice;
    }
    
    // 2. Sinon, utiliser la valeur par dÃ©faut selon le type de don
    return isProjectDonation 
        ? tradePolicy.donor_pays_fee_project 
        : tradePolicy.donor_pays_fee_club;
}
```

**Exemples de configurations :**

| ScÃ©nario | `donor_pays_fee_project` | `donor_pays_fee_club` | `allow_donor_fee_choice` | RÃ©sultat |
|----------|--------------------------|----------------------|--------------------------|----------|
| **Standard** | `true` | `false` | `true` | Projet: donateur paie (modifiable) / Club: frais dÃ©duits (modifiable) |
| **Tout transparent** | `true` | `true` | `false` | Tous les dons: donateur paie (non modifiable) |
| **Tout intÃ©grÃ©** | `false` | `false` | `false` | Tous les dons: frais dÃ©duits (non modifiable) |
| **Flexible total** | `true` | `false` | `true` | DÃ©fauts diffÃ©rents, donateur choisit toujours |

#### 2.2.3 Formules de Calcul

**Variables :**
- `MONTANT_SAISI` = Montant saisi par le donateur dans le formulaire
- `CONTRIBUTION_DONACTION` = Contribution optionnelle Ã  la plateforme (0-25â‚¬)
- `TAUX_COMMISSION` = 4% (commission DONACTION)
- `TAUX_STRIPE` = 1.5% + 0.25â‚¬ (frais Stripe standard EU)

---

**ScÃ©nario A : Donor Pays Fee = TRUE** (dÃ©faut projets)
> *"Je donne 100â‚¬, l'association reÃ§oit 100â‚¬, je paie les frais en plus"*

```
MONTANT_DON_REEL = MONTANT_SAISI (inchangÃ©)
Commission DONACTION = MONTANT_DON_REEL Ã— 4%
Frais Stripe estimÃ©s = (MONTANT_DON_REEL + CONTRIBUTION) Ã— 1.5% + 0.25â‚¬
Application Fee = Commission + Frais Stripe

TOTAL_PRELEVE = MONTANT_DON_REEL + CONTRIBUTION + Application Fee
NET_ASSOCIATION = MONTANT_DON_REEL (100%)
MONTANT_RECU_FISCAL = MONTANT_DON_REEL (100â‚¬)
```

**Exemple (Don 100â‚¬ + Contribution 10â‚¬, Donor Pays Fee = TRUE) :**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ’³ CE QUE LE DONATEUR PAIE                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Montant du don                    : 100,00 â‚¬               â”‚
â”‚  Contribution DONACTION            :  10,00 â‚¬               â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€              â”‚
â”‚  Sous-total                        : 110,00 â‚¬               â”‚
â”‚                                                             â”‚
â”‚  + Frais de traitement (4% + Stripe)                        â”‚
â”‚    Commission plateforme (4%)      :   4,00 â‚¬               â”‚
â”‚    Frais bancaires (~1.5% + 0.25â‚¬) :   1,90 â‚¬               â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€              â”‚
â”‚  TOTAL DÃ‰BITÃ‰                      : 115,90 â‚¬               â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ“Š RÃ‰PARTITION                                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  â†’ Association reÃ§oit     : 100,00 â‚¬ (100% de votre don)    â”‚
â”‚  â†’ DONACTION reÃ§oit       :  14,00 â‚¬ (contribution + comm.) â”‚
â”‚  â†’ Stripe prÃ©lÃ¨ve         :  ~1,90 â‚¬ (frais bancaires)      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  ðŸ“„ REÃ‡U FISCAL           : 100,00 â‚¬                        â”‚
â”‚     RÃ©duction d'impÃ´ts    :  66,00 â‚¬ (particulier)          â”‚
â”‚     CoÃ»t rÃ©el du don      :  49,90 â‚¬ (115,90 - 66)          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

**Scénario B : Donor Pays Fee = FALSE** (défaut club)
> *"Je donne 100€ tout compris, l'association reçoit le net après frais"*

**⚠️ Point technique critique : Gestion des frais Stripe**

Avec Stripe Connect en mode **Destination Charges**, les frais Stripe sont toujours déduits du solde de la **plateforme** (DONACTION), pas du compte connecté. Pour que DONACTION maintienne sa commission de 4% net, l'`application_fee_amount` doit inclure les frais Stripe estimés.

```
MONTANT_DON_BRUT = MONTANT_SAISI
Commission DONACTION = MONTANT_DON_BRUT × 4%
Frais Stripe estimés = (TOTAL_PRELEVE × 1.5%) + 0.25€

// L'application_fee inclut commission + frais Stripe pour garantir 4% net à DONACTION
Application Fee = Commission + Frais Stripe estimés

TOTAL_PRELEVE = MONTANT_DON_BRUT + CONTRIBUTION
NET_ASSOCIATION = MONTANT_DON_BRUT - Application Fee
MONTANT_RECU_FISCAL = NET_ASSOCIATION
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
│  📊 CALCUL DE L'APPLICATION FEE                             │
├─────────────────────────────────────────────────────────────┤
│  Commission DONACTION (4%)         :   4,00 €               │
│  Frais Stripe estimés              :   1,90 €               │
│  (110€ × 1.5% + 0.25€)                                      │
│  ─────────────────────────────────────────────              │
│  application_fee_amount            :   5,90 €               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📊 RÉPARTITION FINALE                                      │
├─────────────────────────────────────────────────────────────┤
│  → Association reçoit     :  94,10 € (100 - 5,90€)          │
│  → DONACTION reçoit brut  :  15,90 € (contribution + 5,90€) │
│  → Stripe prélève         :  ~1,90 € (sur DONACTION)        │
│  → DONACTION net          :  14,00 € (4€ commission + 10€)  │
├─────────────────────────────────────────────────────────────┤
│  📄 REÇU FISCAL           :  94,10 € (montant net reçu)     │
│     Réduction d'impôts    :  62,11 € (particulier)          │
│     Coût réel du don      :  47,89 € (110 - 62,11)          │
└─────────────────────────────────────────────────────────────┘
```

**Note importante** : Dans ce scénario, l'association reçoit moins (94,10€ au lieu de 96€) mais DONACTION garantit sa commission de 4% net. Le reçu fiscal reflète exactement ce que l'association reçoit réellement.


---

**âš ï¸ Point clÃ© : Impact sur le ReÃ§u Fiscal**

| ScÃ©nario | Montant reÃ§u fiscal | Justification |
|----------|---------------------|---------------|
| **Donor Pays Fee = TRUE** | 100% du montant saisi | L'association reÃ§oit l'intÃ©gralitÃ© |
| **Donor Pays Fee = FALSE** | Montant net (~94%) | Le reÃ§u doit reflÃ©ter ce que l'association reÃ§oit rÃ©ellement |

Le reÃ§u fiscal doit **toujours** correspondre au montant effectivement reÃ§u par l'association pour Ãªtre conforme aux exigences Cerfa.

### 2.3 UX Formulaire â€” Choix Donor Pays Fee (Step 3)

#### 2.3.1 Condition d'Affichage

Le choix n'est affichÃ© que si `trade_policy.allow_donor_fee_choice = true`. Sinon, la valeur par dÃ©faut (projet ou club) s'applique automatiquement.

#### 2.3.2 Maquette UI

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ“‹ RÃ‰CAPITULATIF DE VOTRE DON                                      â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                     â”‚
â”‚  BÃ©nÃ©ficiaire : FC Lyon                                             â”‚
â”‚  Projet : Nouveau terrain synthÃ©tique (ou "Fonctionnement gÃ©nÃ©ral") â”‚
â”‚                                                                     â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                                     â”‚
â”‚  Montant de votre don                              100,00 â‚¬         â”‚
â”‚  Contribution Ã  DONACTION (optionnel)        [â”â”â”â”â—‹â”â”] 10,00 â‚¬      â”‚
â”‚                                                                     â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                                     â”‚
â”‚  ðŸ’¡ COMMENT SOUHAITEZ-VOUS GÃ‰RER LES FRAIS DE TRAITEMENT ?          â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚ â—‰ Je paie les frais en plus de mon don                      â”‚    â”‚
â”‚  â”‚   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€     â”‚    â”‚
â”‚  â”‚   L'association reÃ§oit 100% de votre don (100,00â‚¬)          â”‚    â”‚
â”‚  â”‚   Frais de traitement : +4,00â‚¬                              â”‚    â”‚
â”‚  â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚    â”‚
â”‚  â”‚   â”‚ ReÃ§u fiscal : 100,00â‚¬ â€¢ Total dÃ©bitÃ© : 114,00â‚¬   â”‚     â”‚    â”‚
â”‚  â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                     â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚ â—‹ J'intÃ¨gre les frais au montant de mon don                 â”‚    â”‚
â”‚  â”‚   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€     â”‚    â”‚
â”‚  â”‚   L'association reÃ§oit votre don moins les frais (96,00â‚¬)   â”‚    â”‚
â”‚  â”‚   Frais de traitement : -4,00â‚¬ (dÃ©duits)                    â”‚    â”‚
â”‚  â”‚   â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”‚    â”‚
â”‚  â”‚   â”‚ ReÃ§u fiscal : 96,00â‚¬ â€¢ Total dÃ©bitÃ© : 110,00â‚¬    â”‚     â”‚    â”‚
â”‚  â”‚   â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                     â”‚
â”‚  â„¹ï¸  Les frais (4%) couvrent les coÃ»ts bancaires et le             â”‚
â”‚     fonctionnement de la plateforme DONACTION.                      â”‚
â”‚                                                                     â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€  â”‚
â”‚                                                                     â”‚
â”‚  â˜‘ï¸ J'accepte les CGU                                               â”‚
â”‚  â˜‘ï¸ Je comprends que mon don sera versÃ© au Fonds de dotation        â”‚
â”‚                                                                     â”‚
â”‚  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•    â”‚
â”‚  â”‚ TOTAL Ã€ PAYER                                      114,00â‚¬ â”‚    â”‚
â”‚  â”‚ RÃ©duction d'impÃ´ts (66%)                           -66,00â‚¬ â”‚    â”‚
â”‚  â”‚ COÃ›T RÃ‰EL DE VOTRE DON                              48,00â‚¬ â”‚    â”‚
â”‚  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•    â”‚
â”‚                                                                     â”‚
â”‚                    [ â† Retour ]      [ Payer 114,00â‚¬ â†’ ]            â”‚
â”‚                                                                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 2.3.3 ImplÃ©mentation Svelte (Step 3)

```svelte
<!-- step3.svelte -->
<script lang="ts">
    import { DEFAULT_VALUES, SUBSCRIPTION } from '../logic/useSponsorshipForm.svelte';
    
    // DÃ©terminer si c'est un don projet ou club
    $: isProjectDonation = SUBSCRIPTION.project?.uuid 
        && SUBSCRIPTION.project.uuid !== SUBSCRIPTION.klubr.uuid;
    
    // RÃ©cupÃ©rer la trade policy
    $: tradePolicy = SUBSCRIPTION.klubr?.trade_policy;
    
    // Valeur par dÃ©faut selon type de don
    $: defaultDonorPaysFee = isProjectDonation 
        ? tradePolicy?.donor_pays_fee_project ?? true
        : tradePolicy?.donor_pays_fee_club ?? false;
    
    // Choix du donateur (initialisÃ© au dÃ©faut)
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
        <h4>ðŸ’¡ Comment souhaitez-vous gÃ©rer les frais de traitement ?</h4>
        
        <label class="fee-option" class:selected={donorPaysFee}>
            <input type="radio" bind:group={donorPaysFee} value={true} />
            <div class="fee-option-content">
                <strong>Je paie les frais en plus de mon don</strong>
                <p>L'association reÃ§oit 100% de votre don ({feeBreakdown.receiptWithFee.toFixed(2)}â‚¬)</p>
                <div class="fee-summary">
                    <span>ReÃ§u fiscal : {feeBreakdown.receiptWithFee.toFixed(2)}â‚¬</span>
                    <span>Total dÃ©bitÃ© : {feeBreakdown.totalWithFee.toFixed(2)}â‚¬</span>
                </div>
            </div>
        </label>
        
        <label class="fee-option" class:selected={!donorPaysFee}>
            <input type="radio" bind:group={donorPaysFee} value={false} />
            <div class="fee-option-content">
                <strong>J'intÃ¨gre les frais au montant de mon don</strong>
                <p>L'association reÃ§oit votre don moins les frais ({feeBreakdown.receiptWithoutFee.toFixed(2)}â‚¬)</p>
                <div class="fee-summary">
                    <span>ReÃ§u fiscal : {feeBreakdown.receiptWithoutFee.toFixed(2)}â‚¬</span>
                    <span>Total dÃ©bitÃ© : {feeBreakdown.totalWithoutFee.toFixed(2)}â‚¬</span>
                </div>
            </div>
        </label>
        
        <p class="fee-info">
            â„¹ï¸ Les frais (4%) couvrent les coÃ»ts bancaires et le fonctionnement de DONACTION.
        </p>
    </div>
{/if}
```

#### 2.3.4 Mise Ã  jour du SchÃ©ma `klub-don`

Ajouter le champ pour stocker le choix du donateur :

```typescript
// api/klub-don/content-types/klub-don/schema.json
{
    "donor_pays_fee": {
        "type": "boolean",
        "required": false,
        "default": null  // null = utiliser la valeur par dÃ©faut de trade_policy
    }
}
```

#### 2.3.5 ImplÃ©mentation Backend (ContrÃ´leur mis Ã  jour)

Le code dans `klub-don-payment.controller.ts` doit Ãªtre mis Ã  jour pour gÃ©rer la nouvelle logique :

```typescript
// helpers/stripe-connect-helper.ts

/**
 * DÃ©termine si le donateur paie les frais
 * Prend en compte : choix explicite du donateur > dÃ©faut selon type de don
 */
export function determineDonorPaysFee(
    klubDon: KlubDonEntity,
    tradePolicy: TradePolicyEntity
): boolean {
    // 1. Si le donateur a fait un choix explicite (stockÃ© dans klub_don)
    if (klubDon.donor_pays_fee !== null && klubDon.donor_pays_fee !== undefined) {
        // VÃ©rifier que le choix est autorisÃ©
        if (tradePolicy.allow_donor_fee_choice) {
            return klubDon.donor_pays_fee;
        }
    }
    
    // 2. Sinon, utiliser la valeur par dÃ©faut selon le type de don
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
// klub-don-payment.controller.ts - createPaymentIntent() mis Ã  jour
async createPaymentIntent() {
    const ctx = strapi.requestContext.get();
    try {
        const { price, metadata, idempotencyKey } = ctx.request.body;
        // Note: donorPaysFee n'est plus passÃ© directement, on le rÃ©cupÃ¨re du don

        // ... validations existantes ...

        // RÃ©cupÃ©rer le don avec son choix donor_pays_fee
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

        // DÃ©terminer le donor_pays_fee effectif
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

            console.log('\nðŸ’³ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
            console.log('ðŸ’³ CRÃ‰ATION PAYMENT INTENT (STRIPE CONNECT)');
            console.log(`ðŸ’³ Montant base: ${price}â‚¬`);
            console.log(`ðŸ’³ Type don: ${klubDon.klub_projet ? 'Projet' : 'Club'}`);
            console.log(`ðŸ’³ Donor pays fee: ${actualDonorPaysFee}`);
            console.log(`ðŸ’³ Application fee: ${applicationFeeAmount / 100}â‚¬`);
            console.log(`ðŸ’³ Total prÃ©levÃ©: ${amountInCents / 100}â‚¬`);
            console.log('ðŸ’³ â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

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

### 2.4 Organisation des Champs `trade_policy`

Le champ `stripe_connect` dÃ©termine deux modes de fonctionnement radicalement diffÃ©rents :

| Mode | `stripe_connect` | Flux Financier | Facturation |
|------|------------------|----------------|-------------|
| **Stripe Connect** | `true` | Paiement direct vers association, frais prÃ©levÃ©s automatiquement via `application_fee_amount` | **Aucune** - RelevÃ© de frais informatif uniquement |
| **Stripe Classic (Legacy)** | `false` | Paiement vers compte unique DONACTION, redistribution mensuelle | **Facturation mensuelle** aux associations |

#### 2.4.1 Champs COMMUNS (les deux modes)

| Champ | Type | DÃ©faut | Description |
|-------|------|--------|-------------|
| `uuid` | UUID | auto | Identifiant unique |
| `tradePolicyLabel` | string | - | Nom de la politique (ex: "Standard", "Partenaire", "Premium") |
| `defaultTradePolicy` | boolean | `false` | Politique par dÃ©faut pour les nouveaux clubs |
| `allowKlubrContribution` | boolean | `true` | Autoriser la contribution optionnelle Ã  DONACTION (0-25â‚¬) |
| `stripe_connect` | boolean | `true` | **Switch principal** : `true` = Connect, `false` = Classic |

#### 2.4.2 Champs STRIPE CONNECT (`stripe_connect = true`)

Ces champs gÃ¨rent le prÃ©lÃ¨vement automatique des frais via Stripe.

| Champ | Type | DÃ©faut | Description |
|-------|------|--------|-------------|
| `fee_model` | enum | `percentage_only` | Mode de calcul : `percentage_only`, `fixed_only`, `percentage_plus_fixed` |
| `commissionPercentage` | decimal | 4 | % de commission DONACTION (utilisÃ© si fee_model inclut percentage) |
| `fixed_amount` | decimal | 0 | Montant fixe en â‚¬ (utilisÃ© si fee_model inclut fixed) |
| `donor_pays_fee_project` | boolean | `true` | **NOUVEAU** - DÃ©faut pour dons projet : donateur paie les frais |
| `donor_pays_fee_club` | boolean | `false` | **NOUVEAU** - DÃ©faut pour dons club : frais dÃ©duits du don |
| `allow_donor_fee_choice` | boolean | `true` | **NOUVEAU** - Autoriser le donateur Ã  modifier le dÃ©faut |

**Logique Stripe Connect :**
- Les frais sont calculÃ©s selon `fee_model` + `commissionPercentage` + `fixed_amount`
- Le mode `donor_pays_fee` est dÃ©terminÃ© par : choix donateur > dÃ©faut projet/club
- Pas de facturation : Stripe prÃ©lÃ¨ve automatiquement via `application_fee_amount`
- RelevÃ© de frais mensuel **informatif** (pas une facture)

#### 2.4.3 Champs STRIPE CLASSIC / LEGACY (`stripe_connect = false`)

Ces champs gÃ¨rent la facturation mensuelle traditionnelle.

| Champ | Type | DÃ©faut | Description |
|-------|------|--------|-------------|
| `noBilling` | boolean | `false` | Si `true`, pas de facturation (club exonÃ©rÃ©) |
| `commissionPercentage` | decimal | 6 | % de commission sur les dons (pour facturation) |
| `VATPercentage` | decimal | 20 | % TVA appliquÃ©e sur la commission |
| `reference` | string | - | RÃ©fÃ©rence affichÃ©e sur la facture |
| `billingDescription` | string | - | Description ligne de facturation |
| `perDonationCost` | decimal | 0 | CoÃ»t fixe par don (en plus du %) |
| `klubDonationReference` | string | - | RÃ©fÃ©rence pour la ligne contribution Klubr |
| `klubDonationDescription` | string | - | Description ligne contribution Klubr |
| `klubDonationPercentage` | decimal | 0 | % spÃ©cifique pour contributions Klubr |

**Logique Stripe Classic :**
- DONACTION collecte tous les paiements sur son compte unique
- Facture mensuelle gÃ©nÃ©rÃ©e pour chaque club
- Redistribution aprÃ¨s paiement de la facture

#### 2.4.4 Champ PartagÃ© avec Usage DiffÃ©rent

| Champ | Stripe Connect | Stripe Classic |
|-------|----------------|----------------|
| `commissionPercentage` | UtilisÃ© pour `application_fee_amount` (prÃ©lÃ¨vement auto, dÃ©faut 4%) | UtilisÃ© pour calcul facture mensuelle (dÃ©faut 6%) |

#### 2.4.5 SchÃ©ma Visuel

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                        TRADE POLICY SCHEMA                              â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                         â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚                    COMMUNS (tous modes)                         â”‚    â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤    â”‚
â”‚  â”‚  uuid, tradePolicyLabel, defaultTradePolicy,                    â”‚    â”‚
â”‚  â”‚  allowKlubrContribution, stripe_connect                         â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                              â”‚                                          â”‚
â”‚               â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”                           â”‚
â”‚               â–¼                              â–¼                          â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”‚
â”‚  â”‚   STRIPE CONNECT        â”‚    â”‚      STRIPE CLASSIC (Legacy)    â”‚    â”‚
â”‚  â”‚   stripe_connect=true   â”‚    â”‚      stripe_connect=false       â”‚    â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤    â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤    â”‚
â”‚  â”‚  fee_model              â”‚    â”‚  noBilling                      â”‚    â”‚
â”‚  â”‚  commissionPercentage*  â”‚    â”‚  commissionPercentage*          â”‚    â”‚
â”‚  â”‚  fixed_amount           â”‚    â”‚  VATPercentage                  â”‚    â”‚
â”‚  â”‚  donor_pays_fee_project â”‚    â”‚  reference                      â”‚    â”‚
â”‚  â”‚  donor_pays_fee_club    â”‚    â”‚  billingDescription             â”‚    â”‚
â”‚  â”‚  allow_donor_fee_choice â”‚    â”‚  perDonationCost                â”‚    â”‚
â”‚  â”‚                         â”‚    â”‚  klubDonationReference          â”‚    â”‚
â”‚  â”‚                         â”‚    â”‚  klubDonationDescription        â”‚    â”‚
â”‚  â”‚                         â”‚    â”‚  klubDonationPercentage         â”‚    â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â”‚
â”‚                                                                         â”‚
â”‚  * commissionPercentage : usage diffÃ©rent selon le mode                 â”‚
â”‚                                                                         â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 2.4.6 Recommandations d'ImplÃ©mentation

1. **Conserver tous les champs legacy** pour la rÃ©trocompatibilitÃ© (clubs non migrÃ©s vers Connect)
2. **Supprimer l'ancien `donor_pays_fee`** unique et le remplacer par les 3 nouveaux champs
3. **Dashboard Admin** : Masquer dynamiquement les champs non pertinents selon `stripe_connect`
4. **Valeur par dÃ©faut** : Nouveaux clubs crÃ©Ã©s avec `stripe_connect = true`
5. **Migration** : Script pour migrer les `trade_policy` existantes (voir section 9.5)

---

### 2.5 Configuration Stripe Connect

#### 2.5.1 Type de Charge : Destination Charges

**Choix retenu : Destination Charges** (confirmÃ© par l'implÃ©mentation actuelle)

| Type | Avantages | InconvÃ©nients |
|------|-----------|---------------|
| **Direct Charges** | Association gÃ¨re tout | Complexe pour non-tech |
| **Destination Charges** âœ… | Simple, DONACTION contrÃ´le | Moins de flexibilitÃ© |
| **Separate Charges & Transfers** | ContrÃ´le total | Plus complexe Ã  implÃ©menter |

**Justification du choix :**
1. DONACTION reste le "merchant of record" (responsable lÃ©gal)
2. L'`application_fee_amount` est prÃ©levÃ© automatiquement
3. Stripe gÃ¨re les soldes nÃ©gatifs (paramÃ¨tre `controller.losses.payments`)
4. Simplification du reporting et de la rÃ©conciliation

#### 2.5.2 ParamÃ¨tres de l'appel API PaymentIntent.create()

```typescript
// ImplÃ©mentation confirmÃ©e dans klub-don-payment.controller.ts
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

#### 2.5.3 Gestion des Soldes NÃ©gatifs

Lors de la crÃ©ation du compte Express, configurer :

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

## 3. Webhooks et Idempotence

### 3.1 Matrice des Ã‰vÃ©nements Webhook

#### 3.1.1 Ã‰vÃ©nements Compte ConnectÃ©

| Ã‰vÃ©nement | Source | Action Backend | CriticitÃ© | Retry |
|-----------|--------|----------------|-----------|-------|
| `account.updated` | Connect | Sync statut KYC, `charges_enabled`, `payouts_enabled` | **Haute** | Oui |
| `account.application.deauthorized` | Connect | DÃ©sactiver compte, notifier admin | **Haute** | Oui |
| `capability.updated` | Connect | Mettre Ã  jour `capabilities` JSON | Moyenne | Oui |
| `person.created` | Connect | Log audit (KYC progression) | Basse | Non |
| `person.updated` | Connect | Log audit | Basse | Non |

#### 3.1.2 Ã‰vÃ©nements Paiement

| Ã‰vÃ©nement | Source | Action Backend | CriticitÃ© | Retry |
|-----------|--------|----------------|-----------|-------|
| `payment_intent.created` | Plateforme | Update `klub_don_payment` status â†’ `pending` | Moyenne | Oui |
| `payment_intent.succeeded` | Plateforme | **CRITIQUE** : Update status â†’ `success`, gÃ©nÃ©rer PDFs, envoyer emails | **Critique** | Oui |
| `payment_intent.payment_failed` | Plateforme | Update status â†’ `error`, stocker `error_code` | **Haute** | Oui |
| `charge.refunded` | Plateforme | **CRITIQUE** : Workflow remboursement exceptionnel | **Critique** | Oui |
| `charge.dispute.created` | Plateforme | Alerter admin, geler remboursement | **Haute** | Oui |
| `transfer.created` | Connect | Log transfert vers association | Moyenne | Non |
| `payout.paid` | Connect | Log virement bancaire association | Moyenne | Non |
| `payout.failed` | Connect | Alerter admin + association | **Haute** | Oui |

### 3.2 StratÃ©gie d'Idempotence

#### 3.2.1 Format de la ClÃ© d'Idempotence

**Pattern recommandÃ© :**

```
{donUuid}-{timestamp}-{action}
```

**Exemples :**
- `abc123-1704812400000-create` (crÃ©ation initiale)
- `abc123-1704812400000-retry-1` (premiÃ¨re tentative retry)
- `abc123-1704812400000-retry-2` (deuxiÃ¨me tentative retry)

#### 3.2.2 ImplÃ©mentation

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

#### 3.2.3 DurÃ©e de ValiditÃ©

- **PaymentIntent** : 24 heures (durÃ©e standard Stripe)
- **RÃ©utilisation du `client_secret`** : AutorisÃ©e si PaymentIntent non expirÃ©
- **ClÃ© d'idempotence Stripe** : 24 heures (limite Stripe)

### 3.3 SchÃ©ma de la Table `webhook_logs`

```typescript
// Nouveau content-type Ã  crÃ©er: api::webhook-log.webhook-log

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

**Index recommandÃ©s :**
```sql
CREATE INDEX idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at);
```

### 3.4 Endpoint Webhook Connect

CrÃ©er un nouvel endpoint dÃ©diÃ© aux webhooks des comptes connectÃ©s :

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
        console.error('âš ï¸ Webhook signature verification failed:', err.message);
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
        // ... autres Ã©vÃ©nements
    }

    ctx.send({ received: true });
}
```

---

## 4. Onboarding Association

### 4.1 Parcours en 3 Phases

```mermaid
flowchart TB
    subgraph PhaseA["ðŸ“‹ Phase A: Informations Association"]
        A1[Inscription initiale<br/>Next.js Frontend]
        A2[CrÃ©ation User + Klubr<br/>+ Connected Account]
        A3[Email avec lien activation]
        A4[Connexion Dashboard Angular]
        A5[ComplÃ©ter infos obligatoires]
        A6[requiredFieldsCompletion = 100%]
        A1 --> A2 --> A3 --> A4 --> A5 --> A6
    end

    subgraph PhaseB["ðŸ“ Phase B: Documents Juridiques"]
        B1[Upload statuts association]
        B2[Upload rÃ©cÃ©pissÃ© prÃ©fecture]
        B3[Upload RIB association]
        B4[Upload signature responsable]
        B5[Validation manuelle DONACTION]
        B6[requiredDocsValidatedCompletion = 100%]
        B1 --> B2 --> B3 --> B4 --> B5 --> B6
    end

    subgraph PhaseC["ðŸ’³ Phase C: Activation Stripe"]
        C1[Clic 'Activer compte paiement']
        C2[GÃ©nÃ©ration lien onboarding Stripe]
        C3[Onboarding hÃ©bergÃ© Stripe<br/>KYC, coordonnÃ©es bancaires]
        C4[Webhook account.updated]
        C5{charges_enabled?}
        C6[âœ… COMPTE ACTIF<br/>Collecte possible]
        C7[âš ï¸ KYC incomplet<br/>Relancer onboarding]
        C1 --> C2 --> C3 --> C4 --> C5
        C5 -->|true| C6
        C5 -->|false| C7 --> C2
    end

    PhaseA --> PhaseB --> PhaseC
```

### 4.2 Phase A â€” Informations Association

#### 4.2.1 Champs Requis pour `requiredFieldsCompletion = 100%`

| Champ | Type | Obligatoire | Validation |
|-------|------|-------------|------------|
| `denomination` | string | âœ… | Min 3 caractÃ¨res |
| `acronyme` | string | âŒ | - |
| `adresse` | string | âœ… | Adresse complÃ¨te |
| `codePostal` | string | âœ… | Format FR (5 chiffres) |
| `ville` | string | âœ… | - |
| `pays` | string | âœ… | Default: France |
| `numeroRNA` | string | âœ… | Format W + 9 chiffres |
| `SIREN` | string | âœ… | 9 chiffres, validÃ© via API |
| `legalStatus` | enum | âœ… | Association loi 1901, etc. |
| `sportType` | relation | âœ… | Type de sport |
| `email` | email | âœ… | Email de contact |
| `telephone` | string | âœ… | Format FR |
| `objetAssociation` | text | âœ… | Min 50 caractÃ¨res |
| `logo` | media | âœ… | Image (PNG, JPG) |

#### 4.2.2 Calcul du Pourcentage de ComplÃ©tion

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

### 4.3 Phase B â€” Documents Juridiques

#### 4.3.1 Liste des Documents Requis

| Document | Champ | Format | Validation |
|----------|-------|--------|------------|
| Statuts Ã  jour | `statutsDocument` | PDF | Signature + date |
| RÃ©cÃ©pissÃ© prÃ©fecture | `recepisseDocument` | PDF | NumÃ©ro RNA lisible |
| RIB association | `ribDocument` | PDF/Image | IBAN FR valide |
| **Signature responsable** | `managerSignature` | PNG/JPG | **NOUVEAU** - Pour reÃ§u fiscal |
| PV derniÃ¨re AG | `pvAgDocument` | PDF | Date < 2 ans |

#### 4.3.2 Nouveau Champ : `managerSignature`

```typescript
// klubr/content-types/klubr/schema.json - Ã€ AJOUTER
{
    "managerSignature": {
        "type": "media",
        "allowedTypes": ["images"],
        "required": false
    }
}
```

**SpÃ©cifications :**
- Format : PNG ou JPG avec fond transparent recommandÃ©
- Taille : Max 500x200 pixels
- Usage : Incrustation sur le reÃ§u fiscal Cerfa

#### 4.3.3 Processus de Validation Manuelle

1. Association uploade les documents
2. Notification email Ã  l'admin DONACTION
3. Admin vÃ©rifie dans `/admin/klub/listing`
4. Actions possibles :
   - âœ… Valider â†’ `requiredDocsValidatedCompletion = 100%`
   - âŒ Rejeter â†’ Email avec motif + demande nouvelle version
   - â³ En attente â†’ Demande de complÃ©ment

### 4.4 Phase C â€” Activation Compte Stripe

#### 4.4.1 CrÃ©ation du Compte Express

```typescript
// api/stripe-connect/services/stripe-connect.ts
async createConnectedAccount(klubr: KlubrEntity): Promise<ConnectedAccountEntity> {
    // VÃ©rifier prÃ©-requis
    if (klubr.requiredFieldsCompletion < 100) {
        throw new Error('Informations association incomplÃ¨tes');
    }

    // CrÃ©er compte Stripe Express
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

    // CrÃ©er entrÃ©e connected_account
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

#### 4.4.2 GÃ©nÃ©ration du Lien d'Onboarding

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
        return ctx.badRequest('Compte Stripe non crÃ©Ã©');
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

### 4.5 Checklist d'Activation ComplÃ¨te

**Conditions pour activer la collecte de dons :**

```typescript
function canAcceptDonations(klubr: KlubrEntity): {
    eligible: boolean;
    reasons: string[];
} {
    const reasons: string[] = [];

    // VÃ©rifications klubr
    if (klubr.requiredFieldsCompletion < 100) {
        reasons.push(`Informations incomplÃ¨tes (${klubr.requiredFieldsCompletion}%)`);
    }
    if (klubr.requiredDocsValidatedCompletion < 100) {
        reasons.push(`Documents non validÃ©s (${klubr.requiredDocsValidatedCompletion}%)`);
    }
    if (!klubr.donationEligible) {
        reasons.push('Collecte de dons non activÃ©e par admin');
    }
    if (klubr.status !== 'published') {
        reasons.push('Profil non publiÃ©');
    }

    // VÃ©rifications Stripe Connect
    const connectedAccount = klubr.connected_account;
    if (!connectedAccount) {
        reasons.push('Compte Stripe non crÃ©Ã©');
    } else {
        if (!connectedAccount.charges_enabled) {
            reasons.push('Paiements non activÃ©s sur Stripe');
        }
        if (connectedAccount.account_status === 'restricted') {
            reasons.push('Compte Stripe restreint');
        }
        if (connectedAccount.account_status === 'disabled') {
            reasons.push('Compte Stripe dÃ©sactivÃ©');
        }
    }

    return {
        eligible: reasons.length === 0,
        reasons,
    };
}
```

### 4.6 Widget de Progression Dashboard

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
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ“Š Statut d'Activation                                 â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  Informations Klub    â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘  75%   [â†’]       â”‚
â”‚  Documents            â–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–ˆâ–‘â–‘â–‘â–‘â–‘â–‘  60%   [â†’]       â”‚
â”‚  Compte Paiement      â³ En attente KYC       [â†’]       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  âš ï¸ Action requise: ComplÃ©ter les informations          â”‚
â”‚     [ComplÃ©ter mon profil]                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## 5. Documents Fiscaux

### 5.1 ReÃ§u Fiscal Cerfa

#### 5.1.1 Changements Majeurs

| Aspect | Ancien ModÃ¨le | Nouveau ModÃ¨le |
|--------|---------------|----------------|
| **Ã‰metteur** | DONACTION (Fond Klubr) | Association bÃ©nÃ©ficiaire |
| **Signature** | Signature DONACTION | `managerSignature` de l'association |
| **Montant** | Montant brut | Montant net reÃ§u (= intentionnel si donorPaysFee) |
| **NumÃ©ro SIREN** | SIREN DONACTION | SIREN Association |

#### 5.1.2 Structure du ReÃ§u

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                    REÃ‡U AU TITRE DES DONS                       â”‚
â”‚            Ã€ UN ORGANISME D'INTÃ‰RÃŠT GÃ‰NÃ‰RAL                     â”‚
â”‚                    (Article 200-1 du CGI)                       â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                 â”‚
â”‚  BÃ‰NÃ‰FICIAIRE DU DON                                            â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                                          â”‚
â”‚  Nom: [klubr.denomination]                                      â”‚
â”‚  Adresse: [klubr.adresse], [klubr.codePostal] [klubr.ville]     â”‚
â”‚  SIREN: [klubr.SIREN]                                           â”‚
â”‚  Objet: [klubr.objetAssociation]                                â”‚
â”‚                                                                 â”‚
â”‚  DONATEUR                                                       â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€                                                       â”‚
â”‚  [Si particulier]                                               â”‚
â”‚  CivilitÃ©: [donateur.civilite]                                  â”‚
â”‚  Nom: [donateur.nom] [donateur.prenom]                          â”‚
â”‚  Adresse: [donateur.adresse], [donateur.cp] [donateur.ville]    â”‚
â”‚                                                                 â”‚
â”‚  [Si organisme]                                                 â”‚
â”‚  Raison sociale: [donateur.raisonSocial]                        â”‚
â”‚  SIREN: [donateur.SIREN]                                        â”‚
â”‚  Adresse: [donateur.adresse], [donateur.cp] [donateur.ville]    â”‚
â”‚                                                                 â”‚
â”‚  DON                                                            â”‚
â”‚  â”€â”€â”€                                                            â”‚
â”‚  Date: [don.datePaiment]                                        â”‚
â”‚  Montant: [montant_en_chiffres] â‚¬ ([montant_en_lettres] euros)  â”‚
â”‚  Mode de versement: Paiement en ligne (carte bancaire)          â”‚
â”‚  Nature du don: NumÃ©raire                                       â”‚
â”‚                                                                 â”‚
â”‚  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•    â”‚
â”‚  Le bÃ©nÃ©ficiaire certifie que le don n'ouvre droit Ã  aucune     â”‚
â”‚  contrepartie directe ou indirecte au profit du donateur.       â”‚
â”‚                                                                 â”‚
â”‚  Signature du responsable:                                      â”‚
â”‚  [Image: klubr.managerSignature]                                â”‚
â”‚                                                                 â”‚
â”‚  NumÃ©ro d'ordre: R-[attestationNumber]                          â”‚
â”‚  Date d'Ã©mission: [date_generation]                             â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚  [Si particulier] Article 200 du CGI - RÃ©duction 66%            â”‚
â”‚  [Si organisme]   Article 238 bis du CGI - RÃ©duction 60%        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 5.1.3 Calcul du Montant sur le ReÃ§u

```typescript
function getReceiptAmount(don: KlubDonEntity, tradePolicy: TradePolicyEntity): number {
    // Si Donor Pays Fee : le montant du reÃ§u = montant intentionnel
    if (tradePolicy.donor_pays_fee) {
        return don.montant; // Montant original sans frais
    }
    
    // Si frais dÃ©duits : montant = ce que l'association reÃ§oit vraiment
    const applicationFee = calculateApplicationFee(don.montant * 100, tradePolicy) / 100;
    return don.montant - applicationFee;
}
```

**Important :** Avec le modÃ¨le "Donor Pays Fee", le reÃ§u fiscal correspond exactement au montant que le donateur a voulu donner, ce qui est plus transparent et cohÃ©rent.

#### 5.1.4 GÃ©nÃ©ration PDF

```typescript
// helpers/klubrPDF/generateInvoice/index.ts - Ã€ MODIFIER
async function generateRecuFiscal(don: KlubDonEntity): Promise<string> {
    const klubr = don.klubr;
    const donateur = don.klubDonateur;
    const tradePolicy = klubr.trade_policy;
    
    // Charger le template appropriÃ©
    const templatePath = donateur.donateurType === 'Organisme'
        ? 'templates/recu-pro-template.pdf'
        : 'templates/recu-template.pdf';
    
    // Calculer le montant Ã  afficher
    const montantRecu = getReceiptAmount(don, tradePolicy);
    
    // Charger la signature du responsable
    const signatureImage = await loadImage(klubr.managerSignature?.url);
    
    // GÃ©nÃ©rer le PDF avec les donnÃ©es de l'ASSOCIATION (pas DONACTION)
    const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
    const form = pdfDoc.getForm();
    
    // DonnÃ©es Ã©metteur = Association
    form.getTextField('emetteur_nom').setText(klubr.denomination);
    form.getTextField('emetteur_adresse').setText(
        `${klubr.adresse}, ${klubr.codePostal} ${klubr.ville}`
    );
    form.getTextField('emetteur_siren').setText(klubr.SIREN);
    form.getTextField('emetteur_objet').setText(klubr.objetAssociation);
    
    // DonnÃ©es donateur
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
    form.getTextField('montant_chiffres').setText(`${montantRecu.toFixed(2)} â‚¬`);
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
    
    // NumÃ©ro et date d'Ã©mission
    form.getTextField('numero_recu').setText(`R-${don.attestationNumber}`);
    form.getTextField('date_emission').setText(formatDate(new Date()));
    
    // Sauvegarder
    const pdfBytes = await pdfDoc.save();
    const outputPath = `private-pdf/recus/R-${don.attestationNumber}.pdf`;
    fs.writeFileSync(outputPath, pdfBytes);
    
    return outputPath;
}
```

### 5.2 Workflow Remboursement Exceptionnel

#### 5.2.1 Principe Fondamental

> **Un reÃ§u fiscal Ã©mis est IMMUABLE.** En cas de remboursement, on ne modifie jamais le reÃ§u original â€” on crÃ©e une attestation d'annulation sÃ©parÃ©e.

#### 5.2.2 Cas DÃ©clencheurs

| Cas | PrioritÃ© | Workflow SpÃ©cifique |
|-----|----------|---------------------|
| **Fraude avÃ©rÃ©e** | P0 | Signalement TRACFIN si > 10kâ‚¬, blocage donateur |
| **Litige juridique** | P1 | Gel jusqu'Ã  dÃ©cision, conservation preuves |
| **Erreur de paiement** | P2 | Fast-track si reÃ§u non gÃ©nÃ©rÃ© |
| **Demande donateur** | P3 | Circuit standard avec dÃ©claration |
| **RÃ©tractation 14j** | P3 | SimplifiÃ© si reÃ§u non gÃ©nÃ©rÃ© |

#### 5.2.3 Diagramme du Workflow

```mermaid
sequenceDiagram
    participant D as Donateur
    participant S as Support
    participant AL as Association Leader
    participant Admin as Dashboard Admin
    participant Sys as SystÃ¨me
    participant Stripe as Stripe
    participant Tax as Fisc (si applicable)

    Note over D,Tax: Phase 1: Demande de Remboursement
    D->>S: Email demande remboursement
    S->>AL: Transmission demande
    AL->>Admin: CrÃ©er requÃªte /refunds
    Admin->>Sys: Submit (type, raison, montant)
    Sys->>Sys: Status: awaiting_declaration
    Sys->>D: Email: "Merci de signer la dÃ©claration"

    Note over D,Tax: Phase 2: DÃ©claration Donateur
    D->>D: TÃ©lÃ©charge, signe PDF
    D->>S: Renvoie dÃ©claration signÃ©e
    S->>AL: Transmet
    AL->>Admin: Upload dÃ©claration
    Admin->>Sys: Stocke fichier
    Sys->>Sys: Status: pending_approval
    Sys->>AL: Notification: "PrÃªt pour approbation"

    Note over D,Tax: Phase 3: Approbation
    AL->>Admin: Revue demande complÃ¨te
    
    alt ApprouvÃ©
        AL->>Admin: Clic "Approuver"
        Admin->>Sys: Approbation
        Sys->>Sys: CrÃ©e ReceiptCancellation
        Sys->>Sys: GÃ©nÃ¨re attestation annulation PDF
        Sys->>Stripe: stripe.refunds.create()
        Stripe-->>Sys: Refund ID
        Sys->>Sys: Update don.refund_status = completed
        Sys->>Sys: Log FinancialAuditLog
        Sys->>D: Email: "Remboursement effectuÃ©" + PDF
        Sys->>AL: Email: "Remboursement traitÃ©"
        
        alt Montant > Seuil fiscal
            Sys->>Tax: Notification autoritÃ© fiscale
        end
    else RefusÃ©
        AL->>Admin: Clic "Refuser" + motif
        Admin->>Sys: Refus enregistrÃ©
        Sys->>D: Email: "Remboursement refusÃ©" + motif
    end
```

#### 5.2.4 Structure de l'Attestation d'Annulation

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚            ATTESTATION D'ANNULATION DE REÃ‡U FISCAL              â”‚
â”‚                                                                 â”‚
â”‚  NumÃ©ro du reÃ§u annulÃ©: R-[attestationNumber]                   â”‚
â”‚  Date d'Ã©mission du reÃ§u: [date_recu_original]                  â”‚
â”‚                                                                 â”‚
â”‚  MOTIF DE L'ANNULATION                                          â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                                          â”‚
â”‚  [X] Demande du donateur                                        â”‚
â”‚  [ ] Erreur de paiement                                         â”‚
â”‚  [ ] Fraude dÃ©tectÃ©e                                            â”‚
â”‚  [ ] Litige juridique                                           â”‚
â”‚                                                                 â”‚
â”‚  REMBOURSEMENT                                                  â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                                                   â”‚
â”‚  Montant remboursÃ©: [montant] â‚¬                                 â”‚
â”‚  Date du remboursement: [date_remboursement]                    â”‚
â”‚  RÃ©fÃ©rence Stripe: [refund_id]                                  â”‚
â”‚                                                                 â”‚
â”‚  DÃ‰CLARATION DU DONATEUR                                        â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                                        â”‚
â”‚  Le donateur soussignÃ© dÃ©clare:                                 â”‚
â”‚  - Ne pas avoir utilisÃ© le reÃ§u annulÃ© pour dÃ©duction fiscale   â”‚
â”‚  - S'engager Ã  ne pas utiliser le reÃ§u annulÃ© ultÃ©rieurement    â”‚
â”‚                                                                 â”‚
â”‚  Document de dÃ©claration signÃ©: [RÃ©fÃ©rence piÃ¨ce jointe]        â”‚
â”‚                                                                 â”‚
â”‚  Ã‰METTEUR                                                       â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€                                                       â”‚
â”‚  [klubr.denomination]                                           â”‚
â”‚  SIREN: [klubr.SIREN]                                           â”‚
â”‚                                                                 â”‚
â”‚  Fait le [date], par [admin_name]                               â”‚
â”‚  NumÃ©ro d'annulation: ANN-[attestationNumber]                   â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 5.2.5 Table `receipt_cancellations` (Mise Ã  jour)

```typescript
// SchÃ©ma existant Ã  complÃ©ter
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
        
        // Ã€ AJOUTER
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

## 6. Gestion des Erreurs

### 6.1 Matrice des ScÃ©narios d'Erreur

| ScÃ©nario | DÃ©tection | Action Automatique | Action Manuelle | Impact UX |
|----------|-----------|-------------------|-----------------|-----------|
| **Compte association inactif** | `charges_enabled: false` avant PaymentIntent | Bloquer formulaire don, afficher message | Admin relance onboarding Stripe | Donateur ne peut pas donner |
| **KYC incomplet** | `verification_status !== 'verified'` | Griser bouton "Finaliser", afficher statut | Association complÃ¨te KYC | Association ne peut pas recevoir |
| **Paiement Ã©chouÃ© (carte)** | Webhook `payment_failed` | Retry button + email relance | Support contacte si rÃ©current | Donateur peut rÃ©essayer |
| **Double paiement** | ClÃ© idempotence existante | Retourner `client_secret` existant | - | Transparent pour donateur |
| **Remboursement post-reÃ§u** | Demande manuelle | Workflow approbation | Validation admin + dÃ©claration | Processus long |
| **Webhook perdu** | Cron vÃ©rifie PaymentIntents orphelins | RÃ©conciliation automatique | Alerte si > 24h | Retard gÃ©nÃ©ration PDF |
| **Compte dÃ©connectÃ©** | Webhook `account.application.deauthorized` | DÃ©sactiver collecte, notifier | Admin contacte association | Collecte suspendue |
| **Solde nÃ©gatif** | Stripe Dashboard alert | Stripe gÃ¨re (controller.losses) | Monitoring admin | Aucun (Stripe absorbe) |
| **Fraude suspectÃ©e** | Analyse patterns manuels | Gel compte | Investigation + signalement | Blocage prÃ©ventif |

### 6.2 StratÃ©gie de Retry

#### 6.2.1 Retry InstantanÃ© (CÃ´tÃ© Donateur)

```typescript
// donaction-saas/src/components/sponsorshipForm/components/step4.svelte
async function handlePaymentError(error: StripeError) {
    paymentError = error.message;
    
    // Afficher bouton retry
    showRetryButton = true;
    
    // Si le PaymentIntent est encore valide (< 24h)
    if (currentPaymentIntent && !isExpired(currentPaymentIntent)) {
        // RÃ©utiliser le mÃªme client_secret
        canRetryWithSameIntent = true;
    } else {
        // CrÃ©er un nouveau PaymentIntent
        canRetryWithSameIntent = false;
    }
}

async function retryPayment() {
    if (canRetryWithSameIntent) {
        // RÃ©utiliser l'intent existant
        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: 'if_required',
        });
    } else {
        // Nouveau PaymentIntent avec nouvelle clÃ© idempotence
        const newKey = generateIdempotencyKey(donUuid, 'retry', retryCount++);
        const { intent } = await createPaymentIntent(price, newKey, donorPaysFee);
        currentClientSecret = intent;
        // Puis confirmer...
    }
}
```

#### 6.2.2 Cron Job de Backup

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
            // VÃ©rifier le statut rÃ©el sur Stripe
            const paymentIntent = await stripe.paymentIntents.retrieve(payment.intent_id);
            
            if (paymentIntent.status === 'succeeded') {
                // Webhook manquÃ© - traiter maintenant
                await this.updateDonAndDonPayment({
                    status: 'success',
                    donUuid: payment.klub_don.uuid,
                    intent: paymentIntent,
                });
                
                console.log(`âœ… RÃ©conciliation: ${payment.intent_id} marquÃ© succÃ¨s`);
            } else if (['canceled', 'requires_payment_method'].includes(paymentIntent.status)) {
                // Marquer comme Ã©chouÃ©
                await strapi.documents('api::klub-don-payment.klub-don-payment').update({
                    documentId: payment.documentId,
                    data: { status: 'error' },
                });
            }
        } catch (err) {
            console.error(`âŒ Erreur rÃ©conciliation ${payment.intent_id}:`, err);
        }
    }
}

// Cron config
// 0 */15 * * * * - Toutes les 15 minutes
```

#### 6.2.3 Politique de RÃ©utilisation du `client_secret`

| Situation | Action | Raison |
|-----------|--------|--------|
| PaymentIntent < 24h, status `requires_payment_method` | RÃ©utiliser | Ã‰conomise crÃ©ation |
| PaymentIntent < 24h, status `requires_confirmation` | RÃ©utiliser | Paiement en cours |
| PaymentIntent > 24h | Nouveau PaymentIntent | Expiration Stripe |
| PaymentIntent status `succeeded` | Ne pas rÃ©utiliser | DÃ©jÃ  payÃ© |
| PaymentIntent status `canceled` | Nouveau PaymentIntent | AnnulÃ© |

### 6.3 Messages d'Erreur Utilisateur

```typescript
// Mapping erreurs Stripe â†’ Messages FR
const STRIPE_ERROR_MESSAGES: Record<string, string> = {
    'card_declined': 'Votre carte a Ã©tÃ© refusÃ©e. Veuillez essayer une autre carte.',
    'insufficient_funds': 'Fonds insuffisants. Veuillez vÃ©rifier votre solde.',
    'expired_card': 'Votre carte a expirÃ©. Veuillez utiliser une autre carte.',
    'incorrect_cvc': 'Le code de sÃ©curitÃ© (CVC) est incorrect.',
    'processing_error': 'Une erreur technique est survenue. Veuillez rÃ©essayer.',
    'account_inactive': 'Cette association ne peut temporairement pas recevoir de dons. Veuillez rÃ©essayer plus tard.',
    'account_kyc_incomplete': 'Le compte de l\'association est en cours de vÃ©rification. Veuillez rÃ©essayer ultÃ©rieurement.',
};

function getErrorMessage(error: StripeError): string {
    return STRIPE_ERROR_MESSAGES[error.code] 
        || 'Une erreur est survenue lors du paiement. Veuillez rÃ©essayer.';
}
```

---

## 7. Reporting et Monitoring

### 7.1 Dashboard Superadmin

#### 7.1.1 MÃ©triques Temps RÃ©el

| MÃ©trique | Source | RafraÃ®chissement | Alerte si |
|----------|--------|------------------|-----------|
| Dons en cours (pending) | `klub_don_payment.status` | 1 min | > 50 |
| Dons Ã©chouÃ©s (24h) | `klub_don_payment.status = error` | 5 min | > 10% |
| Volume total (jour) | `klub_don.montant` agrÃ©gÃ© | 5 min | - |
| Commissions (jour) | `application_fee_amount` | 5 min | - |
| Webhooks en erreur | `webhook_logs.status = failed` | 1 min | > 5 |
| Comptes restreints | `connected_account.account_status` | 1h | > 0 |
| KYC incomplets | `connected_account.charges_enabled = false` | 1h | - |

#### 7.1.2 Ã‰cran `/admin/monitoring`

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ“Š DONACTION - Monitoring Temps RÃ©el                               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                     â”‚
â”‚  ðŸ’° AUJOURD'HUI                    ðŸ“ˆ TENDANCE (7j)                 â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                â”‚
â”‚  Dons rÃ©ussis: 47                  [Graphique sparkline]            â”‚
â”‚  Volume: 3 450 â‚¬                   +12% vs semaine derniÃ¨re         â”‚
â”‚  Commissions: 138 â‚¬                                                 â”‚
â”‚                                                                     â”‚
â”‚  âš ï¸ ALERTES                        ðŸ”„ WEBHOOKS                      â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€                          â”€â”€â”€â”€â”€â”€â”€â”€â”€                        â”‚
â”‚  [!] 2 paiements pending > 30min   ReÃ§us (1h): 156                  â”‚
â”‚  [!] 1 compte restreint            TraitÃ©s: 154                     â”‚
â”‚      â†’ FC Lyon (voir)              Erreurs: 2 (1.3%)                â”‚
â”‚                                                                     â”‚
â”‚  ðŸ¦ COMPTES STRIPE                                                  â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                                                   â”‚
â”‚  Actifs: 145 | Pending KYC: 12 | Restreints: 1 | Total: 158        â”‚
â”‚                                                                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 7.1.3 Alertes Automatiques

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

### 7.2 RelevÃ© de Frais Mensuel Association

#### 7.2.1 Contenu du Document

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                     RELEVÃ‰ DE FRAIS MENSUEL                         â”‚
â”‚                         Janvier 2025                                â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                     â”‚
â”‚  ASSOCIATION                                                        â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                                                        â”‚
â”‚  FC Lyon                                                            â”‚
â”‚  SIREN: 123 456 789                                                 â”‚
â”‚  12 rue du Stade, 69001 Lyon                                        â”‚
â”‚                                                                     â”‚
â”‚  PÃ‰RIODE                                                            â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€                                                            â”‚
â”‚  Du 01/01/2025 au 31/01/2025                                        â”‚
â”‚                                                                     â”‚
â”‚  RÃ‰CAPITULATIF                                                      â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                                                      â”‚
â”‚  Nombre de dons reÃ§us: 47                                           â”‚
â”‚  Montant total collectÃ©: 3 450,00 â‚¬                                 â”‚
â”‚                                                                     â”‚
â”‚  DÃ‰TAIL DES FRAIS                                                   â”‚
â”‚  â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€                                                    â”‚
â”‚  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â” â”‚
â”‚  â”‚ Date     â”‚ Donateur   â”‚ Montant    â”‚ Commission â”‚ Mode frais   â”‚ â”‚
â”‚  â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤ â”‚
â”‚  â”‚ 02/01/25 â”‚ J. Dupont  â”‚ 100,00 â‚¬   â”‚ 4,00 â‚¬     â”‚ Donor Pays   â”‚ â”‚
â”‚  â”‚ 05/01/25 â”‚ SAS Martin â”‚ 500,00 â‚¬   â”‚ 20,00 â‚¬    â”‚ Donor Pays   â”‚ â”‚
â”‚  â”‚ ...      â”‚ ...        â”‚ ...        â”‚ ...        â”‚ ...          â”‚ â”‚
â”‚  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜ â”‚
â”‚                                                                     â”‚
â”‚  TOTAL COMMISSIONS: 138,00 â‚¬                                        â”‚
â”‚  Mode de prÃ©lÃ¨vement: PrÃ©levÃ© au donateur (Donor Pays Fee)          â”‚
â”‚                                                                     â”‚
â”‚  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•    â”‚
â”‚  Ce document est un relevÃ© d'information.                           â”‚
â”‚  Il ne constitue pas une facture.                                   â”‚
â”‚  Les commissions ont Ã©tÃ© prÃ©levÃ©es automatiquement lors de chaque   â”‚
â”‚  transaction via Stripe Connect.                                    â”‚
â”‚                                                                     â”‚
â”‚  GÃ©nÃ©rÃ© le: 01/02/2025                                              â”‚
â”‚  RÃ©fÃ©rence: REL-2025-01-FCLYON                                      â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 7.2.2 GÃ©nÃ©ration et Distribution

```typescript
// api/fee-statement/services/fee-statement.ts
async generateMonthlyStatements(month: number, year: number) {
    // RÃ©cupÃ©rer tous les klubrs avec dons ce mois
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
        
        // GÃ©nÃ©rer PDF
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

## 8. Plan de Migration

### 8.1 Phases de DÃ©ploiement

```mermaid
gantt
    title Plan de Migration Stripe Connect
    dateFormat  YYYY-MM-DD
    section Phase 0
    Revue code existant (Phases 1-3)    :done, p0, 2026-01-11, 3d
    Tests unitaires                      :active, p0t, after p0, 5d
    
    section Phase 1 - Pilote
    SÃ©lection 5 associations pilotes    :p1a, after p0t, 2d
    Onboarding pilotes                  :p1b, after p1a, 7d
    Tests en production                 :p1c, after p1b, 14d
    Collecte feedback                   :p1d, after p1b, 14d
    
    section Phase 2 - Rollout
    Communication gÃ©nÃ©rale              :p2a, after p1c, 3d
    Onboarding par vagues (10/semaine)  :p2b, after p2a, 28d
    Support renforcÃ©                    :p2c, after p2a, 35d
    
    section Phase 3 - DÃ©prÃ©ciation
    DÃ©sactivation ancien systÃ¨me        :p3a, after p2b, 7d
    Migration donnÃ©es legacy            :p3b, after p3a, 14d
    Archivage                           :p3c, after p3b, 7d
```

### 8.2 DÃ©tail des Phases

#### Phase 0 : PrÃ©paration (Semaine 1-2)

| TÃ¢che | Responsable | Livrable |
|-------|-------------|----------|
| Revue du code Phases 1-3 | Tech Lead | Liste corrections |
| Ajout tests unitaires | Dev Backend | Coverage > 80% |
| Test intÃ©gration Stripe sandbox | Dev Backend | Rapport tests |
| CrÃ©ation environnement staging | DevOps | Env fonctionnel |
| Documentation API interne | Dev Backend | OpenAPI spec |
| Formation Ã©quipe support | Product Owner | Guide support |

#### Phase 1 : Pilote (Semaine 3-6)

**CritÃ¨res de sÃ©lection des pilotes :**
- Association avec volume > 10 dons/mois
- Leader technophile et rÃ©actif
- ReprÃ©sentativitÃ© : 1 grand club, 2 moyens, 2 petits
- Accord de participation au pilote

**Actions :**
1. Contact personnalisÃ© des 5 associations
2. Session d'onboarding individuelle (visio)
3. Suivi quotidien pendant 2 semaines
4. Collecte de feedback structurÃ©
5. Correction des bugs identifiÃ©s

#### Phase 2 : Rollout (Semaine 7-14)

**Communication :**
- Email d'annonce Ã  toutes les associations
- FAQ dÃ©diÃ©e sur le site
- Webinaire de prÃ©sentation (enregistrÃ©)
- Tutoriel vidÃ©o Ã©tape par Ã©tape

**Rythme d'onboarding :**
- Semaine 7-8 : 10 associations
- Semaine 9-10 : 20 associations
- Semaine 11-12 : 30 associations
- Semaine 13-14 : Reste des associations

#### Phase 3 : DÃ©prÃ©ciation (Semaine 15-18)

**DÃ©sactivation de l'ancien systÃ¨me :**
1. Blocage des nouveaux dons via ancien systÃ¨me
2. Migration des dons en cours vers nouveau systÃ¨me
3. Archivage des donnÃ©es legacy
4. Redirection des webhooks

### 8.3 KPIs de SuccÃ¨s

| KPI | Cible | Mesure |
|-----|-------|--------|
| **Taux d'onboarding** | > 90% associations actives en 8 semaines | `connected_accounts.charges_enabled / klubrs.donationEligible` |
| **Taux de conversion formulaire** | â‰¥ taux actuel (-2% max) | Dons rÃ©ussis / Formulaires ouverts |
| **Temps moyen onboarding** | < 48h | CrÃ©ation compte â†’ charges_enabled |
| **Taux d'erreur paiement** | < 5% | Erreurs / Total tentatives |
| **NPS Associations** | > 40 | EnquÃªte post-onboarding |
| **Volume dons** | Pas de baisse | Comparaison M-1, M-12 |
| **Tickets support** | < 10/semaine aprÃ¨s rollout | Zendesk/Email |

### 8.4 Plan de Rollback

En cas de problÃ¨me critique :

```typescript
// Configuration feature flag
const STRIPE_CONNECT_ENABLED = process.env.STRIPE_CONNECT_ENABLED === 'true';

// Dans le contrÃ´leur
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

**ProcÃ©dure de rollback :**
1. DÃ©sactiver `STRIPE_CONNECT_ENABLED` en variable d'environnement
2. RedÃ©ployer l'API
3. Communiquer aux associations impactÃ©es
4. Investiguer et corriger
5. RÃ©activer progressivement

---

## 9. Annexes

### 9.1 Exemples de Payloads API

#### 9.1.1 CrÃ©ation PaymentIntent (Stripe Connect)

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

**Response (succÃ¨s) :**
```json
{
    "intent": "pi_3QfXXXXXXXXXXXXX_secret_XXXXXXXXX",
    "reused": false
}
```

**Response (rÃ©utilisation idempotence) :**
```json
{
    "intent": "pi_3QfXXXXXXXXXXXXX_secret_XXXXXXXXX",
    "reused": true
}
```

#### 9.1.2 Webhook `payment_intent.succeeded`

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

#### 9.1.3 CrÃ©ation Compte Express

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

### 9.2 Templates de Documents

#### 9.2.1 Email Template : Confirmation Don

**ID Brevo : 8** (Ã  mettre Ã  jour)

```html
Objet : Merci pour votre don Ã  {{CLUB_DENOMINATION}} ðŸŽ‰

Bonjour {{RECEIVER_FULLNAME}},

Nous avons le plaisir de vous confirmer la rÃ©ception de votre don.

ðŸ“‹ RÃ©capitulatif :
â€¢ Association : {{CLUB_DENOMINATION}}
{{#if PROJECT_TITLE}}â€¢ Projet : {{PROJECT_TITLE}}{{/if}}
â€¢ Montant du don : {{DONATION_AMOUNT}} â‚¬
{{#if DONATION_CONTRIBUTION}}â€¢ Contribution DONACTION : {{DONATION_CONTRIBUTION}} â‚¬{{/if}}
â€¢ Date : {{DONATION_DATE}}

ðŸ“Ž Vos documents sont joints Ã  cet email :
â€¢ Attestation de paiement
{{#if WITH_TAX_REDUCTION}}â€¢ ReÃ§u fiscal (Ã  conserver pour votre dÃ©claration d'impÃ´ts){{/if}}

ðŸ’¡ Votre don permet Ã  {{CLUB_DENOMINATION}} de poursuivre ses activitÃ©s d'intÃ©rÃªt gÃ©nÃ©ral.

Sportivement,
L'Ã©quipe DONACTION
```

#### 9.2.2 Email Template : Relance Onboarding

**ID Brevo : Nouveau**

```html
Objet : Finalisez votre compte de collecte {{CLUB_NAME}}

Bonjour {{LEADER_NAME}},

Votre association {{CLUB_NAME}} a commencÃ© son inscription sur DONACTION, mais l'activation du compte de paiement n'est pas terminÃ©e.

ðŸ“Š Statut actuel :
â€¢ Informations association : {{CLUB_INFO_PERCENT}}%
â€¢ Documents : {{DOCS_PERCENT}}%
â€¢ Compte paiement : En attente

âž¡ï¸ Pour finaliser et commencer Ã  recevoir des dons :
{{ONBOARDING_LINK}}

Cette Ã©tape prend environ 5 minutes et nÃ©cessite :
â€¢ Un justificatif d'identitÃ© du responsable
â€¢ Les coordonnÃ©es bancaires de l'association

Besoin d'aide ? RÃ©pondez Ã  cet email.

L'Ã©quipe DONACTION
```

### 9.3 Glossaire

| Terme | DÃ©finition |
|-------|------------|
| **Application Fee** | Commission prÃ©levÃ©e par DONACTION sur chaque transaction |
| **Connected Account** | Compte Stripe Express d'une association, liÃ© Ã  la plateforme DONACTION |
| **Destination Charges** | Type de flux Stripe oÃ¹ le paiement arrive sur le compte plateforme puis est transfÃ©rÃ© |
| **Donor Pays Fee** | ModÃ¨le oÃ¹ le donateur prend en charge les frais (Stripe + commission) |
| **Express Account** | Type de compte Stripe avec onboarding hÃ©bergÃ© par Stripe |
| **Idempotency Key** | ClÃ© unique empÃªchant les double-facturations |
| **KYC** | Know Your Customer - VÃ©rification d'identitÃ© |
| **PaymentIntent** | Objet Stripe reprÃ©sentant une intention de paiement |
| **ReÃ§u Fiscal** | Document Cerfa permettant la dÃ©duction fiscale |
| **Trade Policy** | Configuration des frais et commissions par association |
| **Webhook** | Notification HTTP envoyÃ©e par Stripe lors d'un Ã©vÃ©nement |

### 9.4 Points d'Attention IdentifiÃ©s dans le Code Actuel

AprÃ¨s analyse du code fourni (Documents 14, 16, 33, 37), voici les ajustements recommandÃ©s :

| Fichier | Constat | Recommandation |
|---------|---------|----------------|
| `trade_policy/schema.json` | `commissionPercentage` default = 6% | Ajuster Ã  4% pour nouveau modÃ¨le |
| `trade_policy/schema.json` | Champ unique `donor_pays_fee` | **REMPLACER** par `donor_pays_fee_project` + `donor_pays_fee_club` + `allow_donor_fee_choice` |
| `klub-don/schema.json` | Pas de champ `donor_pays_fee` | **AJOUTER** pour stocker le choix du donateur |
| `klub-don-payment.controller.ts` | Calcul frais ne gÃ¨re pas tous les `fee_model` | ImplÃ©menter les 3 modes |
| `connected-account/schema.json` | Pas de champ `business_profile` | Ajouter pour enrichir donnÃ©es |
| `api.ts` (Svelte) | Pas de gestion erreur dÃ©taillÃ©e | Ajouter mapping erreurs FR |
| - | Manque `webhook_logs` content-type | CrÃ©er pour audit trail |
| - | Manque `receipt_cancellations` complet | ComplÃ©ter schÃ©ma |
| - | Manque endpoint webhook Connect | CrÃ©er `/stripe-connect/webhook` |

### 9.5 Ã‰volution du SchÃ©ma `trade_policy`

**Modifications Ã  apporter au fichier `trade_policy/schema.json` :**

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

**Migration de donnÃ©es (si des trade_policies existantes) :**

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
    
    console.log(`âœ… MigrÃ© ${tradePolicies.length} trade policies`);
}
```

### 9.6 Ã‰volution du SchÃ©ma `klub-don`

**Ajout du champ pour stocker le choix du donateur :**

```json
// Ã€ ajouter dans klub-don/schema.json
{
  "donor_pays_fee": {
    "type": "boolean",
    "required": false
  }
}
```

**Note :** Si `null`, le systÃ¨me utilisera la valeur par dÃ©faut de la `trade_policy` selon le type de don (projet ou club).

---

## 10. Checklist de Validation

### Avant Mise en Production

- [ ] Tests unitaires coverage > 80%
- [ ] Tests d'intÃ©gration Stripe sandbox OK
- [ ] Calcul des frais validÃ© avec comptable
- [ ] Templates PDF reÃ§u fiscal validÃ©s
- [ ] Webhooks testÃ©s (tous les Ã©vÃ©nements)
- [ ] StratÃ©gie d'idempotence testÃ©e
- [ ] Rollback testÃ© en staging
- [ ] Documentation support rÃ©digÃ©e
- [ ] Ã‰quipe support formÃ©e
- [ ] KPIs de monitoring configurÃ©s
- [ ] Alertes Slack/Discord configurÃ©es
- [ ] Feature flag fonctionnel
- [ ] Plan de communication prÃªt

### Pour Chaque Association OnboardÃ©e

- [ ] `requiredFieldsCompletion` = 100%
- [ ] `requiredDocsValidatedCompletion` = 100%
- [ ] `managerSignature` uploadÃ©e
- [ ] Connected Account crÃ©Ã©
- [ ] `charges_enabled` = true
- [ ] `payouts_enabled` = true
- [ ] Premier don test rÃ©ussi
- [ ] ReÃ§u fiscal gÃ©nÃ©rÃ© correctement
- [ ] Email confirmation reÃ§u

---

## 11. Configuration du Compte Stripe pour Connect

### 11.1 PrÃ©requis

Avant de configurer Stripe Connect, vÃ©rifiez que vous disposez de :

| Ã‰lÃ©ment | Statut | Description |
|---------|--------|-------------|
| Compte Stripe activÃ© | âœ… Requis | Compte live avec vÃ©rification d'identitÃ© complÃ¨te |
| Entreprise en France | âœ… Requis | DONACTION doit Ãªtre une entitÃ© franÃ§aise |
| Site web HTTPS | âœ… Requis | URLs de production accessibles en HTTPS |
| Conditions d'utilisation | âœ… Requis | CGU mentionnant Stripe (sous-traitant de paiement) |

### 11.2 AccÃ¨s aux ParamÃ¨tres Connect

**Chemin :** Dashboard Stripe â†’ Plus (+) â†’ Connect

Si Connect n'est pas visible :
1. Aller dans **Settings** â†’ **Product settings** â†’ **Connect**
2. Activer Connect pour votre compte
3. ComplÃ©ter le **Platform Profile** (questionnaire sur votre modÃ¨le)

### 11.3 Configuration du Platform Profile

Lors de la premiÃ¨re activation, Stripe pose des questions pour configurer votre plateforme :

| Question | RÃ©ponse pour DONACTION |
|----------|------------------------|
| **Type de plateforme** | Marketplace / Plateforme de dons |
| **Qui sont vos utilisateurs ?** | Associations / Non-profits |
| **Comment collectez-vous les paiements ?** | Au nom des associations |
| **Qui gÃ¨re les remboursements ?** | La plateforme (DONACTION) |
| **Pays des comptes connectÃ©s** | France (FR) uniquement pour v1 |

### 11.4 ParamÃ¨tres Connect Settings

**Chemin :** Dashboard â†’ Connect â†’ Settings

#### 11.4.1 Account Types (Types de comptes)

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  âš™ï¸ CONFIGURATION DES COMPTES CONNECTÃ‰S                     â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  Type de compte : â—‰ Express  â—‹ Custom  â—‹ Standard           â”‚
â”‚                                                             â”‚
â”‚  â–¸ Express = Stripe gÃ¨re l'onboarding KYC                   â”‚
â”‚  â–¸ Associations redirigÃ©es vers formulaire Stripe           â”‚
â”‚  â–¸ Express Dashboard pour voir leurs paiements              â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Choix recommandÃ© : Express**
- Stripe gÃ¨re la vÃ©rification d'identitÃ© (KYC)
- Onboarding hÃ©bergÃ© par Stripe (moins de dÃ©veloppement)
- Associations ont accÃ¨s Ã  l'Express Dashboard
- ConformitÃ© automatique aux Ã©volutions rÃ©glementaires

#### 11.4.2 Capabilities (FonctionnalitÃ©s)

**Chemin :** Connect â†’ Settings â†’ Capabilities

Activer les capabilities suivantes pour les nouveaux comptes :

| Capability | Activer | Description |
|------------|---------|-------------|
| `card_payments` | âœ… Oui | Accepter les paiements par carte |
| `transfers` | âœ… Oui | Recevoir des transferts de la plateforme |
| `cartes_bancaires` | âš ï¸ Optionnel | Cartes Bancaires franÃ§aises (ajoute des vÃ©rifications) |

> **Note France :** Pour accepter Cartes Bancaires, l'association doit fournir son numÃ©ro SIREN dans le formulaire d'onboarding.

#### 11.4.3 Payout Settings (Virements)

**Chemin :** Connect â†’ Settings â†’ Payouts

| ParamÃ¨tre | Valeur recommandÃ©e | Description |
|-----------|-------------------|-------------|
| **Payout schedule** | `daily` ou `weekly` | FrÃ©quence des virements |
| **Delay days** | `7` (minimum lÃ©gal FR) | DÃ©lai avant virement |
| **Allow manual payouts** | âœ… ActivÃ© | Associations peuvent dÃ©clencher un virement |
| **Debit negative balances** | âœ… ActivÃ© | DÃ©biter le compte en cas de solde nÃ©gatif |

#### 11.4.4 Branding (Personnalisation)

**Chemin :** Connect â†’ Settings â†’ Branding

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸŽ¨ BRANDING DE LA PLATEFORME                               â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                             â”‚
â”‚  Business name :  DONACTION                                 â”‚
â”‚  Icon :           [ðŸ“¤ Upload logo 512x512 PNG]              â”‚
â”‚  Primary color :  #73cfa8 (vert DONACTION)                  â”‚
â”‚  Secondary color: #fb9289 (corail)                          â”‚
â”‚                                                             â”‚
â”‚  âœ… Copy platform branding to connected accounts            â”‚
â”‚                                                             â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

Ce branding apparaÃ®t :
- Sur le formulaire d'onboarding Stripe des associations
- Dans l'Express Dashboard des associations
- Sur les emails envoyÃ©s par Stripe aux associations

### 11.5 Configuration des Webhooks

Stripe Connect nÃ©cessite **2 types de webhooks** distincts :

#### 11.5.1 Webhook Account (Paiements)

**Chemin :** Developers â†’ Webhooks â†’ Add endpoint

| ParamÃ¨tre | Valeur |
|-----------|--------|
| **Endpoint URL** | `https://www.donaction.fr/service/api/klub-don-payments/stripe-web-hooks` |
| **Listen to** | â—‰ Events on your account |
| **Events** | `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded` |

#### 11.5.2 Webhook Connect (Comptes connectÃ©s)

**Chemin :** Developers â†’ Webhooks â†’ Add endpoint

| ParamÃ¨tre | Valeur |
|-----------|--------|
| **Endpoint URL** | `https://www.donaction.fr/service/api/stripe-connect/webhook` |
| **Listen to** | â—‰ Events on Connected accounts |
| **Events sÃ©lectionnÃ©s** | Voir liste ci-dessous |

**Ã‰vÃ©nements Connect Ã  Ã©couter :**

| Ã‰vÃ©nement | Description |
|-----------|-------------|
| `account.updated` | Statut KYC mis Ã  jour |
| `account.application.deauthorized` | Association dÃ©connectÃ©e |
| `capability.updated` | Capability activÃ©e/dÃ©sactivÃ©e |
| `person.created` | ReprÃ©sentant lÃ©gal ajoutÃ© |
| `person.updated` | Infos reprÃ©sentant mises Ã  jour |
| `payout.created` | Virement initiÃ© |
| `payout.paid` | Virement effectuÃ© |
| `payout.failed` | Ã‰chec virement |
| `charge.dispute.created` | **Litige ouvert** |
| `charge.dispute.updated` | **Litige mis Ã  jour** |
| `charge.dispute.closed` | **Litige fermÃ©** |

#### 11.5.3 RÃ©cupÃ©ration des Webhook Secrets

AprÃ¨s crÃ©ation de chaque webhook :

1. Cliquer sur le webhook crÃ©Ã©
2. Dans **Signing secret**, cliquer **Reveal**
3. Copier la clÃ© `whsec_...`

```bash
# Variables d'environnement Ã  configurer
STRIPE_WEBHOOK_SECRET=whsec_xxx...      # Webhook Account (paiements)
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_yyy... # Webhook Connect (comptes)
```

### 11.6 ClÃ©s API

**Chemin :** Developers â†’ API keys

#### 11.6.1 ClÃ©s Disponibles

| Type | Format | Usage |
|------|--------|-------|
| **Publishable key** | `pk_live_...` | Frontend (Svelte, Next.js) |
| **Secret key** | `sk_live_...` | Backend (Strapi) - âš ï¸ NE JAMAIS EXPOSER |

#### 11.6.2 Variables d'Environnement

```bash
# Backend (donaction-api/.env.prod)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET_CONNECT=whsec_...

# Frontend (donaction-frontend/.env.prod)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# SaaS Widget (donaction-saas/.env.prod)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

#### 11.6.3 ClÃ©s de Test (Sandbox)

Pour l'environnement staging (`re7.donaction.fr`), utiliser les clÃ©s test :

| Type | Format |
|------|--------|
| **Publishable key** | `pk_test_...` |
| **Secret key** | `sk_test_...` |

> **Basculer Test/Live :** Toggle en haut Ã  droite du Dashboard Stripe

### 11.7 Configuration Onboarding Express

**Chemin :** Connect â†’ Settings â†’ Express

#### 11.7.1 Onboarding Interface

| ParamÃ¨tre | Configuration |
|-----------|---------------|
| **Countries** | âœ… France uniquement |
| **Business types** | âœ… Non-profit, âœ… Company |
| **Individual accounts** | âŒ DÃ©sactivÃ© (associations uniquement) |

#### 11.7.2 Information Collection

| Information | Requis | Description |
|-------------|--------|-------------|
| **External account** | âœ… Oui | IBAN pour les virements |
| **Statement descriptor** | âœ… Oui | Nom affichÃ© sur relevÃ©s bancaires donateurs |
| **Support info** | âœ… Oui | Email/tÃ©lÃ©phone support association |

#### 11.7.3 Express Dashboard Features

| Feature | Activer | Description |
|---------|---------|-------------|
| **View transactions** | âœ… | Voir les paiements reÃ§us |
| **View payouts** | âœ… | Voir les virements |
| **Manage payout schedule** | âš ï¸ Optionnel | Laisser associations changer frÃ©quence |
| **Issue refunds** | âŒ Non | DONACTION gÃ¨re les remboursements |
| **View disputes** | âœ… | Voir les litiges |

### 11.8 Tarification Stripe Connect

#### 11.8.1 Frais de Traitement des Paiements (France)

| Type de carte | Frais Stripe | Notes |
|---------------|--------------|-------|
| **Cartes europÃ©ennes** | 1.5% + 0.25â‚¬ | Visa, Mastercard, CB domestiques |
| **Cartes UK post-Brexit** | 2.5% + 0.25â‚¬ | Cartes Ã©mises au Royaume-Uni |
| **Cartes internationales** | 2.9% + 0.25â‚¬ | Hors Europe |
| **Cartes Bancaires (CB)** | 1.5% + 0.25â‚¬ | RÃ©seau franÃ§ais, nÃ©cessite SIREN |

#### 11.8.2 Frais Connect SpÃ©cifiques

| Service | Tarif | Description |
|---------|-------|-------------|
| **Compte Express actif** | 2â‚¬/mois/compte* | Comptes ayant reÃ§u â‰¥1 payout dans le mois |
| **Virements (payouts)** | 0.25â‚¬/virement | Virement vers compte bancaire |
| **Virements intra-zone euro** | 0â‚¬ cross-border | Pas de frais supplÃ©mentaires |
| **Instant Payouts** | 1% (min 0.50â‚¬) | Virements instantanÃ©s (optionnel) |

*Note : Le tarif exact des comptes Express peut varier. VÃ©rifier sur [stripe.com/connect/pricing](https://stripe.com/connect/pricing).

#### 11.8.3 Frais de Litiges (Disputes)

| Ã‰vÃ©nement | Frais | Remboursable ? |
|-----------|-------|----------------|
| **Litige ouvert (chargeback)** | 15â‚¬ | Non (sauf Mexique) |
| **Litige contestÃ©** | +15â‚¬ additionnel | Non |
| **CB (Cartes Bancaires)** | 0â‚¬ | Zone SEPA exemptÃ©e |

#### 11.8.4 SynthÃ¨se des Frais pour un Don Type

**Exemple : Don de 100â‚¬ (carte europÃ©enne)**

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  ðŸ’³ DÃ‰COMPOSITION FRAIS - DON 100â‚¬                                    â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                       â”‚
â”‚  Montant intentionnel du don :            100.00 â‚¬                    â”‚
â”‚                                                                       â”‚
â”‚  â”€â”€â”€ Si "Donor Pays Fee" = true â”€â”€â”€                                   â”‚
â”‚                                                                       â”‚
â”‚  + Frais Stripe (1.5% + 0.25â‚¬) :          +  1.75 â‚¬                   â”‚
â”‚  + Commission DONACTION (4%) :            +  4.00 â‚¬                   â”‚
â”‚  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•                  â”‚
â”‚  Total dÃ©bitÃ© au donateur :               105.75 â‚¬                    â”‚
â”‚                                                                       â”‚
â”‚  â†’ Association reÃ§oit :                   100.00 â‚¬ âœ…                 â”‚
â”‚  â†’ DONACTION reÃ§oit :                       4.00 â‚¬ (application_fee)  â”‚
â”‚  â†’ Stripe prÃ©lÃ¨ve :                         1.75 â‚¬ (sur plateforme)   â”‚
â”‚                                                                       â”‚
â”‚  â”€â”€â”€ Si "Donor Pays Fee" = false â”€â”€â”€                                  â”‚
â”‚                                                                       â”‚
â”‚  Total dÃ©bitÃ© au donateur :               100.00 â‚¬                    â”‚
â”‚                                                                       â”‚
â”‚  â†’ Association reÃ§oit :                    94.25 â‚¬ (100 - 5.75)       â”‚
â”‚  â†’ DONACTION reÃ§oit :                       4.00 â‚¬                    â”‚
â”‚  â†’ Stripe prÃ©lÃ¨ve :                         1.75 â‚¬                    â”‚
â”‚                                                                       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 11.8.5 Estimation Mensuelle des CoÃ»ts

| Volume mensuel | Frais Stripe (~1.8%) | Comptes actifs | Total estimÃ© |
|----------------|---------------------|----------------|--------------|
| 10 000â‚¬ (50 dons) | ~180â‚¬ | ~5 Ã— 2â‚¬ = 10â‚¬ | ~190â‚¬ |
| 50 000â‚¬ (250 dons) | ~900â‚¬ | ~25 Ã— 2â‚¬ = 50â‚¬ | ~950â‚¬ |
| 100 000â‚¬ (500 dons) | ~1 800â‚¬ | ~50 Ã— 2â‚¬ = 100â‚¬ | ~1 900â‚¬ |

> **Important :** Dans le modÃ¨le "Donor Pays Fee", ces frais Stripe sont inclus dans le montant payÃ© par le donateur. DONACTION ne supporte que les frais des comptes Express actifs.

### 11.9 Gestion des Disputes (Chargebacks)

#### 11.9.1 ResponsabilitÃ©s avec Destination Charges

Avec les **destination charges** utilisÃ©es par DONACTION :

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  âš–ï¸ RESPONSABILITÃ‰ DES LITIGES - DESTINATION CHARGES                  â”‚
â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
â”‚                                                                        â”‚
â”‚  La charge est crÃ©Ã©e sur le compte PLATEFORME (DONACTION)              â”‚
â”‚  puis transfÃ©rÃ©e vers le compte ASSOCIATION (connected account)        â”‚
â”‚                                                                        â”‚
â”‚  En cas de litige :                                                    â”‚
â”‚                                                                        â”‚
â”‚  1ï¸âƒ£ Stripe dÃ©bite le montant du compte PLATEFORME                     â”‚
â”‚  2ï¸âƒ£ DONACTION doit reverser le transfer vers l'association            â”‚
â”‚  3ï¸âƒ£ DONACTION est responsable des soldes nÃ©gatifs                     â”‚
â”‚                                                                        â”‚
â”‚  âš ï¸ DONACTION EST ULTIMEMENT RESPONSABLE                               â”‚
â”‚     (mÃªme si l'association a un solde positif)                         â”‚
â”‚                                                                        â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### 11.9.2 Cycle de Vie d'un Litige

```mermaid
stateDiagram-v2
    [*] --> EarlyFraudWarning: Signal fraude potentielle
    EarlyFraudWarning --> Inquiry: Escalade optionnelle
    EarlyFraudWarning --> [*]: Pas d'action requise
    
    [*] --> Inquiry: Demande d'info (AmEx/Discover)
    Inquiry --> DisputeCreated: Escalade en chargeback
    Inquiry --> [*]: RÃ©solu sans chargeback
    
    [*] --> DisputeCreated: Chargeback initiÃ©
    
    DisputeCreated --> NeedsResponse: En attente preuves
    NeedsResponse --> UnderReview: Preuves soumises
    NeedsResponse --> Lost: DÃ©lai expirÃ© (auto-perdu)
    
    UnderReview --> Won: Banque favorable
    UnderReview --> Lost: Banque dÃ©favorable
    
    Won --> [*]: Fonds restituÃ©s
    Lost --> [*]: Fonds perdus dÃ©finitivement
```

#### 11.9.3 DÃ©lais de RÃ©ponse

| Phase | DÃ©lai | Action requise |
|-------|-------|----------------|
| **Early Fraud Warning** | N/A | Optionnel : rembourser prÃ©ventivement |
| **Inquiry** | 7-14 jours | Fournir informations demandÃ©es |
| **Dispute (chargeback)** | **7-21 jours** | Soumettre preuves via Dashboard/API |
| **Arbitration** | 10-45 jours | Dernier recours (frais supplÃ©mentaires) |

> **Critique :** Les litiges non contestÃ©s dans les dÃ©lais sont **automatiquement perdus**.

#### 11.9.4 Flux de Gestion des Litiges

```mermaid
sequenceDiagram
    participant Donateur
    participant Banque as Banque Ã‰mettrice
    participant Stripe
    participant DONACTION
    participant Association

    Donateur->>Banque: Conteste le paiement
    Banque->>Stripe: Initie chargeback
    
    Stripe->>DONACTION: Webhook: charge.dispute.created
    Note right of Stripe: Fonds bloquÃ©s sur<br/>compte DONACTION
    
    Stripe->>DONACTION: Notification email
    
    DONACTION->>DONACTION: Ã‰value le litige
    
    alt Litige lÃ©gitime (erreur/fraude avÃ©rÃ©e)
        DONACTION->>Stripe: Accepte le litige
        Stripe->>Banque: Fonds restituÃ©s au donateur
        DONACTION->>Association: Reverse le transfer
        Note over DONACTION,Association: Association doit<br/>rembourser DONACTION
    else Litige contestable
        DONACTION->>Association: Demande preuves<br/>(reÃ§u, confirmation, etc.)
        Association->>DONACTION: Fournit documents
        DONACTION->>Stripe: Soumet preuves via API
        Stripe->>Banque: Transmet dossier
        
        alt Litige gagnÃ©
            Banque->>Stripe: DÃ©cision favorable
            Stripe->>DONACTION: Webhook: charge.dispute.closed (won)
            Note right of DONACTION: Fonds dÃ©bloquÃ©s
        else Litige perdu
            Banque->>Stripe: DÃ©cision dÃ©favorable
            Stripe->>DONACTION: Webhook: charge.dispute.closed (lost)
            DONACTION->>Association: Reverse le transfer
            Note over DONACTION,Association: Perte financiÃ¨re<br/>pour l'association
        end
    end
```

#### 11.9.5 Preuves Ã  Collecter pour Contester

Pour les **dons**, les preuves suivantes sont pertinentes :

| Preuve | Description | Poids |
|--------|-------------|-------|
| **Confirmation email** | Email envoyÃ© au donateur aprÃ¨s le don | â­â­â­ |
| **ReÃ§u fiscal PDF** | Preuve de la transaction et du destinataire | â­â­â­ |
| **Attestation de don** | Document signÃ© si don en personne | â­â­ |
| **IP address** | Adresse IP lors du paiement | â­â­ |
| **AVS/CVC check** | RÃ©sultat des vÃ©rifications carte | â­â­ |
| **3D Secure** | Authentification forte (SCA) | â­â­â­ |
| **Logs d'activitÃ©** | Historique des actions du donateur | â­ |
| **Correspondance** | Ã‰changes avec le donateur | â­â­ |

> **Avantage dons :** Les transactions avec 3D Secure (obligatoire en France via SCA/PSD2) bÃ©nÃ©ficient d'un **liability shift** : la responsabilitÃ© fraude passe Ã  la banque Ã©mettrice.

#### 11.9.6 ImplÃ©mentation Backend

**Webhook Handler pour les Disputes :**

```typescript
// api/stripe-connect/controllers/webhook.ts

async handleDisputeEvent(event: Stripe.Event) {
    const dispute = event.data.object as Stripe.Dispute;
    const paymentIntentId = dispute.payment_intent as string;
    
    // RÃ©cupÃ©rer le don associÃ©
    const klubDonPayment = await strapi.db
        .query('api::klub-don-payment.klub-don-payment')
        .findOne({
            where: { intent_id: paymentIntentId },
            populate: { klub_don: { populate: ['klubr', 'klubDonateur'] } }
        });
    
    if (!klubDonPayment) {
        console.error(`âŒ Dispute: PaymentIntent ${paymentIntentId} non trouvÃ©`);
        return;
    }
    
    const klubDon = klubDonPayment.klub_don;
    
    switch (event.type) {
        case 'charge.dispute.created':
            console.log(`âš ï¸ LITIGE OUVERT - Don ${klubDon.uuid}`);
            
            // 1. Logger l'Ã©vÃ©nement
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
            
            // 2. Mettre Ã  jour le statut du don
            await strapi.documents('api::klub-don.klub-don').update({
                documentId: klubDon.documentId,
                data: { 
                    disputeStatus: 'open',
                    disputeId: dispute.id,
                    disputeReason: dispute.reason
                }
            });
            
            // 3. Notifier l'Ã©quipe DONACTION
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
            console.log(`ðŸ“ LITIGE MIS Ã€ JOUR - ${dispute.status}`);
            
            await strapi.documents('api::klub-don.klub-don').update({
                documentId: klubDon.documentId,
                data: { disputeStatus: dispute.status }
            });
            break;
            
        case 'charge.dispute.closed':
            const won = dispute.status === 'won';
            console.log(`${won ? 'âœ…' : 'âŒ'} LITIGE FERMÃ‰ - ${dispute.status}`);
            
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
    // RÃ©cupÃ©rer le transfer original
    const paymentIntent = await stripe.paymentIntents.retrieve(
        dispute.payment_intent as string,
        { expand: ['latest_charge.transfer'] }
    );
    
    const transfer = (paymentIntent.latest_charge as Stripe.Charge)?.transfer;
    
    if (!transfer) {
        console.error(`âŒ Pas de transfer trouvÃ© pour le dispute ${dispute.id}`);
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
        
        console.log(`âœ… Transfer reversÃ©: ${reversal.id}`);
        
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
        console.error(`âŒ Ã‰chec reversal transfer:`, error);
        // Alerter l'Ã©quipe pour intervention manuelle
        await sendDisputeAlert({
            type: 'reversal_failed',
            don: klubDon,
            dispute: dispute,
            error: error.message
        });
    }
}
```

#### 11.9.7 Ã‰volutions SchÃ©ma pour les Disputes

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

#### 11.9.8 PrÃ©vention des Litiges

| Mesure | Description | EfficacitÃ© |
|--------|-------------|------------|
| **3D Secure (SCA)** | Authentification forte obligatoire en France | â­â­â­ |
| **AVS/CVC checks** | VÃ©rification adresse + code de sÃ©curitÃ© | â­â­ |
| **Email confirmation** | Envoi immÃ©diat aprÃ¨s le don | â­â­â­ |
| **Statement descriptor clair** | `DONACTION - NomAssociation` | â­â­ |
| **Radar for Fraud Teams** | RÃ¨gles ML anti-fraude Stripe | â­â­â­ |
| **Blocklist** | Bloquer donateurs frauduleux rÃ©cidivistes | â­â­ |

> **Statistique :** Les plateformes de dons ont gÃ©nÃ©ralement un taux de dispute < 0.1% grÃ¢ce Ã  la nature volontaire des transactions.

#### 11.9.9 Tableau de Bord Disputes (Admin)

PrÃ©voir une section dans le dashboard admin pour :

| FonctionnalitÃ© | PrioritÃ© |
|----------------|----------|
| Liste des litiges en cours | âœ… P1 |
| Statut et deadline de chaque litige | âœ… P1 |
| Bouton "Voir dans Stripe Dashboard" | âœ… P1 |
| Historique des litiges fermÃ©s | âš ï¸ P2 |
| Statistiques (taux de dispute, wins/losses) | âš ï¸ P2 |
| Upload de preuves directement (embedded component) | âŒ P3 |

### 11.10 Test en Mode Sandbox

#### 11.10.1 CrÃ©er un Compte Test

```bash
# Via Stripe CLI
stripe accounts create \
  --type=express \
  --country=FR \
  --capabilities[card_payments][requested]=true \
  --capabilities[transfers][requested]=true \
  --business_type=non_profit
```

#### 11.10.2 Simuler l'Onboarding

```bash
# GÃ©nÃ©rer lien d'onboarding
stripe account_links create \
  --account=acct_xxx \
  --refresh_url="https://re7.donaction.fr/onboarding/refresh" \
  --return_url="https://re7.donaction.fr/onboarding/complete" \
  --type=account_onboarding
```

#### 11.10.3 Tester les Webhooks Localement

```bash
# Ã‰couter les webhooks en local
stripe listen --forward-to localhost:1437/api/klub-don-payments/stripe-web-hooks

# Pour les Ã©vÃ©nements Connect
stripe listen --forward-connect-to localhost:1437/api/stripe-connect/webhook

# DÃ©clencher un Ã©vÃ©nement test
stripe trigger payment_intent.succeeded
stripe trigger charge.dispute.created
```

#### 11.10.4 Cartes de Test

| NumÃ©ro | RÃ©sultat |
|--------|----------|
| `4242 4242 4242 4242` | Paiement rÃ©ussi |
| `4000 0000 0000 0002` | Carte refusÃ©e |
| `4000 0025 0000 3155` | Requiert 3D Secure |
| `4000 0000 0000 9995` | Fonds insuffisants |
| `4000 0000 0000 0259` | **GÃ©nÃ¨re un dispute** |

### 11.11 Checklist de Configuration

```
â–¡ Platform Profile complÃ©tÃ©
â–¡ Account type = Express
â–¡ Capabilities configurÃ©es (card_payments, transfers)
â–¡ Branding configurÃ© (logo, couleurs, nom)
â–¡ Webhook Account crÃ©Ã© + secret rÃ©cupÃ©rÃ©
â–¡ Webhook Connect crÃ©Ã© + secret rÃ©cupÃ©rÃ© (incluant dispute events)
â–¡ ClÃ©s API Live rÃ©cupÃ©rÃ©es
â–¡ Variables d'environnement configurÃ©es
â–¡ Test crÃ©ation compte Express en mode test
â–¡ Test paiement avec destination charge en mode test
â–¡ Test rÃ©ception webhooks en mode test
â–¡ Test simulation dispute en mode test
â–¡ Handler dispute implÃ©mentÃ©
â–¡ Alertes dispute configurÃ©es
```

### 11.12 Ressources et Liens Utiles

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

> **Document gÃ©nÃ©rÃ© le :** 2025-01-10  
> **Auteur :** Claude (Anthropic) - Architecte Solution  
> **Statut :** PrÃªt pour revue et implÃ©mentation
