# Project Visibility Throughout Form Journey - UI/UX Proposals

## Context
When a donor selects a specific project to support (rather than the general club), we want to maintain visibility of this project throughout the entire donation form journey to reinforce the emotional connection and donation purpose.

---

## Solution 1: Floating Project Card (Sidebar)

### Concept
A compact, floating card that remains visible on the right side of the form throughout all steps.

### Visual
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌──────────────────────────────┐    ┌────────────────────────┐ │
│  │                              │    │ [PROJECT IMAGE]        │ │
│  │      FORM STEP CONTENT       │    │ Vous soutenez:         │ │
│  │                              │    │ "Nom du projet"        │ │
│  │                              │    │ ████████░░ 75%         │ │
│  │                              │    │ 7,500€ / 10,000€       │ │
│  └──────────────────────────────┘    └────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation
- Fixed position card on right side (desktop)
- Collapses to sticky header on mobile
- Shows: project image (small), title, progress bar
- Subtle animation when user scrolls

### Pros
- Always visible without interrupting form flow
- Strong visual reminder
- Progress bar creates urgency

### Cons
- Takes horizontal space on smaller screens
- May feel cluttered on step 1

### Effort: Medium (new component + responsive handling)

---

## Solution 2: Persistent Top Banner (Recommended)

### Concept
A slim, elegant banner at the top of the form that persists across all steps, showing project context with minimal space usage.

### Visual
```
┌─────────────────────────────────────────────────────────────────┐
│ 🎯 Vous soutenez: "Rénovation du gymnase"  │  75% financé      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      FORM STEP CONTENT                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation
- Add to `formBody` component (wraps all steps)
- Slim 40-48px height
- Uses brand color as background
- White text for contrast
- Progress percentage badge on right

### Pros
- Minimal vertical space
- Works perfectly on all screens
- Professional, modern look
- Easy to implement (single component)

### Cons
- Less visual impact than full card
- No project image shown

### Effort: Low (simple component addition)

---

## Solution 3: Dynamic Step Headers with Project Context

### Concept
Each step header dynamically includes project context, transforming generic headers into personalized, project-aware messages.

### Visual Examples

**Step 1 (Amount):**
```
┌─────────────────────────────────────────────────────────────────┐
│  [PROJECT THUMBNAIL]                                            │
│  Contribuez à "Rénovation du gymnase"                          │
│  Objectif: 10,000€ • Déjà collecté: 7,500€ • Reste: 2,500€     │
├─────────────────────────────────────────────────────────────────┤
│  Je souhaite aider ce projet à hauteur de:                      │
│  [10€] [50€] [100€] [200€]                                     │
└─────────────────────────────────────────────────────────────────┘
```

**Step 2 (Info):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Votre don de 50€ pour "Rénovation du gymnase"                 │
│  Coût réel: 17€ après réduction d'impôts                       │
├─────────────────────────────────────────────────────────────────┤
│  Vos informations pour le reçu fiscal:                          │
└─────────────────────────────────────────────────────────────────┘
```

**Step 3 (Payment):**
```
┌─────────────────────────────────────────────────────────────────┐
│  Finalisez votre don de 50€                                    │
│  pour "Rénovation du gymnase"                                  │
│  🎉 Vous faites partie des 127 donateurs!                      │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation
- Modify each step header component
- Pass project data through props
- Conditional rendering based on hasSelectedProject

### Pros
- Deeply integrated experience
- Each step feels personalized
- Emotional connection maintained
- Contextual information (donor count, remaining goal)

### Cons
- More complex implementation
- Requires changes to multiple files
- Text may become long on mobile

### Effort: High (multiple component changes)

---

## Recommendation

**Solution 2 (Persistent Top Banner)** is recommended because:

1. **Simplicity**: Single component, easy to maintain
2. **Consistency**: Same UI across all steps
3. **Performance**: Minimal DOM changes during navigation
4. **Responsiveness**: Works well on all screen sizes
5. **Non-intrusive**: Doesn't compete with form content

### Hybrid Approach (Optional Enhancement)

Combine Solution 2 + elements of Solution 3:
- Top banner for persistent visibility (Solution 2)
- Enhanced headers on Step 1 only with full project card (already implemented)
- Dynamic "Your donation for X" text on Steps 2-3 headers (light Solution 3)

---

## Implementation Priority

1. **Phase 1**: Implement Solution 2 (banner) - 1-2 hours
2. **Phase 2**: Add dynamic header text to Step 2/3 - 1 hour
3. **Phase 3** (optional): Full Solution 3 for premium experience - 3-4 hours
