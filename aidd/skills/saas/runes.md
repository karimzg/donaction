---
name: "svelte-runes"
description: "Use Svelte 5 runes ($state, $derived, $effect, $props) for reactive components"
triggers: ["$state", "$derived", "$effect", "$props", "svelte 5", "runes", "reactive", "reactive state", "computed value", "side effect", "svelte reactivity"]
tags: ["svelte", "saas", "reactivity", "typescript"]
priority: high
scope: file
output: code
---

# Skill: Svelte 5 Runes

## When to use
When building reactive components in Svelte 5. Runes replace the old `$:` reactive syntax.

## Key Concepts
- `$state()` - Reactive local state
- `$derived()` - Computed values (auto-tracks dependencies)
- `$effect()` - Side effects (replaces `$:` for effects)
- `$props()` - Component props with TypeScript
- Runes must be declared at top level, never in conditionals

## Recommended Patterns

### Reactive State with $state
```svelte
<script lang="ts">
  // Basic state
  let count = $state(0);
  let name = $state('');

  // Object state
  let user = $state({
    name: '',
    email: '',
    isActive: false,
  });

  // Array state
  let items = $state<string[]>([]);

  function increment() {
    count++; // Direct mutation works
  }

  function addItem(item: string) {
    items.push(item); // Array methods work
  }

  function updateUser(field: string, value: any) {
    user[field] = value; // Object mutation works
  }
</script>

<button onclick={increment}>Count: {count}</button>
<input bind:value={name} />
```
**Why**: `$state` makes values reactive, UI updates automatically on changes.

### Computed Values with $derived
```svelte
<script lang="ts">
  let price = $state(100);
  let quantity = $state(1);
  let taxRate = $state(0.2);

  // Auto-tracks price, quantity, taxRate
  let subtotal = $derived(price * quantity);
  let tax = $derived(subtotal * taxRate);
  let total = $derived(subtotal + tax);

  // Derived from arrays
  let items = $state([
    { name: 'Item 1', price: 10, qty: 2 },
    { name: 'Item 2', price: 20, qty: 1 },
  ]);

  let cartTotal = $derived(
    items.reduce((sum, item) => sum + item.price * item.qty, 0)
  );

  // Conditional derived
  let status = $derived(total > 100 ? 'premium' : 'standard');
</script>

<p>Subtotal: {subtotal}€</p>
<p>Tax: {tax}€</p>
<p>Total: {total}€ ({status})</p>
```
**Why**: No manual dependency tracking, Svelte figures it out automatically.

### Side Effects with $effect
```svelte
<script lang="ts">
  let searchTerm = $state('');
  let results = $state([]);

  // Runs when searchTerm changes
  $effect(() => {
    if (searchTerm.length < 3) {
      results = [];
      return;
    }

    // Debounced search
    const timeout = setTimeout(async () => {
      const response = await fetch(`/api/search?q=${searchTerm}`);
      results = await response.json();
    }, 300);

    // Cleanup function
    return () => clearTimeout(timeout);
  });

  // Effect for logging (debug)
  $effect(() => {
    console.log('Results updated:', results.length);
  });
</script>

<input bind:value={searchTerm} placeholder="Search..." />
<ul>
  {#each results as result}
    <li>{result.name}</li>
  {/each}
</ul>
```
**Why**: `$effect` handles async operations and cleanup automatically.

### Component Props with $props
```svelte
<script lang="ts">
  interface Props {
    title: string;
    count?: number;
    onSubmit: (data: any) => void;
    children?: import('svelte').Snippet;
  }

  let { title, count = 0, onSubmit, children }: Props = $props();

  // Props are reactive
  let doubled = $derived(count * 2);
</script>

<div>
  <h1>{title}</h1>
  <p>Count: {count}, Doubled: {doubled}</p>
  {@render children?.()}
  <button onclick={() => onSubmit({ count })}>Submit</button>
</div>
```
**Why**: Type-safe props with defaults and destructuring.

### Bindable Props with $bindable
```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import Child from './Child.svelte';
  let value = $state('');
</script>

<Child bind:value />
<p>Parent sees: {value}</p>

<!-- Child.svelte -->
<script lang="ts">
  let { value = $bindable('') }: { value: string } = $props();
</script>

<input bind:value />
```
**Why**: Two-way binding between parent and child components.

### Shared State with .svelte.ts
```typescript
// logic/state.svelte.ts
export const formState = $state({
  step: 0,
  data: {} as Record<string, any>,
  isSubmitting: false,
});

export function nextStep() {
  formState.step++;
}

export function setField(key: string, value: any) {
  formState.data[key] = value;
}

// Component usage
<script lang="ts">
  import { formState, nextStep, setField } from './logic/state.svelte';
</script>

<p>Step: {formState.step}</p>
<button onclick={nextStep}>Next</button>
```
**Why**: Shared reactive state across components without stores.

## Detailed Anti-patterns

### ❌ Runes in Conditionals
```svelte
<script lang="ts">
  let showCounter = $state(true);

  // Wrong - runes must be at top level
  if (showCounter) {
    let count = $state(0); // Error!
  }
</script>
```
**Problem**: Svelte can't track runes declared conditionally.
**Solution**: Declare all runes at top level.

### ❌ Using .set() on $state
```svelte
<script lang="ts">
  let count = $state(0);

  // Wrong - $state doesn't have .set()
  count.set(5); // Error!

  // Correct
  count = 5;
</script>
```
**Problem**: `$state` returns a reactive value, not a store.
**Solution**: Direct assignment works.

### ❌ Manual Dependencies in $derived
```svelte
<script lang="ts">
  let a = $state(1);
  let b = $state(2);

  // Wrong - trying to specify dependencies
  let sum = $derived([a, b], () => a + b); // Error!

  // Correct - auto-tracked
  let sum = $derived(a + b);
</script>
```
**Problem**: `$derived` auto-tracks, no manual deps needed.
**Solution**: Just use the values, Svelte tracks them.

## Checklist
- [ ] Using `$state()` for reactive values
- [ ] Using `$derived()` for computed values
- [ ] Using `$effect()` for side effects with cleanup
- [ ] Using `$props()` for typed component props
- [ ] Runes declared at top level only
- [ ] Direct mutation for state changes
- [ ] `.svelte.ts` files for shared state
