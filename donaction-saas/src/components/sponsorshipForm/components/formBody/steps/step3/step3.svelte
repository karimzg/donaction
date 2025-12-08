<script lang="ts">
  import {
    DEFAULT_VALUES,
    isCguShown,
    isContributionShown,
    SUBSCRIPTION
  } from '../../../../logic/useSponsorshipForm.svelte';
  import { validator, validateTrue } from '../../../../logic/validator';
  import { onMount } from 'svelte';
  import { getKlubrCGU } from '../../../../logic/api';
  import LeftArrow from '../../../../../../assets/icons/leftArrow.svg';
  import att_recu from '../../../../../../assets/icons/att_recu.svg';
  import att from '../../../../../../assets/icons/att.svg';
  import alertIcon from '../../../../../../assets/icons/alertIcon.svg';
  import RichTextBlock from '../../../../../../utils/richTextBlock/RichTextBlock.svelte';
  import Contribution from '../../../contribution/Contribution.svelte';
  import email from '../../../../../../assets/icons/email.svg';
  import userAvatar from '../../../../../../assets/icons/userAvatar.svg';
  import resendFiles from '../../../../../../assets/icons/resendFiles.svg';
  import Tooltip from '../../../../../../utils/tooltip/Tooltip.svelte';
  import { calculateTaxReduction } from '../../../../logic/utils';

  const cgu = $state({
    title: '',
    content: []
  });

  onMount(() => {
    if (isNaN(DEFAULT_VALUES.contributionAKlubr)) {
      DEFAULT_VALUES.contributionAKlubr = SUBSCRIPTION.allowKlubrContribution
        ? Math.min(Math.floor(DEFAULT_VALUES.montant * 0.1), 25)
        : 0;
    }
    getKlubrCGU().then((res) => {
      cgu.title = res?.data?.attributes?.titre;
      cgu.content = res?.data?.attributes?.content;
    });
  });
</script>

