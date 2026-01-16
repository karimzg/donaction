<script lang="ts">
  import {
    DEFAULT_VALUES,
    isBeingFilled,
    isContributionShown,
    isLoading,
    SUBSCRIPTION
  } from '../../logic/useSponsorshipForm.svelte';

  let { index, submitForm }: { index: number; submitForm: (acc: number) => void } = $props();
  import previous from '../../../../assets/icons/previous.svg';
  import { sendGaEvent } from '../../../../utils/sendGaEvent';

  const contributionSelect = () => {
    isContributionShown.set(false);
    sendGaEvent({
      category: 'contribution',
      label: `closed contribution`,
      value: DEFAULT_VALUES.contributionAKlubr
    });
  };

  const pay = () => {
    const list = document
      .querySelector('klubr-sponsorship-form')
      ?.shadowRoot?.querySelectorAll(`#klubr-sponsorship-form-payment-for`);
    if (list[0]) {
      list[0]?.click();
    }
  };
</script>

{#if !(SUBSCRIPTION.allowProjectSelection && !SUBSCRIPTION.project && index === 0)}
  <div class="btnContainer" style="margin-top: auto; padding-top: 14px;">
    {#if $isContributionShown}
      <button onclick={contributionSelect} class="primary-btn" style="margin: 0 auto;">
        {DEFAULT_VALUES.contributionAKlubr === 0
          ? 'Je décide de ne pas soutenir Klubr'
          : 'Je valide mon soutien'}
      </button>
    {:else}
      {#if ![0, 4].includes(index) || (index === 0 && SUBSCRIPTION.allowProjectSelection)}
        <button
          class="secondary-btn desktop"
          onclick={() => submitForm(-1)}
          aria-label="Retour à l'étape précédente"
        >Étape précédente</button>
        <button
          class="secondary-btn mobile"
          onclick={() => submitForm(-1)}
          aria-label="Retour à l'étape précédente"
        >
          <img class="previous" alt="" src={previous} aria-hidden="true" />
        </button>
      {/if}
      {#if index < 3}
        <button
          disabled={$isLoading}
          class={`primary-btn self-end ${$isLoading ? 'disabled loading' : ''}`}
          onclick={() => submitForm(1) && isBeingFilled.set(true)}
          aria-label="Passer à l'étape suivante"
          aria-busy={$isLoading}
        >
          {#if $isLoading}
            <span class="don-spinner" aria-hidden="true"></span>
          {/if}
          <span class:don-btn-text--hidden={$isLoading}>Étape suivante</span>
        </button>
      {/if}
      {#if index === 3}
        <button
          disabled={$isLoading}
          class={`primary-btn self-end ${$isLoading ? 'disabled loading' : ''} mobile`}
          onclick={pay}
          aria-label="Valider le paiement"
          aria-busy={$isLoading}
        >
          {#if $isLoading}
            <span class="don-spinner" aria-hidden="true"></span>
          {/if}
          <span id="button-text" class:don-btn-text--hidden={$isLoading}>Valider</span>
        </button>
      {/if}
    {/if}
  </div>
{/if}

<style lang="scss">
  @use './index';
</style>
