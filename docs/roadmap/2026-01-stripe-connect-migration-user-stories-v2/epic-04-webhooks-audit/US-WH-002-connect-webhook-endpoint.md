# US-WH-002 : Endpoint /stripe-connect/webhook

> **Epic**: 4 - Webhooks | **Priorité**: P0 | **Estimation**: 5 points

## 📋 Description

Créer l'endpoint dédié aux événements des comptes connectés.

## 🎯 Événements gérés

- `account.updated`
- `account.application.deauthorized`
- `payout.failed`
- `charge.dispute.created`
- `charge.dispute.updated`
- `charge.dispute.closed`

## 📐 Configuration

Secret distinct : `STRIPE_WEBHOOK_SECRET_CONNECT`
