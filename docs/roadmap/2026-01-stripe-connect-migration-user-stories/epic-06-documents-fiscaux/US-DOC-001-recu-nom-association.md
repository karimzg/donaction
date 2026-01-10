# US-DOC-001 : Modifier la génération du reçu fiscal pour émettre au nom de l'ASSOCIATION

> **Epic**: 6 - Documents Fiscaux | **Priorité**: P0 | **Estimation**: 5 points

---

## ⚠️ Condition de Garde

```typescript
// Le reçu est émis au nom de l'ASSOCIATION si :
klubr.trade_policy.stripe_connect === true

// Sinon, le reçu est émis au nom de DONACTION (mode Legacy)
```

---

## 📋 Description

**En tant que** donateur,
**Je veux** recevoir un reçu fiscal émis au nom de l'association bénéficiaire,
**Afin d'** avoir un document conforme aux exigences Cerfa.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Reçu Stripe Connect
  Given trade_policy.stripe_connect = true
  And le paiement est réussi
  When le reçu fiscal est généré
  Then l'émetteur est l'ASSOCIATION :
    | Champ              | Source               |
    | Nom                | klubr.denomination   |
    | Adresse            | klubr.adresse        |
    | SIREN              | klubr.SIREN          |
    | Objet              | klubr.objetAssociation |
    | Signature          | klubr.managerSignature |

Scenario: Reçu mode Legacy
  Given trade_policy.stripe_connect = false
  When le reçu fiscal est généré
  Then l'émetteur est DONACTION / Fond Klubr (comportement actuel inchangé)
```

---

## 📐 Implémentation

```typescript
// helpers/klubrPDF/generateInvoice/index.ts

async function generateRecuFiscal(don: KlubDonEntity): Promise<string> {
  const klubr = don.klubr;
  const donateur = don.klubDonateur;
  const tradePolicy = klubr.trade_policy;
  const isStripeConnect = tradePolicy?.stripe_connect === true;
  
  // Charger le template
  const templatePath = donateur.donateurType === 'Organisme'
    ? 'templates/recu-pro-template.pdf'
    : 'templates/recu-template.pdf';
  
  const pdfDoc = await PDFDocument.load(fs.readFileSync(templatePath));
  const form = pdfDoc.getForm();
  
  // === CONDITION DE GARDE : ÉMETTEUR ===
  if (isStripeConnect) {
    // Émetteur = ASSOCIATION
    form.getTextField('emetteur_nom').setText(klubr.denomination);
    form.getTextField('emetteur_adresse').setText(
      `${klubr.adresse}, ${klubr.codePostal} ${klubr.ville}`
    );
    form.getTextField('emetteur_siren').setText(klubr.SIREN || '');
    form.getTextField('emetteur_objet').setText(
      klubr.objetAssociation?.substring(0, 200) || ''
    );
    
    // Signature du responsable
    if (klubr.managerSignature?.url) {
      const signatureImage = await loadImage(klubr.managerSignature.url);
      const page = pdfDoc.getPages()[0];
      page.drawImage(signatureImage, {
        x: 350, y: 100, width: 150, height: 60,
      });
    }
  } else {
    // Mode Legacy : Émetteur = DONACTION
    form.getTextField('emetteur_nom').setText('Fond Klubr');
    form.getTextField('emetteur_adresse').setText(
      '123 Avenue de la République, 75011 Paris'
    );
    form.getTextField('emetteur_siren').setText(process.env.DONACTION_SIREN);
    // Signature DONACTION (pré-intégrée au template)
  }
  
  // Données donateur (identique dans les 2 modes)
  if (donateur.donateurType === 'Organisme') {
    form.getTextField('donateur_raison').setText(donateur.raisonSocial);
    form.getTextField('donateur_siren').setText(donateur.SIREN || '');
  } else {
    form.getTextField('donateur_nom').setText(
      `${donateur.civilite || ''} ${donateur.prenom} ${donateur.nom}`
    );
  }
  form.getTextField('donateur_adresse').setText(
    `${donateur.adresse}, ${donateur.cp} ${donateur.ville}`
  );
  
  // Montant du don
  const montantRecu = isStripeConnect 
    ? getReceiptAmount(don, tradePolicy)  // Voir US-DOC-003
    : don.montant;
  
  form.getTextField('montant_chiffres').setText(`${montantRecu.toFixed(2)} €`);
  form.getTextField('montant_lettres').setText(numberToWords(montantRecu));
  form.getTextField('date_don').setText(formatDate(don.datePaiment));
  
  // Numéro et date d'émission
  form.getTextField('numero_recu').setText(`R-${don.attestationNumber}`);
  form.getTextField('date_emission').setText(formatDate(new Date()));
  
  // Sauvegarder
  const pdfBytes = await pdfDoc.save();
  const outputPath = `private-pdf/recus/R-${don.attestationNumber}.pdf`;
  fs.writeFileSync(outputPath, pdfBytes);
  
  return outputPath;
}
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-ONB-001 | managerSignature disponible |
| Bloque | US-DOC-002 | Intégration signature |
| Bloque | US-DOC-003 | Calcul montant |

---

## ✅ Definition of Done

- [ ] Logique conditionnelle émetteur implémentée
- [ ] Template PDF compatible avec les 2 modes
- [ ] Tests de génération Stripe Connect
- [ ] Tests de régression mode Legacy
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Les templates PDF doivent avoir des champs de formulaire nommés de façon cohérente
- Prévoir un fallback si managerSignature est absente
- Le numéro d'ordre du reçu reste unique globalement (pas par association)
