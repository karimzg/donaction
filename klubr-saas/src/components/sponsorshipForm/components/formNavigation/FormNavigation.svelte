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
        <button class="secondary-btn desktop" onclick={() => submitForm(-1)}
          >Étape précédente</button
        >
        <button class="secondary-btn mobile" onclick={() => submitForm(-1)}>
          <img class="previous" alt="précédent" src={previous} />
        </button>
      {/if}
      {#if index < 3}
        <button
          disabled={$isLoading}
          class={`primary-btn self-end ${$isLoading && 'disabled'}`}
          onclick={() => submitForm(1) && isBeingFilled.set(true)}>Étape suivante</button
        >
      {/if}
      {#if index === 3}
        <button
          disabled={$isLoading}
          class={`primary-btn self-end ${$isLoading && 'disabled'} mobile`}
          onclick={pay}
        >
          <span id="button-text">Valider</span>
        </button>
      {/if}
    {/if}
  </div>
{/if}

<style lang="scss">
  @use './index';
</style>
