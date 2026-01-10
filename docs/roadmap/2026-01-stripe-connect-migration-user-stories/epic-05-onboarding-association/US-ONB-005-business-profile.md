# US-ONB-005 : Ajouter le champ `business_profile` au schéma `connected-account`

> **Epic**: 5 - Onboarding Association | **Priorité**: P2 | **Estimation**: 1 point

## 📋 Description

Stocker les informations business_profile retournées par Stripe pour enrichir les données du compte connecté.

## 🎯 Critères d'Acceptation

- Le champ `business_profile` de type JSON est ajouté au schéma connected-account
- Il est synchronisé lors des webhooks `account.updated`
- Contient : name, url, mcc, support_email, support_phone

## ✅ Definition of Done

- [ ] Champ JSON ajouté au schéma
- [ ] Sync dans le handler webhook
- [ ] PR approuvée et mergée
