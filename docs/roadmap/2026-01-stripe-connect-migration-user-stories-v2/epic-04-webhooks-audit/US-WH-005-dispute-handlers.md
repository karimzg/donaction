# US-WH-005 : Handlers disputes

> **Epic**: 4 - Webhooks | **Priorité**: P1 | **Estimation**: 5 points

## 📋 Description

Gérer les événements de litige (charge.dispute.*).

## Événements

- `charge.dispute.created` → Marquer le don, reverser le transfert
- `charge.dispute.updated` → Mettre à jour le statut
- `charge.dispute.closed` → Finaliser (won/lost)
