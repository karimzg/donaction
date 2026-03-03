# US-REF-003 : Générer le PDF d'attestation d'annulation

> **Epic**: 7 - Remboursement | **Priorité**: P2 | **Estimation**: 3 points

## 📋 Description

Générer automatiquement le PDF d'attestation d'annulation lors de la completion du workflow de remboursement.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Génération après remboursement
  Given un remboursement avec status = "completed"
  When generateCancellationAttestation est appelé
  Then un PDF est généré avec :
    - Numéro du reçu annulé
    - Montant remboursé
    - Date de remboursement
    - Référence à la déclaration du donateur
  And le PDF est attaché à receipt_cancellation.attestation_pdf
  And un email est envoyé au donateur avec le PDF
```

## ✅ Definition of Done

- [ ] Template PDF créé (US-DOC-004)
- [ ] Fonction génération implémentée
- [ ] Attachement au content-type
- [ ] Email avec PDF joint
- [ ] PR approuvée et mergée
