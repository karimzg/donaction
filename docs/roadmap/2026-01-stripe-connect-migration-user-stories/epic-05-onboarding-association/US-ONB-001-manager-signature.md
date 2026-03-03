# US-ONB-001 : Ajouter le champ `managerSignature` au schéma `klubr`

> **Epic**: 5 - Onboarding Association | **Priorité**: P0 | **Estimation**: 1 point

---

## ⚠️ Condition de Garde

Ce champ est requis uniquement pour les associations avec `stripe_connect === true`.

---

## 📋 Description

**En tant que** association,
**Je veux** pouvoir uploader la signature de mon responsable,
**Afin qu'** elle apparaisse sur les reçus fiscaux émis au nom de l'association.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Upload de signature
  Given un klubr avec stripe_connect activé
  When le responsable uploade une image de sa signature
  Then l'image est stockée dans klubr.managerSignature
  And le format accepté est PNG ou JPG
  And la taille max est 500x200 pixels

Scenario: Validation document onboarding
  Given un klubr avec managerSignature vide
  And trade_policy.stripe_connect = true
  When je vérifie requiredDocsValidatedCompletion
  Then le score est inférieur à 100%
```

---

## 📐 Spécifications Techniques

### Schéma klubr

```json
{
  "managerSignature": {
    "type": "media",
    "allowedTypes": ["images"],
    "required": false
  }
}
```

### Validation

```typescript
// klubr/services/klubr.ts
function validateManagerSignature(file: UploadedFile): boolean {
  const allowedMimes = ['image/png', 'image/jpeg'];
  const maxWidth = 500;
  const maxHeight = 200;
  
  if (!allowedMimes.includes(file.mime)) {
    throw new Error('Format de signature invalide. PNG ou JPG requis.');
  }
  
  // Vérification dimensions via sharp ou similaire
  const dimensions = await getImageDimensions(file);
  if (dimensions.width > maxWidth || dimensions.height > maxHeight) {
    throw new Error(`Dimensions max: ${maxWidth}x${maxHeight}px`);
  }
  
  return true;
}
```

---

## ✅ Definition of Done

- [ ] Champ media ajouté au schéma
- [ ] Validation format et dimensions
- [ ] Interface dashboard Angular pour upload
- [ ] Documentation pour les utilisateurs
- [ ] PR approuvée et mergée
