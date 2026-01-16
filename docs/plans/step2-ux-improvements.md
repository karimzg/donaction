# Plan UX - Step 2 Formulaire de Don

> **Date**: 2025-01-16
> **Scope**: `donaction-saas/src/components/sponsorshipForm/components/formBody/steps/step2/`
> **Status**: En cours

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

### Phase 4: États Hover/Focus & Micro-interactions (Medium Priority)
**Fichiers**: `step2/index.scss`, `AdressInputs.svelte`

- [ ] 4.1 Transitions hover/focus sur tous les inputs
- [ ] 4.2 Focus ring accessible (3px shadow)
- [ ] 4.3 Animation "unlock" quand adresse auto-remplie
- [ ] 4.4 Placeholder adresse raccourci
- [ ] 4.5 Helper text sous le champ adresse

**CSS**:
```scss
.don-form-input {
  transition: border-color 200ms ease, box-shadow 200ms ease;

  &:hover:not(:focus):not(:disabled) {
    border-color: var(--gray-400);
  }

  &:focus {
    border-color: var(--primary-blue);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    outline: none;
  }
}
```

---

### Phase 5: Animations de Transition (Medium Priority)
**Fichiers**: `step2.svelte`, `step2/index.scss`

- [ ] 5.1 Animation fade-slide pour sections conditionnelles
- [ ] 5.2 Bouton avec états hover/active/loading
- [ ] 5.3 Respect `prefers-reduced-motion`

**CSS**:
```scss
@media (prefers-reduced-motion: no-preference) {
  .don-form-row {
    animation: fadeSlideIn 250ms ease-out;
  }
}

@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
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

- [ ] WCAG 2.1 AA respecté (focus visible, contraste)
- [ ] `prefers-reduced-motion` respecté
- [ ] Tests manuels sur les 3 états du formulaire
- [ ] Pas de régression fonctionnelle
- [ ] Build sans erreur

---

## Notes

- Les transitions restent entre 150-300ms
- Couleur primaire: `#3B82F6` (blue-500)
- Couleur erreur: `#EF4444` (red-500)
