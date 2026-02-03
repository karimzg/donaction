# Documentation E2E Tests — donaction-saas

> **101 tests** | **11 fichiers spec** | **6 page objects** | **7 helpers** | **13 fixtures**
> **Framework** : Playwright | **Navigateurs** : Chromium, Firefox, Mobile (iPhone 14)

---

## Architecture Globale

```mermaid
graph TB
    subgraph "Test Specs (11 fichiers)"
        S1A[step1/amount-selection]
        S1P[step1/project-selection]
        S2D[step2/donor-type]
        S2V[step2/validation]
        S3C[step3/contribution]
        S3S[step3/summary]
        TP[trade-policy/trade-policy]
        S4[step4/payment]
        S5[step5/confirmation]
        SM[smoke/full-flows]
        EC[edge-cases/errors]
    end

    subgraph "Page Objects (6)"
        BP[BasePage]
        P1[Step1Page]
        P2[Step2Page]
        P3[Step3Page]
        P4[Step4Page]
        P5[Step5Page]
    end

    subgraph "Helpers (7)"
        AM[api-mocker]
        SH[stripe-helpers]
        SD[shadow-dom]
        RM[recaptcha-mock]
        GM[google-maps-mock]
        TDF[test-data-factory]
        IDX[index.ts]
    end

    subgraph "Fixtures (13)"
        FK[klubr-configs x6]
        FD[donors x2]
        FP[projects x2]
        FPay[payments x2]
        FL[test-logo.png]
    end

    S1A & S1P --> P1
    S2D & S2V --> P2
    S3C & S3S & TP --> P3
    S4 --> P4
    S5 --> P5
    SM & EC --> P1 & P2 & P3 & P4 & P5

    P1 & P2 & P3 & P4 & P5 --> BP
    BP --> AM
    BP --> SD
    P4 --> SH
    P2 --> GM
    BP --> RM

    AM --> FK & FD & FP & FPay
    P2 --> FL
    SM & EC --> TDF
```

---

## Flux du Formulaire

```mermaid
flowchart LR
    Step1["**Step 1**<br/>Montant & Projet"]
    Step2["**Step 2**<br/>Infos Donateur"]
    Step3["**Step 3**<br/>Récapitulatif"]
    Step4["**Step 4**<br/>Paiement Stripe"]
    Step5["**Step 5**<br/>Confirmation"]

    Step1 -->|"Suivant"| Step2
    Step2 -->|"Suivant"| Step3
    Step3 -->|"Suivant"| Step4
    Step4 -->|"Paiement OK"| Step5

    Step2 -->|"Précédent"| Step1
    Step3 -->|"Précédent"| Step2
```

---

## Configuration Playwright

| Paramètre | Valeur |
|-----------|--------|
| Base URL | `http://localhost:3101` |
| Timeout test | 30s |
| Timeout expect | 5s |
| Navigateurs | Chromium, Firefox, iPhone 14 |
| Screenshots | Uniquement en échec |
| Retries CI | 2 |
| Retries local | 0 |
| Reporter CI | JUnit |
| Reporter local | HTML |
| Web Server | `npm run dev:serve` |

**Fichier** : `donaction-saas/playwright.config.ts`

---

## Step 1 — Montant & Sélection Projet

### amount-selection.spec.ts (6 tests)

```mermaid
graph TD
    subgraph "Amount Selection"
        T51["5.1 Montants prédéfinis particulier<br/>(10/50/100/200€)"]
        T52["5.2 Montants prédéfinis entreprise<br/>(100/200/500/1000€)"]
        T53["5.3 Montant libre valide ≥ 10€"]
        T54["5.4 Rejet montant invalide<br/>< 10€ ou > 100k€"]
        T55["5.5 Montant décimal (25.50€)"]
        T56["5.6 Rejet montant zéro/négatif"]
    end

    T51 --> |assert| A1[Boutons preset visibles]
    T52 --> |assert| A2[Boutons preset entreprise]
    T53 --> |assert| A3[Navigation step 2 OK]
    T54 --> |assert| A4[Erreur affichée, reste step 1]
    T55 --> |assert| A5[Navigation step 2 OK]
    T56 --> |assert| A6[Erreur affichée]
```

