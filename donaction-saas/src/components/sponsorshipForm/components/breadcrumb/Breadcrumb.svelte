<script lang="ts">
  import { SUBSCRIPTION } from '../../logic/useSponsorshipForm.svelte';

  let { index, isBeingFilled }: { index: number; isBeingFilled: boolean } = $props();

  // Steps for progress indicator (excluding thank you page from dots)
  const steps = ['Don', 'Infos', 'Récap', 'Paiement'];
  const totalSteps = steps.length;
</script>

<header class="don-header" class:don-header--modal={isBeingFilled}>
  <!-- Logo -->
  <div class="don-header__logo">
    {#if SUBSCRIPTION.klubr?.logo?.url}
      <img
        src={SUBSCRIPTION.klubr.logo.url}
        alt={SUBSCRIPTION.klubr?.denomination || 'Logo'}
        class="don-header__logo-img"
      />
    {/if}
    <span class="don-header__name">{SUBSCRIPTION.klubr?.denomination || ''}</span>
  </div>

  <!-- Progress dots -->
  <nav class="don-header__progress" aria-label="Étapes du formulaire">
    {#each steps as step, i}
      <button
        type="button"
        class="don-header__dot"
        class:don-header__dot--active={i === index}
        class:don-header__dot--completed={i < index}
        aria-label="{step} - Étape {i + 1} sur {totalSteps}"
        aria-current={i === index ? 'step' : undefined}
        disabled
      >
        <span class="don-header__dot-inner"></span>
      </button>
    {/each}
  </nav>
</header>

<style lang="scss">
  @use '../../../../styles/main';

  .don-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--don-spacing-lg) var(--don-spacing-xl);
    background-color: var(--don-color-bg-card);
    border-bottom: 1px solid var(--don-color-border-light);
    min-height: 48px;
    box-sizing: border-box;
    gap: var(--don-spacing-lg);

    @media screen and (min-width: 640px) {
      padding: var(--don-spacing-xl) var(--don-spacing-3xl);
      min-height: 56px;
    }

    &--modal {
      position: sticky;
      top: 0;
      z-index: 10;
      border-radius: var(--don-radius-3xl) var(--don-radius-3xl) 0 0;
    }
  }

  .don-header__logo {
    display: flex;
    align-items: center;
    gap: var(--don-spacing-md);
    min-width: 0;
    flex-shrink: 1;
  }

  .don-header__logo-img {
    height: 24px;
    width: auto;
    max-width: 80px;
    object-fit: contain;

    @media screen and (min-width: 640px) {
      height: 32px;
      max-width: 120px;
    }
  }

  .don-header__name {
    font-size: var(--don-font-size-sm);
    font-weight: var(--don-font-weight-semibold);
    color: var(--don-color-text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 120px;

    @media screen and (min-width: 640px) {
      font-size: var(--don-font-size-base);
      max-width: 200px;
    }

    @media screen and (max-width: 400px) {
      display: none;
    }
  }

  .don-header__progress {
    display: flex;
    align-items: center;
    gap: var(--don-spacing-md);
    flex-shrink: 0;

    @media screen and (min-width: 640px) {
      gap: var(--don-spacing-lg);
    }
  }

  .don-header__dot {
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 12px;
    height: 12px;
    cursor: default;

    @media screen and (min-width: 640px) {
      width: 14px;
      height: 14px;
    }
  }

  .don-header__dot-inner {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--don-color-border);
    transition: all var(--don-transition-normal);

    @media screen and (min-width: 640px) {
      width: 10px;
      height: 10px;
    }
  }

  .don-header__dot--active .don-header__dot-inner {
    background-color: var(--don-brand-primary, var(--don-color-primary));
    transform: scale(1.2);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--don-brand-primary, var(--don-color-primary)) 20%, transparent);
  }

  .don-header__dot--completed .don-header__dot-inner {
    background-color: var(--don-brand-primary, var(--don-color-primary));
  }
</style>
