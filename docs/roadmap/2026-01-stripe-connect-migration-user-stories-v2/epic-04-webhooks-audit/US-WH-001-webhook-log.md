# US-WH-001 : Content-type webhook-log

> **Epic**: 4 - Webhooks | **Priorité**: P1 | **Estimation**: 2 points

## 📋 Description

Créer une entité pour logger tous les événements webhook reçus (audit trail).

## 📐 Schéma

```json
{
  "eventId": { "type": "string", "unique": true },
  "eventType": { "type": "string" },
  "payload": { "type": "json" },
  "processedAt": { "type": "datetime" },
  "status": { "type": "enumeration", "enum": ["pending", "processed", "failed"] }
}
```
