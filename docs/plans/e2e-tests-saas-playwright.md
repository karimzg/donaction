# Plan : Tests E2E Donaction-SaaS avec Playwright

## Décisions
- **Framework** : Playwright (Shadow DOM + iframes Stripe)
- **API** : Mock via `page.route()` (pas de vrai Strapi)
- **Stripe** : Mode test réel (cartes test 4242...)
- **ReCAPTCHA / Google Maps** : Mockés via `addInitScript()`

## Setup

### 1. Installation
```bash
cd donaction-saas
npm install -D @playwright/test @faker-js/faker
npx playwright install chromium
```

### 2. Scripts package.json
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:headed": "playwright test --headed",
"test:e2e:ci": "playwright test --reporter=junit"
```

### 3. playwright.config.ts
- `testDir: './e2e'`
- `baseURL: 'http://localhost:3101'`
- Projets : chromium, firefox, mobile (iPhone 14)
- `webServer: { command: 'npm run dev:serve', url: 'http://localhost:3101' }`
- Retries: 2 en CI, 0 en local

## Structure fichiers

```
donaction-saas/e2e/
├── fixtures/
│   ├── klubr-configs/          # 6 configs trade_policy JSON
│   │   ├── standard.json
│   │   ├── stripe-connect-choice-enabled.json
│   │   ├── stripe-connect-no-choice-club-pays.json
│   │   ├── stripe-connect-no-choice-donor-pays.json
│   │   ├── custom-commission.json
│   │   └── no-contribution.json
│   ├── projects/
│   │   ├── projects-list.json
│   │   └── empty-projects.json
│   ├── donors/
│   │   ├── particulier.json
│   │   └── entreprise.json
│   ├── payments/
│   │   ├── success-intent.json
│   │   └── declined-intent.json
│   └── test-logo.png           # Fichier logo test
├── helpers/
│   ├── api-mocker.ts           # Interception API via page.route()
│   ├── shadow-dom.ts           # Utilitaires piercing Shadow DOM (>>>)
│   ├── stripe-helpers.ts       # Cartes test + iframe FrameLocator
│   ├── recaptcha-mock.ts       # addInitScript() mock grecaptcha
│   ├── google-maps-mock.ts     # Mock autocomplete
│   └── test-data-factory.ts    # faker-js données FR
├── pages/                      # Page Object Model
│   ├── BasePage.ts             # navigate(), clickNext(), getCurrentStep()
│   ├── Step1Page.ts            # Montant, projet, type donateur
│   ├── Step2Page.ts            # Formulaire donateur, upload
│   ├── Step3Page.ts            # Résumé, frais, CGU
│   ├── Step4Page.ts            # Stripe Elements
│   └── Step5Page.ts            # Confirmation
└── tests/
    ├── step1/
    │   ├── amount-selection.spec.ts     # Axe 5 (6 tests)
    │   └── project-selection.spec.ts    # Axe 2 (4 tests)
    ├── step2/
    │   ├── donor-type.spec.ts           # Axe 1 (5 tests)
    │   └── validation.spec.ts           # Axe 6 (12 tests)
    ├── step3/
    │   ├── summary.spec.ts              # Axe 7 (6 tests)
    │   └── contribution.spec.ts         # Axe 4 (3 tests)
    ├── step4/
    │   └── payment.spec.ts              # Axe 8 (5 tests)
    ├── step5/
    │   └── confirmation.spec.ts         # Axe 9 (2 tests)
    ├── trade-policy/
    │   └── trade-policy.spec.ts         # Axe 3 (7 tests)
    ├── edge-cases/
    │   └── errors.spec.ts               # Axe 10 (7 tests)
    └── smoke/
        └── full-flows.spec.ts           # Axe 11 (5 tests)
