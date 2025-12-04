
# Planning détaillé — 3 / 6 / 12 mois (Roadmap de livraison)

## Règles
- MVP focalisé sur l'onboarding Stripe + reçus fiscaux + dashboard club minimal
- Itérations bimensuelles (sprints de 2 semaines)
- Déploiement progressif vertical par vertical

---

## Mois 0 (préparation)
- Audit technique + juridique
- Backlog MVP
- Mise en place des environnements (dev/test/prod)

---

## 3 mois — Objectifs (MVP)
### Sprint 1 (Semaines 1-2)
- Spécifications Stripe Connect
- Endpoint `create-account-link`
- Modèles Strapi : tenants, clubs (tenantId)
- Playground / sandbox Stripe

### Sprint 2 (Semaines 3-4)
- Onboarding Stripe complet (flow redirection)
- Stockage `stripeAccountId`
- Basic UI : bouton "Connecter Stripe" dans Angular

### Sprint 3 (Semaines 5-6)
- Création Checkout Sessions (backend)
- Webhook `checkout.session.completed`
- Génération PDF reçu (template simple)

### Sprint 4 (Semaines 7-8)
- Dashboard club : liste projets, dons (read)
- Tests end-to-end (paiement)
- Onboard 3 clubs pilotes

**Livrable 3 mois** : Clubs peuvent connecter Stripe, collecter des dons, générer reçus.

---

## 6 mois — Objectifs (Scale & Theming)
### Mois 4
- Theming multi-tenant (Next.js)
- Admin SaaS : création tenants / brands
- Emails transactionnels & templates

### Mois 5
- Options monetization : subscription + application_fee
- Module exports comptables
- Tests de charge initiaux

### Mois 6
- Onboarding 20 clubs (pilot expansion)
- Intégration collecte feedback + itérations UX

**Livrable 6 mois** : Plateforme thématisée, modèle de monétisation testé, 20 clubs actifs.

---

## 12 mois — Objectifs (Maturation)
### Mois 7-9
- Marketplace add-ons (CRM, analytics, IA)
- Automatisations (newsletters, relances)
- Internationalisation (FR/EN)

### Mois 10-12
- Partenariats avec fédérations / collectivités
- Optimisations infra / coût
- Plan commercial & scaling (sales + growth)

**Livrable 12 mois** : Produit mature, verticales multiples, stratégie commerciale en place.

---