{#if $isCguShown}
  <div class="klubrCGU w-full flex flex-col gap-2">
    <div class="cguHeader">
      <img
        class="closer absolute cursor-pointer"
        onclick={() => isCguShown.set(false)}
        width={30}
        src={LeftArrow}
        alt={'left-arrow'}
      />
      <h2 class="font-semibold text-center" style="max-width: 300px">
        Conditions Générales d'Utilisation
      </h2>
      <span></span>
    </div>
    <div class="cguBody">
      {#if !!$$slots['c-g-u']}
        <slot name="c-g-u"></slot>
      {:else}
        <RichTextBlock data={cgu.content} />
      {/if}
    </div>
  </div>
{:else if $isContributionShown && SUBSCRIPTION.allowKlubrContribution}
  <Contribution />
{:else}
  <div class="step3 flex flex-col items-center gap-2">
    <p class="recap text-center w-full">Mon récapitulatif</p>
    <div class="recapList flex flex-col gap-1">
      <div class="flex justify-between items-center">
        <div />
        <p class="font-bold">Montant</p>
      </div>
      <div class="flex justify-between items-center gap-1">
        <p>Don à {SUBSCRIPTION.klubr?.denomination}</p>
        <p class="font-bold">{DEFAULT_VALUES.montant} €</p>
      </div>
      {#if SUBSCRIPTION.allowKlubrContribution}
        <div class="separator w-full" style="background: #C1BFBF;" />
        <div class="flex justify-between items-start gap-1">
          <div class="flex flex-col" style="gap: 5px;">
            <p>Soutien à la plateforme Klubr</p>
            <small style="font-size: small; color: #5A5A5A; font-size: 11px;"
              >Merci de votre soutien, qui rend nos services possibles.</small
            >
            <a
              onclick={() => isContributionShown.set(true)}
              style="text-decoration: underline; cursor: pointer;">Modifier le soutien</a
            >
          </div>
          <p class="font-bold">{DEFAULT_VALUES.contributionAKlubr} €</p>
        </div>
      {/if}
      <div class="separator w-full" />
      <div class="flex justify-between items-center gap-1">
        <p>Total</p>
        <p class="font-bold">
          {DEFAULT_VALUES.montant + (DEFAULT_VALUES.contributionAKlubr || 0)} €
        </p>
      </div>
      {#if DEFAULT_VALUES.withTaxReduction}
        <div class="separator w-full" />
        <div class="flex justify-between items-center gap-1">
          <p>Coût après réduction d'impôts</p>
          <p class="font-bold">
            {calculateTaxReduction(
              DEFAULT_VALUES.montant + (DEFAULT_VALUES.contributionAKlubr || 0),
              DEFAULT_VALUES.estOrganisme
            )} €
          </p>
        </div>
      {/if}
    </div>
    <Tooltip>
      <div
        slot="trigger"
        tabindex="0"
        class={'flex items-center gap-1-2'}
        data-tooltip-id={'Envoi'}
      >
        <p class="font-semibold">Envoi immédiat des justificatifs</p>
        <img width={25} height={25} src={alertIcon} alt={'Envoi immédiat des justificatifs'} />
      </div>
      <div slot="tooltip">
        <div class={'flex gap-1'}>
          <img src={email} alt={'email'} />
          <p>Réception immédiate de vos reçus et attestation par mail.</p>
        </div>
        <hr class={'w-full'} style="border-color: #808182" />
        <div class={'flex gap-1'}>
          <img src={userAvatar} alt={'email'} />
          <p>Retrouvez à tout instant vos justificatifs dans votre espace.</p>
        </div>
        <hr class={'w-full'} style="border-color: #808182" />
        <div class={'flex gap-1'}>
          <img src={resendFiles} alt={'email'} />
          <p>Envoi des justificatifs par mail pour rappel avant votre déclaration d'impôt.</p>
        </div>
      </div>
    </Tooltip>
    <img
      src={DEFAULT_VALUES.withTaxReduction ? att_recu : att}
      alt={'Envoi immédiat des justificatifs'}
    />
    <p class="disclaimer">
      Le fonds de dotation "<b>Fond Klubr</b>" est organisme de mécénat destiné à collecter des dons
      pour le compte d'autres organismes sportifs à but non lucratif, dont "<a href="#"
        >{SUBSCRIPTION.klubr?.denomination}</a
      >" et ainsi les aider à réaliser leurs oeuvres et missions d'intérêt général.
    </p>
    <div class="flex flex-col w-full checkboxesContainer">
      <div class="w-full" style="display: grid; grid-template-columns: 33px 1fr 1fr">
        <input
          type="checkbox"
          id="displayName"
          name="displayName"
          bind:checked={DEFAULT_VALUES.displayName}
        />
        <label for="displayName" style="grid-column: span 2;"
          >Je veux que mon nom apparaisse dans la liste des donateurs sur la page
        </label>
        <small class="error" style="grid-column: span 3;" aria-live="polite"></small>
      </div>
      {#if DEFAULT_VALUES.displayName}
        <div class="w-full" style="display: grid; grid-template-columns: 33px 1fr 1fr">
          <input
            type="checkbox"
            id="displayAmount"
            name="displayAmount"
            bind:checked={DEFAULT_VALUES.displayAmount}
          />
          <label for="displayAmount" style="grid-column: span 2;"
            >Je souhaite afficher le montant de mon don</label
          >
          <small class="error" style="grid-column: span 3;" aria-live="polite"></small>
        </div>
      {/if}
      <div class="w-full" style="display: grid; grid-template-columns: 33px 1fr 1fr">
        <input
          type="checkbox"
          id="acceptCondition1"
          name="acceptCondition1"
          bind:checked={DEFAULT_VALUES.acceptConditions1}
          use:validator={{
            validateFunctions: [validateTrue]
          }}
        />
        <label for="acceptCondition1" style="grid-column: span 2;"
          >J'ai bien compris que Klubr est un fonds de dotation redistributeur.</label
        >
        <small class="error" style="grid-column: span 3;" aria-live="polite"></small>
      </div>
      <div class="w-full" style="display: grid; grid-template-columns: 33px 1fr 1fr">
        <input
          type="checkbox"
          id="acceptCondition2"
          name="acceptCondition2"
          bind:checked={DEFAULT_VALUES.acceptConditions2}
          use:validator={{
            validateFunctions: [validateTrue]
          }}
        />
        <label style="grid-column: span 2;"
          >J'accepte <b class="cursor-pointer" onclick={() => isCguShown.set(true)}
            >les Conditions Générales d’Utilisation.</b
          > *</label
        >
        <small class="error" style="grid-column: span 3;" aria-live="polite"></small>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use 'index';
</style>