```

**Total : 11 fichiers spec, ~62 tests**

## Points techniques clés

### Shadow DOM
```typescript
// Playwright perce automatiquement avec >>>
page.locator('klubr-sponsorship-form >>> [data-testid="btn-next"]')
```
→ **Prérequis** : ajouter des `data-testid` dans les composants Svelte existants

### Stripe Elements (iframe)
```typescript
const stripeFrame = page.frameLocator('iframe[name^="__privateStripeFrame"]');
await stripeFrame.locator('input[name="cardnumber"]').fill('4242424242424242');
```

### API Mocking
Classe `ApiMocker` avec `setupAllMocks(options)` qui intercepte :
- `POST /api/klubr-subscriptions/decrypt` → config klubr
- `GET /api/klub-projets/byKlub/:uuid` → projets
- `POST /api/klub-dons` → création don
- `POST /api/klubr-donateurs` → création donateur
- `POST /api/medias/klubr-donateur/:uuid/files` → upload logo
- `POST /api/klub-don-payments/create-payment-intent` → Stripe
- `GET /api/klub-don-payments/check` → vérification
- `GET /api/cgu` → CGU

### Page HTML de test
Utiliser `index.html` existant (port 3101 via `dev:serve`) avec le web component `<klubr-sponsorship-form>`.

## 59 Use Cases

### Axe 1 — Type donateur (5)
| # | Cas |
|---|-----|
| 1.1 | Particulier sans réduction |
| 1.2 | Particulier avec réduction 66% |
| 1.3 | Entreprise avec réduction 60% |
| 1.4 | Entreprise + upload logo valide |
| 1.5 | Entreprise + logo invalide |

### Axe 2 — Projet (4)
| # | Cas |
|---|-----|
| 2.1 | Don club sans projet |
| 2.2 | Don club, carousel visible, non sélectionné |
| 2.3 | Projet sélectionné via carousel |
| 2.4 | Projet via prop `projectUuid` |

### Axe 3 — Trade Policy (7)
| # | Cas |
|---|-----|
| 3.1 | Standard (`stripe_connect=false`) |
| 3.2 | Stripe Connect + choix + "Je couvre" |
| 3.3 | Stripe Connect + choix + "Frais inclus" |
| 3.4 | Stripe Connect + pas de choix + club paye |
| 3.5 | Stripe Connect + pas de choix + donor paye |
| 3.6 | Commission personnalisée ≠ 4% |
| 3.7 | Défaut différent club vs projet |

### Axe 4 — Contribution (3)
| # | Cas |
|---|-----|
| 4.1 | Contribution activée (défaut) |
| 4.2 | Contribution désactivée |
| 4.3 | Contribution modifiée (0-25€) |

### Axe 5 — Montants (6)
| # | Cas |
|---|-----|
| 5.1 | Preset particulier (10/50/100/200€) |
| 5.2 | Preset entreprise (100/200/500/1000€) |
| 5.3 | Montant libre valide ≥ 10€ |
| 5.4 | Montant invalide (< 10€, > 100k€, sci notation) |
| 5.5 | Montant décimal (25.50€) |
| 5.6 | Montant = 0 ou négatif |

### Axe 6 — Validation Step 2 (12)
| # | Cas |
|---|-----|
| 6.1 | Champs requis vides |
| 6.2 | Email invalide |
| 6.3 | Mineur < 18 ans |
| 6.4 | Date > 110 ans |
| 6.5 | SIREN invalide |
| 6.6 | Code postal invalide |
| 6.7 | Formulaire complet valide |
| 6.8 | Nom/prénom < 2 caractères |
| 6.9 | Chiffres dans nom/prénom |
| 6.10 | Raison sociale vide (entreprise) |
| 6.11 | Forme juridique non sélectionnée |
| 6.12 | Adresse incomplète |

### Axe 7 — Récapitulatif Step 3 (6)
| # | Cas |
|---|-----|
| 7.1 | Résumé sans réduction |
| 7.2 | Résumé réduction 66% |
| 7.3 | Résumé réduction 60% |
| 7.4 | Toggle "je couvre" ↔ "frais inclus" |
| 7.5 | CGU non acceptées |
| 7.6 | Choix affichage nom/montant |

### Axe 8 — Paiement (5)
| # | Cas |
|---|-----|
| 8.1 | Paiement réussi (4242...) |
| 8.2 | Paiement refusé |
| 8.3 | Authentification 3DS |
| 8.4 | Double-clic (idempotence) |
| 8.5 | Timeout/erreur réseau |

### Axe 9 — Confirmation (2)
| # | Cas |
|---|-----|
| 9.1 | Page succès affichée |
| 9.2 | Lien "Mes dons" |

### Axe 10 — Erreurs & Edge Cases (7)
| # | Cas |
|---|-----|
| 10.1 | API indisponible |
| 10.2 | Token invalide |
| 10.3 | Navigation arrière (données conservées) |
| 10.4 | Responsive mobile |
| 10.5 | ReCAPTCHA token |
| 10.6 | Club sans projets publiés |
| 10.7 | Montant modifié → step 3 recalculé |

### Axe 11 — Smoke Tests (5)
| # | Cas |
|---|-----|
| 11.1 | Particulier + sans projet + sans réduction + standard + paiement |
| 11.2 | Particulier + projet carousel + réduction 66% + stripe connect "je couvre" |
| 11.3 | Entreprise + projet prop + réduction 60% + logo + "frais inclus" |
| 11.4 | Entreprise + sans projet + sans choix frais + contribution 0€ |
| 11.5 | Particulier + montant libre + réduction + contribution max + 3DS |

## Ordre d'implémentation

1. **Setup** : Install Playwright, config, scripts
2. **Helpers** : api-mocker, shadow-dom, stripe-helpers, recaptcha-mock, google-maps-mock
3. **Fixtures** : 6 configs JSON, projets, paiements, test-logo.png
4. **data-testid** : Ajouter dans les composants Svelte existants
5. **Page Objects** : BasePage → Step1-5
6. **Tests par axe** : Step 1 → Step 2 → Step 3 → Trade Policy → Step 4 → Step 5 → Edge Cases → Smoke
7. **CI** : Workflow GitHub Actions dédié

## Vérification

- `npm run test:e2e` — exécution locale (chromium)
- `npm run test:e2e:ui` — UI interactive Playwright
- `npm run test:e2e -- --project=mobile` — test responsive
- CI : rapport uploadé en artifact sur échec