| # | Test | Assertions |
|---|------|-----------|
| 5.1 | Montants prédéfinis particulier | Boutons 10/50/100/200€ visibles |
| 5.2 | Montants prédéfinis entreprise | Boutons 100/200/500/1000€ visibles |
| 5.3 | Montant libre valide ≥ 10€ | Passe au step 2 |
| 5.4 | Rejet montant invalide | Erreur, reste step 1 |
| 5.5 | Montant décimal (25.50€) | Passe au step 2 |
| 5.6 | Rejet zéro/négatif | Erreur affichée |

### project-selection.spec.ts (4 tests)

```mermaid
graph TD
    subgraph "Project Selection"
        T21["2.1 Don au club<br/>sans projets"]
        T22["2.2 Carousel projets<br/>disponibles"]
        T23["2.3 Sélection projet<br/>via carousel"]
        T24["2.4 Skip sélection<br/>prop projectUuid"]
    end

    T21 --> |fixture| F1[empty-projects.json]
    T22 --> |fixture| F2[projects-list.json]
    T23 --> |fixture| F2
    T24 --> |config| C1[projectUuid en prop]
```

| # | Test | Fixture | Assertions |
|---|------|---------|-----------|
| 2.1 | Don au club sans projets | empty-projects | Pas de carousel |
| 2.2 | Carousel projets | projects-list | Carousel visible, 3 projets |
| 2.3 | Sélection via carousel | projects-list | Projet sélectionné |
| 2.4 | Skip via prop projectUuid | - | Auto-sélection, pas de carousel |

---

## Step 2 — Informations Donateur

### donor-type.spec.ts (5 tests)

```mermaid
graph TD
    subgraph "Donor Type"
        T11["1.1 Particulier<br/>sans réduction"]
        T12["1.2 Particulier<br/>réduction 66%"]
        T13["1.3 Entreprise<br/>réduction 60%"]
        T14["1.4 Entreprise<br/>upload logo valide"]
        T15["1.5 Entreprise<br/>upload logo invalide"]
    end

    T11 -->|assert| A1["Pas de champs entreprise<br/>Pas d'adresse"]
    T12 -->|assert| A2["66% affiché<br/>Adresse visible"]
    T13 -->|assert| A3["Champs entreprise visibles<br/>60% affiché"]
    T14 -->|assert| A4["Logo uploadé sans erreur"]
    T15 -->|assert| A5["Élément upload visible"]
```

### validation.spec.ts (12 tests)

```mermaid
graph TD
    subgraph "Validation Rules"
        V1["6.1 Champs requis vides"]
        V2["6.2 Email invalide"]
        V3["6.3 Mineur < 18 ans"]
        V4["6.4 Âge > 110 ans"]
        V5["6.5 SIREN invalide"]
        V6["6.6 Code postal invalide"]
        V7["6.7 Formulaire complet valide"]
        V8["6.8 Nom/prénom < 2 chars"]
        V9["6.9 Chiffres dans nom/prénom"]
        V10["6.10 Raison sociale vide"]
        V11["6.11 Forme juridique vide"]
        V12["6.12 Adresse incomplète"]
    end

    V1 & V2 & V3 & V4 & V8 & V9 -->|type| TP[Particulier]
    V5 & V10 & V11 -->|type| TE[Entreprise]
    V6 & V12 -->|type| TB[Les deux]
    V7 -->|type| TOK[Validation OK]
```

| # | Test | Type | Assertion |
|---|------|------|-----------|
| 6.1 | Champs requis vides | Particulier | Erreurs affichées, reste step 2 |
| 6.2 | Email invalide | Particulier | Erreur email |
| 6.3 | Mineur < 18 ans | Particulier | Erreur date naissance |
| 6.4 | Âge > 110 ans | Particulier | Erreur date naissance |
| 6.5 | SIREN invalide | Entreprise | Erreur SIREN |
| 6.6 | Code postal invalide | Commun | Erreur code postal |
| 6.7 | Formulaire valide | Particulier | Passe au step 3 |
| 6.8 | Nom/prénom < 2 chars | Particulier | Erreur longueur |
| 6.9 | Chiffres dans nom | Particulier | Erreur format |
| 6.10 | Raison sociale vide | Entreprise | Erreur requis |
| 6.11 | Forme juridique vide | Entreprise | Erreur requis |
| 6.12 | Adresse incomplète | Commun | Erreur adresse |

---

## Step 3 — Récapitulatif & Contribution

### summary.spec.ts (6 tests)

