# US-DIS-001 : Champs disputes sur klub-don

> **Epic**: 10 - Disputes | **Priorité**: P1 | **Estimation**: 2 points

```json
{
  "disputeStatus": { "type": "enumeration", "enum": ["none", "open", "won", "lost"] },
  "disputeId": { "type": "string" },
  "disputeOpenedAt": { "type": "datetime" },
  "disputeClosedAt": { "type": "datetime" },
  "disputeReason": { "type": "string" }
}
```
