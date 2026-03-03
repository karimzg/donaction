# US-DOC-004 : Créer le template PDF "Attestation d'annulation"

> **Epic**: 6 - Documents Fiscaux | **Priorité**: P2 | **Estimation**: 3 points

## 📋 Description

Créer un template PDF pour les attestations d'annulation de reçu fiscal (utilisé lors des remboursements).

## 🎯 Critères d'Acceptation

- Template PDF avec champs : numéro reçu annulé, motif, montant remboursé, date
- Référence à la déclaration signée du donateur
- Numérotation : ANN-{attestationNumber}

## 📐 Structure

```
┌─────────────────────────────────────────────────────────┐
│            ATTESTATION D'ANNULATION DE REÇU FISCAL      │
│                                                         │
│  Numéro du reçu annulé: R-{attestationNumber}           │
│  Date d'émission du reçu: {date_recu_original}          │
│                                                         │
│  MOTIF DE L'ANNULATION                                  │
│  [X] Demande du donateur                                │
│  [ ] Erreur de paiement                                 │
│                                                         │
│  REMBOURSEMENT                                          │
│  Montant remboursé: {montant} €                         │
│  Date du remboursement: {date_remboursement}            │
│                                                         │
│  Numéro d'annulation: ANN-{attestationNumber}           │
└─────────────────────────────────────────────────────────┘
```

## ✅ Definition of Done

- [ ] Template PDF créé
- [ ] Fonction de génération implémentée
- [ ] Intégration workflow remboursement
- [ ] PR approuvée et mergée