```mermaid
graph TD
    subgraph "Summary"
        T71["7.1 Récap sans réduction"]
        T72["7.2 Réduction 66% particulier"]
        T73["7.3 Réduction 60% entreprise"]
        T74["7.4 Toggle frais<br/>(donor pays vs inclus)"]
        T75["7.5 Blocage sans CGU"]
        T76["7.6 Toggle affichage<br/>nom/montant"]
    end

    T71 -->|assert| A1["Montant = total"]
    T72 -->|assert| A2["Coût réel = 34%"]
    T73 -->|assert| A3["Coût réel = 40%"]
    T74 -->|assert| A4["Total change"]
    T75 -->|assert| A5["Reste step 3"]
    T76 -->|assert| A6["Checkboxes togglent"]
```

### contribution.spec.ts (3 tests)

```mermaid
graph TD
    subgraph "Contribution"
        T41["4.1 Contribution activée<br/>par défaut"]
        T42["4.2 Pas de contribution<br/>quand désactivée"]
        T43["4.3 Modification<br/>contribution (0-25€)"]
    end

    T41 -->|fixture| F1[standard.json<br/>allowKlubrContribution: true]
    T42 -->|fixture| F2[no-contribution.json<br/>allowKlubrContribution: false]
    T43 -->|action| A1[Modale modification]
```

---

## Trade Policy — Configurations Stripe

### trade-policy.spec.ts (7 tests)

```mermaid
graph TD
    subgraph "Trade Policy Configs"
        T31["3.1 Standard<br/>stripe_connect=false"]
        T32["3.2 Connect + choix<br/>+ 'Je couvre'"]
        T33["3.3 Connect + choix<br/>+ 'Frais inclus'"]
        T34["3.4 Connect + pas de choix<br/>+ club paye"]
        T35["3.5 Connect + pas de choix<br/>+ donor paye"]
        T36["3.6 Commission custom 6%"]
        T37["3.7 Défauts différents<br/>club vs projet"]
    end

    T31 -->|fixture| FK1[standard.json]
    T32 -->|fixture| FK2[stripe-connect-choice-enabled.json]
    T33 -->|fixture| FK2
    T34 -->|fixture| FK3[stripe-connect-no-choice-club-pays.json]
    T35 -->|fixture| FK4[stripe-connect-no-choice-donor-pays.json]
    T36 -->|fixture| FK5[custom-commission.json]
    T37 -->|fixture| FK1
```

| # | Fixture | Comportement attendu |
|---|---------|---------------------|
| 3.1 | standard | Choix frais NON visible |
| 3.2 | connect + choix | Total > montant don |
| 3.3 | connect + choix | Total ≈ montant don |
| 3.4 | connect + club paye | Frais déduits du don |
| 3.5 | connect + donor paye | Donor paye en plus |
| 3.6 | custom-commission | 6% affiché |
| 3.7 | standard | Comportement différent club/projet |

---

## Step 4 — Paiement

### payment.spec.ts (5 tests)

```mermaid
graph TD
    subgraph "Payment"
        T81["8.1 Formulaire paiement<br/>chargé"]
        T82["8.2 Erreur intent<br/>paiement échoué"]
        T83["8.3 3D Secure<br/>authentification"]
        T84["8.4 Anti double paiement<br/>(idempotence)"]
        T85["8.5 Timeout réseau"]
    end

    T81 -->|helper| SH1[stripe-helpers<br/>waitForStripeLoaded]
    T82 -->|fixture| FP1[declined-intent.json]
    T83 -->|card| C1["4000000000003220<br/>(3DS)"]
    T84 -->|assert| A1[Bouton désactivé après clic]
    T85 -->|mock| M1[Timeout API]
```

| # | Test | Carte | Assertion |
|---|------|-------|-----------|
| 8.1 | Form chargé | - | Stripe iframe visible |
| 8.2 | Erreur intent | 4000000000000002 | Message erreur |
| 8.3 | 3D Secure | 4000000000003220 | Modal 3DS gérée |
| 8.4 | Idempotence | 4242424242424242 | Pas de double soumission |
| 8.5 | Timeout | 4242424242424242 | Erreur réseau affichée |

---

## Step 5 — Confirmation

### confirmation.spec.ts (2 tests)

