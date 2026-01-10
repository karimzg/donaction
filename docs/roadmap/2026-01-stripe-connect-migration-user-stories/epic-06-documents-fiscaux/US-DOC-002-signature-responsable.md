# US-DOC-002 : Intégrer la signature du responsable sur le reçu

> **Epic**: 6 - Documents Fiscaux | **Priorité**: P0 | **Estimation**: 2 points

## ⚠️ Condition de Garde

La signature n'est intégrée que si `stripe_connect === true`.

## 📋 Description

Incruster l'image de la signature du responsable (`klubr.managerSignature`) sur le reçu fiscal PDF.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Signature présente
  Given klubr.managerSignature existe
  And trade_policy.stripe_connect = true
  When le reçu est généré
  Then l'image est incrustée à la position (350, 100) avec taille 150x60

Scenario: Signature absente
  Given klubr.managerSignature est vide
  When le reçu est généré
  Then un placeholder "Signature en attente" est affiché
  And une alerte admin est créée
```

## 📐 Implémentation

```typescript
async function embedSignature(pdfDoc: PDFDocument, signatureUrl: string) {
  const signatureBytes = await fetch(signatureUrl).then(r => r.arrayBuffer());
  const signatureImage = signatureUrl.endsWith('.png')
    ? await pdfDoc.embedPng(signatureBytes)
    : await pdfDoc.embedJpg(signatureBytes);
  
  const page = pdfDoc.getPages()[0];
  page.drawImage(signatureImage, {
    x: 350,
    y: 100,
    width: 150,
    height: 60,
  });
}
```

## ✅ Definition of Done

- [ ] Incrustation d'image implémentée
- [ ] Fallback si signature absente
- [ ] Tests avec différents formats (PNG, JPG)
- [ ] PR approuvée et mergée
