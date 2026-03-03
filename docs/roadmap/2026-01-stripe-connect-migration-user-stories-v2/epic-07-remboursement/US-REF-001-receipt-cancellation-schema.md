# US-REF-001 : Schéma receipt_cancellations

> **Epic**: 7 - Remboursement | **Priorité**: P2 | **Estimation**: 3 points

```json
{
  "klubDon": { "type": "relation", "target": "api::klub-don.klub-don" },
  "originalReceiptId": { "type": "string" },
  "reason": { "type": "text" },
  "status": { "type": "enumeration", "enum": ["awaiting_declaration", "completed", "rejected"] },
  "approvedBy": { "type": "relation", "target": "admin::user" },
  "declarationSignedAt": { "type": "datetime" }
}
```