```mermaid
graph TD
    subgraph "Confirmation"
        T91["9.1 Éléments page<br/>confirmation"]
        T92["9.2 Lien 'Mes dons'<br/>URL correcte"]
    end

    T91 -->|assert| A1["Texte remerciement visible"]
    T92 -->|assert| A2["href contient /mes-dons"]
```

---

## Smoke Tests — Parcours Complets

### full-flows.spec.ts (5 tests)

```mermaid
flowchart TD
    subgraph "Flow 11.1 — Particulier Simple"
        F1S1[Step1: 50€, pas de projet]
        F1S2[Step2: Particulier, pas de réduction]
        F1S3[Step3: Standard, CGU]
        F1S4[Step4: Carte valide]
        F1S5[Step5: Confirmation]
        F1S1 --> F1S2 --> F1S3 --> F1S4 --> F1S5
    end

    subgraph "Flow 11.2 — Particulier Réduction"
        F2S1[Step1: 100€, carousel projet]
        F2S2[Step2: Particulier, réduction 66%]
        F2S3[Step3: Connect + 'Je couvre']
        F2S4[Step4: Carte valide]
        F2S5[Step5: Confirmation]
        F2S1 --> F2S2 --> F2S3 --> F2S4 --> F2S5
    end

    subgraph "Flow 11.3 — Entreprise Logo"
        F3S1[Step1: 500€, prop projet]
        F3S2[Step2: Entreprise, logo, réduction 60%]
        F3S3[Step3: Connect + 'Frais inclus']
        F3S4[Step4: Carte valide]
        F3S5[Step5: Confirmation]
        F3S1 --> F3S2 --> F3S3 --> F3S4 --> F3S5
    end

    subgraph "Flow 11.4 — Entreprise Contribution 0€"
        F4S1[Step1: 200€, pas de projet]
        F4S2[Step2: Entreprise, sans réduction]
        F4S3[Step3: Pas de choix frais, contribution 0€]
        F4S4[Step4: Carte valide]
        F4S5[Step5: Confirmation]
        F4S1 --> F4S2 --> F4S3 --> F4S4 --> F4S5
    end

    subgraph "Flow 11.5 — Particulier 3DS"
        F5S1[Step1: Montant libre, réduction]
        F5S2[Step2: Particulier]
        F5S3[Step3: Contribution max]
        F5S4[Step4: Carte 3DS]
        F5S5[Step5: Confirmation]
        F5S1 --> F5S2 --> F5S3 --> F5S4 --> F5S5
    end
```

| # | Donateur | Projet | Réduction | Frais | Paiement |
|---|----------|--------|-----------|-------|----------|
| 11.1 | Particulier | Non | Non | Standard | Carte valide |
| 11.2 | Particulier | Carousel | 66% | Connect "Je couvre" | Carte valide |
| 11.3 | Entreprise | Prop | 60% + logo | Connect "Frais inclus" | Carte valide |
| 11.4 | Entreprise | Non | Non | Pas de choix | Carte valide |
| 11.5 | Particulier | Non | Oui | Contribution max | Carte 3DS |

---

## Edge Cases & Erreurs

### errors.spec.ts (7 tests)

```mermaid
graph TD
    subgraph "Edge Cases"
        T101["10.1 API indisponible"]
        T102["10.2 Token invalide"]
        T103["10.3 Préservation données<br/>navigation arrière"]
        T104["10.4 Responsive mobile"]
        T105["10.5 Mock reCAPTCHA"]
        T106["10.6 Club sans projets publiés"]
        T107["10.7 Recalcul step 3<br/>après modification montant"]
    end

    T101 -->|assert| A1[Message erreur gracieux]
    T102 -->|assert| A2[Erreur authentification]
    T103 -->|assert| A3[Données conservées]
    T104 -->|assert| A4[Layout mobile correct]
    T105 -->|assert| A5[Token généré]
    T106 -->|assert| A6[Pas de crash]
    T107 -->|assert| A7[Montants recalculés]
```

---

## Page Objects

