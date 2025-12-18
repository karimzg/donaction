# Skill: Svelte Web Components (Custom Elements)

## When to use
When creating embeddable widgets that work on any website, regardless of framework.

## Key Concepts
- Use `<svelte:options customElement={{...}}>` to define custom element
- Tag names must be kebab-case (no uppercase)
- Events need `bubbles: true, composed: true` to escape shadow DOM
- Styles are encapsulated by default

## Recommended Patterns

### Basic Custom Element
```svelte
<!-- components/sponsorshipForm/index.svelte -->
<svelte:options
  customElement={{
    tag: 'klubr-sponsorship-form',
    shadow: 'open',
  }}
/>

<script lang="ts">
  interface Props {
    klubrid: string;
    projectid?: string;
    theme?: 'light' | 'dark';
  }

  let { klubrid, projectid, theme = 'light' }: Props = $props();

  let amount = $state(50);
</script>

<div class="form-container" data-theme={theme}>
  <h2>Faire un don</h2>
  <input type="number" bind:value={amount} />
  <button>Donner {amount}€</button>
</div>

<style lang="scss">
  .form-container {
    padding: 1rem;
    border-radius: 8px;

    &[data-theme='dark'] {
      background: #1a1a1a;
      color: white;
    }
  }
</style>
```

**Usage in any HTML:**
```html
<klubr-sponsorship-form
  klubrid="abc-123"
  projectid="proj-456"
  theme="dark"
></klubr-sponsorship-form>

<script src="klubr-web-components.js"></script>
```
**Why**: Custom elements work everywhere, no framework dependency.

### Emitting Events to Host Page
```svelte
<svelte:options customElement={{ tag: 'klubr-donation-form' }} />

<script lang="ts">
  let { klubrid }: { klubrid: string } = $props();

  function emitComplete(donationData: any) {
    // Must use bubbles + composed to escape shadow DOM
    dispatchEvent(new CustomEvent('donation-complete', {
      detail: donationData,
      bubbles: true,
      composed: true, // Crosses shadow DOM boundary
    }));
  }

  function emitError(error: string) {
    dispatchEvent(new CustomEvent('donation-error', {
      detail: { error },
      bubbles: true,
      composed: true,
    }));
  }

  async function handleSubmit() {
    try {
      const result = await submitDonation();
      emitComplete(result);
    } catch (error) {
      emitError(error.message);
    }
  }
</script>

<form onsubmit={handleSubmit}>
  <!-- form fields -->
</form>
```

**Host page listening:**
```html
<klubr-donation-form klubrid="abc-123"></klubr-donation-form>

<script>
  const form = document.querySelector('klubr-donation-form');

  form.addEventListener('donation-complete', (e) => {
    console.log('Donation completed:', e.detail);
    // Redirect, show message, etc.
  });

  form.addEventListener('donation-error', (e) => {
    console.error('Error:', e.detail.error);
  });
</script>
```
**Why**: Events allow host page to react to widget actions.

### Accessing Shadow DOM
```svelte
<svelte:options customElement={{ tag: 'klubr-widget' }} />

<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    // Access own shadow root
    const host = document.querySelector('klubr-widget');
    const shadow = host?.shadowRoot;

    // Query elements inside shadow DOM
    const button = shadow?.querySelector('.submit-btn');
  });
</script>
```

### Loading External Resources
```svelte
<svelte:options customElement={{ tag: 'klubr-form' }} />

<script lang="ts">
  import { onMount } from 'svelte';

  let stripeLoaded = $state(false);

  onMount(() => {
    // Load Stripe.js
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      stripeLoaded = true;
    };
    document.head.appendChild(script);

    // Load Google Maps
    const mapsScript = document.createElement('script');
    mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    document.head.appendChild(mapsScript);
  });
</script>

{#if stripeLoaded}
  <div id="stripe-element"></div>
{:else}
  <p>Chargement...</p>
{/if}
```
**Why**: External scripts loaded dynamically for isolation.

### Slots for Content Projection
```svelte
<svelte:options customElement={{ tag: 'klubr-card' }} />

<script lang="ts">
  let { title }: { title: string } = $props();
</script>

<div class="card">
  <h3>{title}</h3>
  <div class="content">
    <slot></slot>
  </div>
  <footer>
    <slot name="actions"></slot>
  </footer>
</div>

<style>
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
  }
</style>
```

**Usage:**
```html
<klubr-card title="Mon Club">
  <p>Description du club...</p>
  <div slot="actions">
    <button>Rejoindre</button>
  </div>
</klubr-card>
```

### Vite Build Configuration
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        customElement: true,
      },
    }),
  ],
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'KlubrWebComponents',
      fileName: 'klubr-web-components',
      formats: ['es', 'iife'],
    },
  },
});
```

## Detailed Anti-patterns

### ❌ Uppercase in Tag Name
```svelte
<!-- Wrong - Will fail -->
<svelte:options customElement={{ tag: 'KlubrForm' }} />
<svelte:options customElement={{ tag: 'klubrForm' }} />
```
**Problem**: Custom element spec requires kebab-case with hyphen.
**Solution**: Use `klubr-form`, `my-component`, etc.

### ❌ Missing composed: true
```svelte
// Wrong - Event won't reach host page
dispatchEvent(new CustomEvent('complete', {
  detail: data,
  bubbles: true,
  // Missing composed: true
}));
```
**Problem**: Event stops at shadow DOM boundary.
**Solution**: Always include `composed: true` for external events.

### ❌ Relying on Global CSS
```svelte
<!-- Wrong - Global styles don't penetrate shadow DOM -->
<svelte:options customElement={{ tag: 'my-widget' }} />

<button class="btn-primary">Click</button>
<!-- Host page's .btn-primary won't apply -->
```
**Problem**: Shadow DOM encapsulates styles.
**Solution**: Include all styles in component's `<style>` block.

## Checklist
- [ ] Tag name is kebab-case with hyphen
- [ ] Events have `bubbles: true, composed: true`
- [ ] All styles included in component
- [ ] External scripts loaded dynamically
- [ ] Props are lowercase (HTML attribute convention)
- [ ] Vite configured with `customElement: true`
