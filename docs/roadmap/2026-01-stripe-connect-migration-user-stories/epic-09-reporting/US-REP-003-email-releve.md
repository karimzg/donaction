# US-REP-003 : Envoyer le relevé par email aux leaders

> **Epic**: 9 - Reporting | **Priorité**: P2 | **Estimation**: 2 points

## 📋 Description

Envoyer automatiquement le relevé de frais par email à tous les leaders de l'association.

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Envoi après génération
  Given un fee_statement vient d'être généré
  When sendFeeStatement est appelé
  Then un email est envoyé à chaque leader du klubr
  And le PDF est en pièce jointe
  And fee_statement.status = "sent"
  And fee_statement.sent_at = now()
```

## 📐 Template Email

```
Objet: Relevé de frais DONACTION - Janvier 2025

Bonjour {LEADER_NAME},

Veuillez trouver ci-joint le relevé de frais de votre association pour le mois de Janvier 2025.

Récapitulatif:
- Nombre de dons: {DONATION_COUNT}
- Total collecté: {TOTAL_DONATIONS} €
- Total des frais: {TOTAL_FEES} €
- Net reçu: {NET_AMOUNT} €

Ce relevé est disponible dans votre espace DONACTION.

L'équipe DONACTION
```

## ✅ Definition of Done

- [ ] Template Brevo créé
- [ ] Envoi après génération PDF
- [ ] PDF en pièce jointe
- [ ] Mise à jour statut
- [ ] PR approuvée et mergée
