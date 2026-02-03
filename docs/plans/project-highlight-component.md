# Plan: ProjectHighlight Component

> **Date**: 2026-01-21
> **Status**: Pending approval
> **App**: donaction-saas

## Objectif

Mettre en avant les informations du projet lors d'un don projet, avec une jauge dynamique qui prévisualise l'impact du don sélectionné.

---

## Données disponibles (API decrypt)

| Champ | Type | Usage |
|-------|------|-------|
| `titre` | string | Titre du projet |
| `montantAFinancer` | number | Objectif cagnotte (ex: 6000) |
| `montantTotalDonations` | number \| null | Montant récolté (à ajouter à l'API) |
| `dateLimiteFinancementProjet` | string | Date limite (ex: "2026-01-09") |
| `descriptionCourte` | RichText[] | Description (accordéon) |
| `couverture` | object | Image projet (background desktop) |

---

## Design

### Desktop (> 768px) - Avec image background
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ╔═══════════════════════════════════════════════════════╗  │
│  ║                    FORMULAIRE                         ║  │
│  ║  ┌─────────────────────────────────────────────────┐  ║  │
│  ║  │ 🎯 Mon projet génial                        ▼   │  ║  │
│  ║  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 43% → 47%   │  ║  │
│  ║  │ 2 400 € récolté  ·  + 200 € avec votre don     │  ║  │
│  ║  │ 🔥 5 jours restants                             │  ║  │
│  ║  └─────────────────────────────────────────────────┘  ║  │
│  ╚═══════════════════════════════════════════════════════╝  │
│                                                             │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░  IMAGE PROJET FLOUE (backdrop)  ░░░░░░░░░░░░░░░  │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### ProjectHighlight - État fermé
```
┌─────────────────────────────────────────────────────┐
│ 🎯 Mon projet génial                          ▼     │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 43% → 47%     │
│ 2 400 € récolté  ·  + 200 € avec votre don         │
│ 🔥 5 jours restants                                 │
└─────────────────────────────────────────────────────┘
```

### ProjectHighlight - État ouvert (accordéon)
```
┌─────────────────────────────────────────────────────┐
│ 🎯 Mon projet génial                          ▲     │
├─────────────────────────────────────────────────────┤
│ Lorem ipsum dolor sit amet, consectetur adipiscing  │
│ elit. Vestibulum congue leo non libero...           │
├─────────────────────────────────────────────────────┤
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 43% → 47%     │
│ 2 400 € récolté  ·  + 200 € avec votre don         │
│ 🔥 5 jours restants                                 │
└─────────────────────────────────────────────────────┘
```

### Mobile (< 480px)
```
┌───────────────────────────────┐
│ 🎯 Mon projet génial      ▼  │
│ ━━━━━━━━━━━━━━━━━━━━ 43%→47% │
│ +200 € · 5j restants          │
└───────────────────────────────┘
```

### Jauge dynamique
- Partie "actuelle": couleur primaire pleine
- Partie "projection" (don): couleur primaire à 50% opacity
- Animation: `transition: width 300ms ease-out`

### Image background (desktop only)
- Affichée derrière l'overlay du formulaire
- Effet: `filter: blur(20px)` + `opacity: 0.3`
- Couvre tout l'écran (`position: fixed; inset: 0`)
- Masquée sur mobile (< 768px)

---

## Tâches

### Phase 1: Composant de base
- [ ] 1.1 Créer `ProjectHighlight.svelte` dans `sponsorshipForm/components/projectHighlight/`
- [ ] 1.2 Implémenter les props TypeScript
- [ ] 1.3 Ajouter la jauge statique avec CSS
- [ ] 1.4 Créer `index.scss` avec styles de base

### Phase 2: Réactivité au montant
- [ ] 2.1 Connecter `selectedAmount` au calcul de progression
- [ ] 2.2 Animer la partie "projection" du don (couleur différenciée)
- [ ] 2.3 Afficher le pourcentage actuel → nouveau (ex: "43% → 47%")

### Phase 3: Accordéon description
- [ ] 3.1 Ajouter état `isExpanded` avec toggle sur le header
- [ ] 3.2 Afficher `descriptionCourte` entre titre et jauge quand ouvert
- [ ] 3.3 Animation slide/fade pour l'ouverture (max-height transition)
- [ ] 3.4 Icône ▼/▲ pour indiquer l'état

### Phase 4: Badge urgence
- [ ] 4.1 Calculer jours restants depuis `dateLimiteFinancementProjet`
- [ ] 4.2 Afficher badge si < 7 jours (🔥 X jours restants)
- [ ] 4.3 Masquer si date dépassée ou > 7 jours

### Phase 5: Responsive
- [ ] 5.1 Breakpoint 768px: layout horizontal/vertical
- [ ] 5.2 Breakpoint 480px: version ultra-compacte
- [ ] 5.3 Touch targets >= 44px sur mobile
- [ ] 5.4 Accordéon fonctionnel au tap sur mobile

### Phase 6: Image background (desktop)
- [ ] 6.1 Ajouter élément background dans le composant parent (index.svelte ou overlay)
- [ ] 6.2 Afficher `couverture.url` en position fixed, plein écran
- [ ] 6.3 Appliquer `filter: blur(20px)` + `opacity: 0.3`
- [ ] 6.4 Masquer sur mobile (< 768px) via media query
- [ ] 6.5 Transition fade-in au chargement de l'image

### Phase 7: Intégration
- [ ] 7.1 Intégrer sur Step 1 (après header, avant montants)
- [ ] 7.2 Intégrer sur Step 3 (dans le header récapitulatif)
- [ ] 7.3 Supprimer les anciens affichages projet redondants
- [ ] 7.4 Connecter l'image background au composant principal

---

## Props TypeScript

```typescript
interface ProjectHighlightProps {
  project: {
    titre: string;
    montantAFinancer: number;
    montantTotalDonations: number | null;
    dateLimiteFinancementProjet: string | null;
    descriptionCourte: Array<{ type: string; children: any[] }>;
  };
  selectedAmount: number;
  variant?: 'default' | 'compact';
}
```

---

## Fichiers à créer/modifier

| Fichier | Action |
|---------|--------|
| `sponsorshipForm/components/projectHighlight/ProjectHighlight.svelte` | Créer |
| `sponsorshipForm/components/projectHighlight/index.scss` | Créer |
| `sponsorshipForm/index.svelte` | Modifier (image background) |
| `sponsorshipForm/index.scss` | Modifier (styles background) |
| `sponsorshipForm/components/formBody/steps/step1/step1.svelte` | Modifier |
| `sponsorshipForm/components/formBody/steps/step3/step3.svelte` | Modifier |

---

## Dépendances

- `RichTextBlock.svelte` (existant dans `utils/richTextBlock/`) - pour description accordéon
- Variables CSS du design system (`--don-*`)

---

## Critères de validation

- [ ] Jauge réactive au changement de montant (projection visible)
- [ ] Accordéon ouvre/ferme avec animation fluide
- [ ] Description affichée entre titre et jauge quand accordéon ouvert
- [ ] Badge urgence affiché si < 7 jours
- [ ] Responsive sur 3 breakpoints (480, 768, desktop)
- [ ] Touch targets >= 44px sur mobile
- [ ] Image background floue visible sur desktop uniquement
- [ ] Image masquée sur mobile (< 768px)
- [ ] Animations respectent `prefers-reduced-motion`
- [ ] Intégré sur Step 1 et Step 3

---

## Notes

- Le champ `montantTotalDonations` n'est pas retourné par l'API actuellement → utiliser `0` comme fallback
- Ne pas afficher la jauge si `montantAFinancer` est null/0
- Accordéon fermé par défaut pour garder le composant compact
- Image background: précharger avec `loading="eager"` pour éviter le flash
- Si pas d'image `couverture`, ne pas afficher de background (pas de fallback)
