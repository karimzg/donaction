# US-DOC-002 : Signature responsable sur reçu

> **Epic**: 6 - Documents Fiscaux | **Priorité**: P0 | **Estimation**: 3 points

## 📋 Description

Intégrer la signature uploadée sur le reçu fiscal.

```typescript
const templateData = {
  managerSignature: klubr.managerSignature?.url,
  managerName: klubr.managerName,
  managerTitle: klubr.managerTitle || 'Président(e)',
};
```

## Fallback

Si pas de signature uploadée → Utiliser signature par défaut DONACTION.
