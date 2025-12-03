
# Klubr → SaaS Autonome : Roadmap (Téléchargeable)

## Vision
Transformer Klubr en une plateforme SaaS multi-verticales (sport, animaux, culture, etc.) avec une API commune, dashboard unique et frontends thématisés.

---

## Roadmap — Phases et livrables (MVP-first)

### Phase 0 — Préparation (0-1 semaine)
- Revue technique (audit Angular / Next.js / Strapi)
- Revue fiscale & juridique (CGU / CGV)
- Décision multi-tenant : **soft multi-tenant**
- Rédaction du backlog MVP

### Phase 1 — Spécifications & Architecture (1 semaine)
- Modèle tenant / brands
- Spécifs Stripe Connect (onboarding, webhooks)
- Template reçu fiscal PDF
- Spécifs API (routes clés)
- Plan de migration DB

### Phase 2 — Intégration Stripe Connect (2–4 semaines)
- Endpoint onboarding (accountLinks)
- Stockage `stripe_account_id`
- Création de Checkout sessions côté club
- Webhooks : `checkout.session.completed`, `account.updated`, `payment_intent.succeeded`
- Tests sandbox

### Phase 3 — Génération automatique des reçus fiscaux (1 semaine)
- Template PDF réutilisable (logo, mentions, références)
- Stockage et téléchargement dans Strapi
- Envoi automatique par e-mail

### Phase 4 — Refactor Strapi & API Commune (2–3 semaines)
- Ajout des modèles `tenants`, `brands`, `tenantId`
- Middleware tenant (auth + isolation)
- Uploads séparés par tenant (S3 prefixed paths)
- Routes d’administration multi-tenant

### Phase 5 — Backoffice Angular (2–4 semaines)
- UI onboarding Stripe
- Dashboard dons / projets / reçus
- Statuts Stripe / KYC
- Modules premium (export, CRM, automatisation)

### Phase 6 — Fronts Next.js thématisés (2–3 semaines)
- Theming: logo, couleurs, templates
- Routing dynamique pour tenants
- Pages projets / donation (Checkout)
- SEO multi-domaines

### Phase 7 — Tests et Bêta (2–4 semaines)
- End-to-end Stripe (sandbox)
- Tests UX onboarding
- Tests multi-domaines & SEO
- 5–10 clubs pilotes

### Phase 8 — Lancement progressif (3 mois)
- Déploiement vertical SPORT
- Collecte feedback -> itérations
- Lancement ANIMAUX → CULTURE / autres

### Phase 9 — Scale & Optimisations (continu)
- Monitoring / dashboards
- IA pour contenu projets
- Automatisation emails
- Marketplace d’add-ons

---

## Livrables prioritaires (MVP)
1. Onboarding Stripe Connect fonctionnel
2. Création / collecte de dons directement vers le compte association
3. Génération automatique de reçus PDF (éligibles au mécénat)
4. Dashboard club minimal (projets, dons, reçus)
5. Front thématisé pour SPORT

---

## Risques & Mitigations
- **KYC & conformité Stripe** → utiliser Standard/Custom selon besoin, automatiser onboarding
- **Éligibilité associations** → ajouter module auto-diagnostic & disclaimers légaux
- **Cycles de vente longs** → pilotes avec fédérations / collectivités
- **Coûts infra** → soft multi-tenant + S3 + serverless pour pics