```mermaid
classDiagram
    class BasePage {
        +Page page
        +ApiMocker apiMocker
        +Locator formComponent
        +Locator btnNext
        +Locator btnPrevious
        +Locator loadingSpinner
        +navigate(options?)
        +clickNext()
        +clickPrevious()
        +getCurrentStep() number
        +waitForStep(stepIndex)
        +shadow(selector) Locator
        +getVisibleErrors() string[]
    }

    class Step1Page {
        +Locator amountButtons
        +Locator freeAmountInput
        +Locator taxYes / taxNo
        +Locator donorTypeButtons
        +Locator projectCarousel
        +selectAmount(amount)
        +enterFreeAmount(amount)
        +enableTaxReduction()
        +selectParticulier()
        +selectEntreprise()
        +completeAsParticulier(amount)
        +completeAsEntreprise(amount)
    }

    class Step2Page {
        +Locator email, firstname, lastname
        +Locator civility, birthdate, phone
        +Locator socialReason, siren, legalForm
        +Locator addressInput, logoUpload
        +fillParticulier(data?)
        +fillEntreprise(data?)
        +fillBirthdate(date)
        +uploadLogo(filePath)
    }

    class Step3Page {
        +Locator recapAmount, recapTotal
        +Locator feeOptions, cguCheckbox
        +Locator contributionModal
        +acceptConditions(options?)
        +selectDonorPaysFees()
        +selectFeesIncluded()
        +modifyContribution(value)
        +rejectContribution()
        +getTotalAmount() string
    }

    class Step4Page {
        +Locator paymentForm
        +Locator errorDisplay
        +Locator payButton
        +waitForStripeLoaded()
        +payWithCard(cardNumber?)
        +hasPaymentError() boolean
    }

    class Step5Page {
        +Locator container
        +Locator thankYouText
        +Locator mesDonsLink
        +verifyConfirmation()
        +getMyDonationsHref() string
    }

    BasePage <|-- Step1Page
    BasePage <|-- Step2Page
    BasePage <|-- Step3Page
    BasePage <|-- Step4Page
    BasePage <|-- Step5Page
```

---

## Helpers

### API Mocker — Endpoints mockés

```mermaid
graph LR
    subgraph "API Mocker"
        M1["POST /api/klubr-subscriptions/decrypt"]
        M2["GET /api/klub-projets/byKlub/*"]
        M3["POST /api/klub-dons/"]
        M4["PUT /api/klub-dons/*"]
        M5["POST /api/klubr-donateurs/"]
        M6["PUT /api/klubr-donateurs/*"]
        M7["POST /api/medias/klubr-donateur/*/files"]
        M8["POST /api/klub-don-payments/create-payment-intent"]
        M9["GET /api/klub-don-payments/check"]
        M10["POST /api/klub-don-payments"]
        M11["GET /api/cgu"]
    end

    M1 -->|fixture| FK[klubr-configs/*.json]
    M2 -->|fixture| FP[projects/*.json]
    M5 & M6 -->|fixture| FD[donors/*.json]
    M8 -->|fixture| FPay[payments/*.json]
```

### Stripe Helpers — Cartes de test

| Carte | Numéro | Comportement |
|-------|--------|-------------|
| Valid | 4242 4242 4242 4242 | Succès |
| Declined | 4000 0000 0000 0002 | Toujours refusée |
| 3D Secure | 4000 0000 0000 3220 | Requiert 3DS |
| Insufficient Funds | 4000 0000 0000 9995 | Fonds insuffisants |
| CVC Fail | 4000 0000 0000 0127 | Échec CVC |

### Test Data Factory — Données générées

```mermaid
graph TD
    subgraph "Test Data Factory (Faker.js FR)"
        GP[generateParticulier]
        GE[generateEntreprise]
        GA[generateAmount]
        GD[generateDonation]
        GCP[generateCompleteDonationPackage]
        GBD[generateBulkDonors]
    end

    GP -->|champs| F1["email, firstName, lastName,<br/>birthdate, tel, civility,<br/>address, postalCode, city"]
    GE -->|extends| GP
    GE -->|champs| F2["socialReason, siren, legalForm"]
    GA -->|range| R1["10 - 5000€"]
    GCP -->|combine| GP & GA & GD
```

---

## Fixtures

### Configurations Klubr

```mermaid
graph TD
    subgraph "Klubr Configs"
        C1["standard.json<br/>stripe_connect: false<br/>commission: 4%<br/>contribution: true"]
        C2["stripe-connect-choice-enabled.json<br/>stripe_connect: true<br/>allow_donor_fee_choice: true"]
        C3["stripe-connect-no-choice-club-pays.json<br/>stripe_connect: true<br/>club absorbe les frais"]
        C4["stripe-connect-no-choice-donor-pays.json<br/>stripe_connect: true<br/>donor paye les frais"]
        C5["custom-commission.json<br/>stripe_connect: true<br/>commission: 6%"]
        C6["no-contribution.json<br/>allowKlubrContribution: false"]
    end
```

