# Skill: Svelte Stores

## When to use
For cross-component state that needs to be shared across the widget, especially when:
- State needs to be accessed from multiple unrelated components
- You need store-specific features (derived, readable)
- Compatibility with Svelte 4 patterns

**Note**: In Svelte 5, prefer `$state` in `.svelte.ts` files for most cases.

## Key Concepts
- `writable()` - Read/write store
- `readable()` - Read-only store with setup function
- `derived()` - Computed from other stores
- `$` prefix for auto-subscription in components
- `get()` for one-time value read

## Recommended Patterns

### Writable Store
```typescript
// utils/stores.ts
import { writable } from 'svelte/store';

// Simple value
export const isSubmitting = writable(false);

// Object
export const formData = writable({
  amount: 50,
  frequency: 'once',
  donorType: 'individual',
});

// With initial setup
export const currentStep = writable(0);

// Reset function
export function resetForm() {
  formData.set({
    amount: 50,
    frequency: 'once',
    donorType: 'individual',
  });
  currentStep.set(0);
  isSubmitting.set(false);
}
```
**Why**: Stores persist across component lifecycle, good for form wizard state.

### Using Stores in Components
```svelte
<script lang="ts">
  import { isSubmitting, formData, currentStep } from '../utils/stores';

  // Auto-subscription with $ prefix
  // Automatically unsubscribes on component destroy

  function handleNext() {
    $currentStep++;
  }

  function updateAmount(value: number) {
    $formData.amount = value;
    // or
    formData.update(data => ({ ...data, amount: value }));
  }
</script>

{#if $isSubmitting}
  <p>Envoi en cours...</p>
{:else}
  <p>Étape {$currentStep + 1}</p>
  <input
    type="number"
    value={$formData.amount}
    oninput={(e) => updateAmount(Number(e.target.value))}
  />
  <button onclick={handleNext}>Suivant</button>
{/if}
```
**Why**: `$` prefix handles subscription and cleanup automatically.

### Derived Store
```typescript
// utils/stores.ts
import { derived } from 'svelte/store';

export const formData = writable({
  amount: 50,
  frequency: 'monthly',
});

export const taxReduction = writable(0.66);

// Derived from single store
export const yearlyAmount = derived(formData, ($formData) =>
  $formData.frequency === 'monthly' ? $formData.amount * 12 : $formData.amount
);

// Derived from multiple stores
export const netCost = derived(
  [formData, taxReduction],
  ([$formData, $taxReduction]) => $formData.amount * (1 - $taxReduction)
);

// Async derived (with set)
export const donorInfo = derived(
  formData,
  ($formData, set) => {
    if (!$formData.email) {
      set(null);
      return;
    }

    fetch(`/api/donors/check?email=${$formData.email}`)
      .then(res => res.json())
      .then(data => set(data))
      .catch(() => set(null));
  },
  null // Initial value
);
```
**Why**: Derived stores auto-update when dependencies change.

### Readable Store (External Data)
```typescript
// utils/stores.ts
import { readable } from 'svelte/store';

// Time-based
export const currentTime = readable(new Date(), (set) => {
  const interval = setInterval(() => {
    set(new Date());
  }, 1000);

  // Cleanup when no subscribers
  return () => clearInterval(interval);
});

// Window size
export const windowSize = readable(
  { width: 0, height: 0 },
  (set) => {
    if (typeof window === 'undefined') return;

    const update = () => {
      set({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    update();
    window.addEventListener('resize', update);

    return () => window.removeEventListener('resize', update);
  }
);
```
**Why**: Readable stores wrap external data sources with automatic cleanup.

### Reading Without Subscription
```typescript
import { get } from 'svelte/store';
import { formData, currentStep } from '../utils/stores';

// One-time read (no subscription)
async function submitForm() {
  const data = get(formData);
  const step = get(currentStep);

  // Use values without subscribing
  await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```
**Why**: `get()` reads current value without creating subscription.

### Event Bus Pattern
```typescript
// utils/eventBus.ts
import { writable } from 'svelte/store';

interface BusEvent {
  type: string;
  payload?: any;
}

function createEventBus() {
  const { subscribe, set } = writable<BusEvent | null>(null);

  return {
    subscribe,
    emit: (type: string, payload?: any) => {
      set({ type, payload });
      // Reset after emit
      setTimeout(() => set(null), 0);
    },
  };
}

export const eventBus = createEventBus();

// Emitting
eventBus.emit('form:complete', { donationId: '123' });

// Listening (in component)
$: if ($eventBus?.type === 'form:complete') {
  handleComplete($eventBus.payload);
}
```
**Why**: Cross-component communication without prop drilling.

### Store with Validation
```typescript
// utils/stores.ts
import { writable, derived } from 'svelte/store';

export const email = writable('');
export const amount = writable(50);

export const validation = derived(
  [email, amount],
  ([$email, $amount]) => ({
    email: {
      valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($email),
      error: $email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($email)
        ? 'Email invalide'
        : null,
    },
    amount: {
      valid: $amount >= 1,
      error: $amount < 1 ? 'Montant minimum: 1€' : null,
    },
    isFormValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($email) && $amount >= 1,
  })
);
```
**Why**: Centralized validation derived from form state.

## Detailed Anti-patterns

### ❌ Forgetting Unsubscribe (Manual)
```svelte
<script lang="ts">
  import { onDestroy } from 'svelte';
  import { formData } from '../utils/stores';

  // Wrong - memory leak
  formData.subscribe(data => {
    console.log(data);
  });

  // Correct - manual unsubscribe
  const unsubscribe = formData.subscribe(data => {
    console.log(data);
  });
  onDestroy(unsubscribe);

  // Better - use $ prefix (auto-unsubscribes)
  $: console.log($formData);
</script>
```
**Problem**: Manual subscriptions leak if not cleaned up.
**Solution**: Use `$` prefix or manually unsubscribe in `onDestroy`.

### ❌ Mutating Store Object Directly
```svelte
<script lang="ts">
  // Wrong - won't trigger update
  $formData.amount = 100; // Object mutation doesn't notify

  // Correct - use update or set
  formData.update(d => ({ ...d, amount: 100 }));
</script>
```
**Problem**: Direct mutation doesn't trigger store notification.
**Solution**: Use `.set()` or `.update()` methods.

## Checklist
- [ ] Using `$` prefix for auto-subscription
- [ ] Cleanup with `onDestroy` for manual subscriptions
- [ ] Using `.update()` for partial object changes
- [ ] `get()` for one-time reads
- [ ] Derived stores for computed values
- [ ] Consider `.svelte.ts` with `$state` for Svelte 5
