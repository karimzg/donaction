# US-ONB-007 : Email de relance onboarding incomplet

> **Epic**: 5 - Onboarding Association | **Priorité**: P2 | **Estimation**: 2 points

## 📋 Description

Envoyer automatiquement un email de relance aux associations dont l'onboarding Stripe n'est pas terminé après 48h.

## 🎯 Critères d'Acceptation

- Cron job quotidien vérifie les onboarding incomplets
- Email envoyé après 48h, puis 7 jours, puis 14 jours
- Template Brevo avec lien direct vers onboarding

## ✅ Definition of Done

- [ ] Cron job créé
- [ ] Template Brevo configuré
- [ ] Logique de relance (max 3 relances)
- [ ] PR approuvée et mergée
