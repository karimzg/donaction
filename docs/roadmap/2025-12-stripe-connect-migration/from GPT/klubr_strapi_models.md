
# Modèles de données multi-tenant (Strapi) — Définitions et exemples

## Principes
- Soft multi-tenant : toutes les collections contiennent un champ `tenantId`
- `tenants` contient les marques / verticales (sport, animaux, etc.)
- `brands` contient les variations visuelles / templates par tenant

---

## Collections recommandées

### tenants
```json
{
  "collectionName": "tenants",
  "attributes": {
    "name": { "type": "string", "required": true },
    "slug": { "type": "string", "required": true, "unique": true },
    "domains": { "type": "json" }, 
    "branding": { "type": "relation", "relation": "oneToOne", "target": "api::brand.brand" }
  }
}
```

### brands
```json
{
  "collectionName": "brands",
  "attributes": {
    "name": { "type": "string" },
    "primaryColor": { "type": "string" },
    "secondaryColor": { "type": "string" },
    "logo": { "type": "media" },
    "receiptTemplate": { "type": "media" },
    "emailTemplate": { "type": "richtext" }
  }
}
```

### clubs (associations)
```json
{
  "collectionName": "clubs",
  "attributes": {
    "name": { "type": "string" },
    "slug": { "type": "string", "unique": true },
    "tenantId": { "type": "relation", "relation": "manyToOne", "target": "api::tenant.tenant" },
    "stripeAccountId": { "type": "string" },
    "legalStatus": { "type": "string" },
    "contact": { "type": "json" },
    "documents": { "type": "media", "multiple": true }
  }
}
```

### projects
```json
{
  "collectionName": "projects",
  "attributes": {
    "title": { "type": "string" },
    "description": { "type": "richtext" },
    "club": { "type": "relation", "relation": "manyToOne", "target": "api::club.club" },
    "goalAmount": { "type": "decimal" },
    "collectedAmount": { "type": "decimal" },
    "status": { "type": "string" },
    "tenantId": { "type": "relation", "relation": "manyToOne", "target": "api::tenant.tenant" }
  }
}
```

### donations
```json
{
  "collectionName": "donations",
  "attributes": {
    "amount": { "type": "decimal" },
    "currency": { "type": "string" },
    "donor": { "type": "json" },
    "project": { "type": "relation", "relation": "manyToOne", "target": "api::project.project" },
    "club": { "type": "relation", "relation": "manyToOne", "target": "api::club.club" },
    "stripePaymentId": { "type": "string" },
    "status": { "type": "string" },
    "receiptPdf": { "type": "media" },
    "tenantId": { "type": "relation", "relation": "manyToOne", "target": "api::tenant.tenant" }
  }
}
```

### users
- Ajouter `tenantId` pour chaque user (s'ils appartiennent à un club/tenant)

---

## Middleware tenant (pseudo)
- Lire le header `x-tenant-id` ou résoudre depuis le domaine
- Injecter `ctx.state.tenantId`
- Forcer les queries à ajouter `filters: { tenantId: ctx.state.tenantId }`

---

## Stockage fichiers
- Stocker les fichiers S3 avec un préfixe `tenantId/clubId/...`
- Exemple : `s3://klubr-uploads/tenant-sport/club-123/receipts/2025-01-01.pdf`

