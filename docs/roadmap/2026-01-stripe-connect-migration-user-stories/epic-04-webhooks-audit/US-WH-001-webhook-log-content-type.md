# US-WH-001 : Créer le content-type `webhook-log`

> **Epic**: 4 - Webhooks & Audit | **Priorité**: P1 | **Estimation**: 2 points

---

## 📋 Description

**En tant que** développeur backend,
**Je veux** un content-type pour logger tous les événements webhook Stripe,
**Afin de** pouvoir auditer, débugger et garantir l'idempotence.

---

## 🎯 Critères d'Acceptation

```gherkin
Scenario: Création d'un log webhook
  Given un événement Stripe reçu
  When le webhook est traité
  Then un enregistrement webhook_log est créé avec :
    | Champ              | Type        | Requis |
    | event_id           | string      | oui    |
    | event_type         | string      | oui    |
    | source             | enum        | oui    |
    | stripe_account_id  | string      | non    |
    | payload            | json        | oui    |
    | status             | enum        | oui    |
    | processing_error   | text        | non    |
    | retry_count        | integer     | non    |
    | processed_at       | datetime    | non    |

Scenario: Idempotence via event_id
  Given un event_id déjà présent dans webhook_logs
  When le même événement est reçu
  Then il est ignoré avec status = "ignored"
```

---

## 📐 Spécifications Techniques

### Schéma

```json
{
  "kind": "collectionType",
  "collectionName": "webhook_logs",
  "info": {
    "singularName": "webhook-log",
    "pluralName": "webhook-logs",
    "displayName": "Webhook Log"
  },
  "options": { "draftAndPublish": false },
  "attributes": {
    "event_id": { "type": "string", "required": true, "unique": true },
    "event_type": { "type": "string", "required": true },
    "source": {
      "type": "enumeration",
      "enum": ["platform", "connect"],
      "required": true
    },
    "stripe_account_id": { "type": "string" },
    "payload": { "type": "json", "required": true },
    "status": {
      "type": "enumeration",
      "enum": ["received", "processing", "processed", "failed", "ignored"],
      "default": "received"
    },
    "processing_error": { "type": "text" },
    "retry_count": { "type": "integer", "default": 0 },
    "processed_at": { "type": "datetime" },
    "related_don": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::klub-don.klub-don"
    },
    "related_klubr": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::klubr.klubr"
    }
  }
}
```

### Index SQL recommandés

```sql
CREATE INDEX idx_webhook_logs_event_id ON webhook_logs(event_id);
CREATE INDEX idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX idx_webhook_logs_status ON webhook_logs(status);
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at);
```

---

## ✅ Definition of Done

- [ ] Content-type créé via `npm run strapi generate content-type`
- [ ] Index SQL ajoutés dans une migration
- [ ] Permissions API configurées (admin only)
- [ ] Tests d'idempotence
- [ ] PR approuvée et mergée
