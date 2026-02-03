# Plan UX - Step 2 Formulaire de Don

> **Date**: 2025-01-16
> **Scope**: `donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step2/`
> **Status**: Terminé ✅

---

## Contexte

Le Step 2 "Pourquoi saisir ces informations ?" collecte les données personnelles/entreprise pour le reçu fiscal. Il existe 3 états:
- Sans réduction d'impôts
- Avec réduction, Particulier
- Avec réduction, Entreprise

---

## Phases d'Implémentation

### Phase 1: Validation UX (High Priority) ✅
**Fichiers**: `step2.svelte`, `AdressInputs.svelte`, `validator.ts`

- [x] 1.1 Validation après blur uniquement (pas au load)
- [x] 1.2 Animation fade-in des messages d'erreur
- [x] 1.3 Ajout classe `.touched` pour tracking interaction
- [x] 1.4 Style erreur moins agressif (icône + texte)

**CSS ajouté**:
```scss
.don-error {
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 150ms ease, transform 150ms ease;
}
.don-form-group.touched.invalid .don-error {
  opacity: 1;
  transform: translateY(0);
}
```

---

### Phase 2: Date Picker Custom (High Priority) ✅
**Fichiers**: `step2.svelte`, nouveau composant `DatePicker.svelte`

- [x] 2.1 Créer composant `DatePicker.svelte` avec 3 inputs (JJ/MM/AAAA)
- [x] 2.2 Validation automatique (jours valides par mois, année min/max)
- [x] 2.3 Auto-focus sur champ suivant après saisie complète
- [x] 2.4 Intégration dans step2.svelte
- [x] 2.5 Style cohérent avec le reste du formulaire

**Structure**:
```svelte
<DatePicker
  bind:value={DEFAULT_VALUES.birthdate}
  min="1901-01-01"
  max={eighteenYearsAgo()}
  required
/>
```

---

### Phase 3: Upload Logo Amélioré (High Priority) ✅
**Fichiers**: `step2.svelte`, nouveau composant `LogoUpload.svelte`

- [x] 3.1 Créer composant `LogoUpload.svelte`
- [x] 3.2 Zone drag & drop avec feedback visuel
- [x] 3.3 Preview de l'image avec bouton suppression
- [x] 3.4 Validation taille (max 2MB) et format (PNG, JPG, WebP)
- [x] 3.5 État loading pendant upload
- [x] 3.6 Messages d'erreur inline

**Structure**:
```svelte
<LogoUpload
  bind:value={DEFAULT_VALUES.logo}
  maxSize={2 * 1024 * 1024}
  accept={['image/png', 'image/jpeg', 'image/webp']}
/>
```

---

### Phase 4: États Hover/Focus & Micro-interactions (Medium Priority) ✅
**Fichiers**: `step2/index.scss`, `AdressInputs.svelte`

- [x] 4.1 Transitions hover/focus sur tous les inputs
- [x] 4.2 Focus ring accessible (3px shadow)
- [x] 4.3 Animation "unlock" quand adresse auto-remplie
- [x] 4.4 Placeholder adresse raccourci
- [x] 4.5 Helper text sous le champ adresse

**CSS ajouté**:
```scss
.don-form-input {
  transition: border-color 200ms ease, box-shadow 200ms ease;

  &:hover:not(:focus):not(:disabled) {
    border-color: var(--don-color-border-hover);
  }
}

.address-unlock {
  animation: unlockPulse 400ms ease-out;
}

@keyframes unlockPulse {
  0% { background-color: var(--don-color-bg-subtle); }
  50% { background-color: color-mix(in srgb, var(--don-brand-primary) 10%, white); }
  100% { background-color: var(--don-color-bg-input); }
}
```

---

### Phase 5: Animations de Transition (Medium Priority) ✅
**Fichiers**: `step2.svelte`, `step2/index.scss`

- [x] 5.1 Animation fade-slide pour sections conditionnelles
- [x] 5.2 Bouton avec états hover/active/loading (via global styles)
- [x] 5.3 Respect `prefers-reduced-motion`

**CSS ajouté**:
```scss
.don-section-animate {
  animation: fadeSlideIn 250ms ease-out;
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (prefers-reduced-motion: reduce) {
  .don-section-animate, .address-unlock { animation: none !important; }
  .don-form-input, .don-form-select, .don-error { transition: none !important; }
}
```

---

## Fichiers Impactés

| Fichier | Modifications |
|---------|---------------|
| `step2/step2.svelte` | Validation, DatePicker, LogoUpload |
| `step2/AdressInputs.svelte` | Placeholder, helper, animations |
| `step2/index.scss` | Tous les styles |
| `step2/DatePicker.svelte` | **Nouveau** |
| `step2/LogoUpload.svelte` | **Nouveau** |
| `logic/validator.ts` | Support `.touched` |

---

## Critères de Validation

- [x] WCAG 2.1 AA respecté (focus visible, contraste)
- [x] `prefers-reduced-motion` respecté
- [ ] Tests manuels sur les 3 états du formulaire
- [ ] Pas de régression fonctionnelle
- [x] Build sans erreur

---

## Notes

- Les transitions restent entre 150-300ms
- Couleur primaire: `#3B82F6` (blue-500)
- Couleur erreur: `#EF4444` (red-500)
