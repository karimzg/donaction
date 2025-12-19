<script lang="ts">
  import step1 from './steps/step1/step1.svelte';
  import step2 from './steps/step2/step2.svelte';
  import step3 from './steps/step3/step3.svelte';
  import step4 from './steps/step4/step4.svelte';
  import step5 from './steps/step5/step5.svelte';
  import type { Component } from 'svelte';

  let { index, slides }: { index: number; slides: Array<any> } = $props();

  let component: Component | null = $derived.by(() => {
    switch (index) {
      case 0:
        return step1;
      case 1:
        return step2;
      case 2:
        return step3;
      case 3:
        return step4;
      case 4:
        return step5;
      default:
        return null;
    }
  });
</script>

<div class="formBodyContainer" style="margin: auto 0">
  {#if component}
    {#if !!$$slots['c-g-u']}
      <svelte:component this={component} {index}>
        <div slot="stripe-payment-form">
          <slot name="stripe-payment-form"></slot>
        </div>
        <div slot="c-g-u">
          <slot name="c-g-u"></slot>
        </div>
      </svelte:component>
    {:else}
      <svelte:component this={component} {index} {slides}>
        <div slot="stripe-payment-form">
          <slot name="stripe-payment-form"></slot>
        </div>
      </svelte:component>
    {/if}
  {/if}
</div>

<style lang="scss">
  @use './index';
</style>