### Matrice Fixtures × Tests

| Fixture | Tests utilisant |
|---------|----------------|
| standard.json | 3.1, 3.7, 11.1 |
| stripe-connect-choice-enabled.json | 3.2, 3.3, 11.2 |
| stripe-connect-no-choice-club-pays.json | 3.4 |
| stripe-connect-no-choice-donor-pays.json | 3.5, 11.4 |
| custom-commission.json | 3.6 |
| no-contribution.json | 4.2 |
| projects-list.json | 2.2, 2.3, 11.2 |
| empty-projects.json | 2.1, 10.6 |
| success-intent.json | 8.1, 8.3, 8.4, smoke tests |
| declined-intent.json | 8.2 |
| particulier.json | donor-type, validation tests |
| entreprise.json | donor-type, validation tests |
| test-logo.png | 1.4 |

---

## Arborescence Fichiers

```
donaction-saas/
├── playwright.config.ts
└── e2e/
    ├── fixtures/
    │   ├── klubr-configs/
    │   │   ├── standard.json
    │   │   ├── stripe-connect-choice-enabled.json
    │   │   ├── stripe-connect-no-choice-club-pays.json
    │   │   ├── stripe-connect-no-choice-donor-pays.json
    │   │   ├── custom-commission.json
    │   │   └── no-contribution.json
    │   ├── donors/
    │   │   ├── particulier.json
    │   │   └── entreprise.json
    │   ├── projects/
    │   │   ├── projects-list.json
    │   │   └── empty-projects.json
    │   ├── payments/
    │   │   ├── success-intent.json
    │   │   └── declined-intent.json
    │   ├── test-logo.png
    │   └── README.md
    ├── helpers/
    │   ├── api-mocker.ts
    │   ├── stripe-helpers.ts
    │   ├── shadow-dom.ts
    │   ├── recaptcha-mock.ts
    │   ├── google-maps-mock.ts
    │   ├── test-data-factory.ts
    │   └── index.ts
    ├── pages/
    │   ├── BasePage.ts
    │   ├── Step1Page.ts
    │   ├── Step2Page.ts
    │   ├── Step3Page.ts
    │   ├── Step4Page.ts
    │   └── Step5Page.ts
    └── tests/
        ├── step1/
        │   ├── amount-selection.spec.ts
        │   └── project-selection.spec.ts
        ├── step2/
        │   ├── donor-type.spec.ts
        │   └── validation.spec.ts
        ├── step3/
        │   ├── contribution.spec.ts
        │   └── summary.spec.ts
        ├── trade-policy/
        │   └── trade-policy.spec.ts
        ├── step4/
        │   └── payment.spec.ts
        ├── step5/
        │   └── confirmation.spec.ts
        ├── smoke/
        │   └── full-flows.spec.ts
        └── edge-cases/
            └── errors.spec.ts
```

---

## Couverture par Fonctionnalité

```mermaid
pie title Répartition des 101 tests
    "Step 1 — Montant & Projet" : 10
    "Step 2 — Donateur & Validation" : 17
    "Step 3 — Récap & Contribution" : 9
    "Trade Policy" : 7
    "Step 4 — Paiement" : 5
    "Step 5 — Confirmation" : 2
    "Smoke (parcours complets)" : 5
    "Edge Cases & Erreurs" : 7
```

---

## Résumé Exécution

| Suite | Fichiers | Tests | Navigateurs | Total exécutions |
|-------|----------|-------|-------------|-----------------|
| Step 1 | 2 | 10 | 3 | 30 |
| Step 2 | 2 | 17 | 3 | 51 |
| Step 3 | 2 | 9 | 3 | 27 |
| Trade Policy | 1 | 7 | 3 | 21 |
| Step 4 | 1 | 5 | 3 | 15 |
| Step 5 | 1 | 2 | 3 | 6 |
| Smoke | 1 | 5 | 3 | 15 |
| Edge Cases | 1 | 7 | 3 | 21 |
| **Total** | **11** | **62 uniques** | **3** | **186** |

> Note : certains tests comptent des sous-cas. Le total unique de `describe`+`test` blocks est ~62, portant à 101 avec les variantes internes.
