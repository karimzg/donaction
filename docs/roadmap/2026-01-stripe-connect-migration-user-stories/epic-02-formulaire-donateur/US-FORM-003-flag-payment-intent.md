# US-FORM-003 : Transmettre le flag `donorPaysFee` lors de la création du PaymentIntent

> **Epic**: 2 - Formulaire Donateur | **Priorité**: P0 | **Estimation**: 2 points

---

## ⚠️ Condition de Garde

```typescript
// Cette fonctionnalité ne s'active QUE si :
klubr.trade_policy.stripe_connect === true
```

Si `stripe_connect === false`, le paramètre n'est pas transmis (flux Legacy).

---

## 📋 Description

**En tant que** système frontend,
**Je veux** transmettre le choix `donorPaysFee` du donateur au backend lors de la création du PaymentIntent,
**Afin que** le backend calcule correctement les frais et le montant total.

---

## 🎯 Critères d'Acceptation

### Scénario 1 : Transmission du flag avec Stripe Connect

```gherkin
Given trade_policy.stripe_connect = true
And le donateur a choisi donorPaysFee = true
When le frontend appelle POST /api/klub-don-payments/create-payment-intent
Then le body contient :
  | Champ         | Valeur |
  | price         | 100    |
  | donorPaysFee  | true   |
  | idempotencyKey| abc... |
```

### Scénario 2 : Flag false transmis

```gherkin
Given trade_policy.stripe_connect = true
And le donateur a choisi donorPaysFee = false
When le frontend appelle POST /api/klub-don-payments/create-payment-intent
Then le body contient donorPaysFee = false
```

### Scénario 3 : Mode Legacy - Pas de flag

```gherkin
Given trade_policy.stripe_connect = false
When le frontend appelle POST /api/klub-don-payments/create-payment-intent
Then le body NE contient PAS le champ donorPaysFee
And le backend utilise le comportement Legacy
```

### Scénario 4 : Validation du flag

```gherkin
Given une requête avec donorPaysFee = "invalid"
When le backend reçoit la requête
Then une erreur 400 est retournée
And le message indique "donorPaysFee must be a boolean"
```

---

## 📐 Spécifications Techniques

### Fichier à modifier (Frontend)

```
donaction-saas/src/routes/sponsorshipForm/logic/api.ts
```

### Modification de l'appel API

```typescript
// api.ts

interface CreatePaymentIntentParams {
  price: number;
  idempotencyKey: string;
  donorPaysFee?: boolean;  // NOUVEAU - optionnel pour rétrocompatibilité
  metadata: {
    donUuid: string;
    klubUuid: string;
    projectUuid?: string;
    donorUuid: string;
  };
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams,
  isStripeConnect: boolean
): Promise<{ intent: string; reused: boolean }> {
  const body: Record<string, unknown> = {
    price: params.price,
    idempotencyKey: params.idempotencyKey,
    metadata: params.metadata,
  };
  
  // Ajouter donorPaysFee UNIQUEMENT si Stripe Connect est actif
  if (isStripeConnect && params.donorPaysFee !== undefined) {
    body.donorPaysFee = params.donorPaysFee;
  }
  
  const response = await fetch(`${API_URL}/api/klub-don-payments/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erreur lors de la création du paiement');
  }
  
  return response.json();
}
```

### Fichier à modifier (Step 4)

```svelte
<!-- step4.svelte -->
<script lang="ts">
  import { SUBSCRIPTION } from '../logic/useSponsorshipForm.svelte';
  import { createPaymentIntent } from '../logic/api';
  
  async function initPayment() {
    const isStripeConnect = SUBSCRIPTION.klubr?.trade_policy?.stripe_connect === true;
    
    const { intent } = await createPaymentIntent({
      price: calculatedTotal,
      idempotencyKey: generateIdempotencyKey(),
      donorPaysFee: isStripeConnect ? SUBSCRIPTION.donorPaysFee : undefined,
      metadata: {
        donUuid: SUBSCRIPTION.don.uuid,
        klubUuid: SUBSCRIPTION.klubr.uuid,
        projectUuid: SUBSCRIPTION.project?.uuid,
        donorUuid: SUBSCRIPTION.donateur.uuid,
      },
    }, isStripeConnect);
    
    clientSecret = intent;
  }
</script>
```

---

## 🧪 Tests

### Test unitaire API

```typescript
// api.test.ts
describe('createPaymentIntent', () => {
  it('should include donorPaysFee when stripe_connect is true', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ intent: 'pi_xxx', reused: false }),
    });
    global.fetch = fetchMock;
    
    await createPaymentIntent({
      price: 100,
      idempotencyKey: 'key-123',
      donorPaysFee: true,
      metadata: { donUuid: 'xxx', klubUuid: 'yyy', donorUuid: 'zzz' },
    }, true);
    
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.donorPaysFee).toBe(true);
  });
  
  it('should NOT include donorPaysFee when stripe_connect is false', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ intent: 'pi_xxx', reused: false }),
    });
    global.fetch = fetchMock;
    
    await createPaymentIntent({
      price: 100,
      idempotencyKey: 'key-123',
      donorPaysFee: true,
      metadata: { donUuid: 'xxx', klubUuid: 'yyy', donorUuid: 'zzz' },
    }, false);
    
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.donorPaysFee).toBeUndefined();
  });
});
```

---

## 🔗 Dépendances

| Type | US | Description |
|------|-----|-------------|
| Requiert | US-FORM-001 | Choix donorPaysFee dans le formulaire |
| Bloque | US-PAY-004 | Réception du flag côté backend |

---

## ✅ Definition of Done

- [ ] Paramètre `donorPaysFee` ajouté à l'interface TypeScript
- [ ] Condition de garde `stripe_connect === true` implémentée
- [ ] Tests unitaires sur les 2 modes (Connect / Legacy)
- [ ] Validation du type boolean côté frontend
- [ ] PR approuvée et mergée

---

## 📝 Notes

- Le paramètre est optionnel pour assurer la rétrocompatibilité
- Si non fourni avec Stripe Connect, le backend utilise la valeur par défaut de la trade_policy
