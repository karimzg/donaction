# US-DIS-004 : Alertes Slack/Discord disputes

> **Epic**: 10 - Disputes | **Priorité**: P2 | **Estimation**: 3 points

Notification immédiate lors d'un nouveau litige.

```typescript
await sendSlackAlert({
  channel: '#donaction-alerts',
  text: `🚨 Nouveau litige sur le don ${klubDon.id}`,
  blocks: [/* ... */]
});
```
