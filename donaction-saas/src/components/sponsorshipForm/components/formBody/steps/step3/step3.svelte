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
  import { calculateTaxReduction, formatCurrency } from '../../../../logic/utils';
  import { calculateFees, type FeeCalculationOutput } from '../../../../logic/fee-calculation-helper';
  import ProjectHighlight from '../../../projectHighlight/ProjectHighlight.svelte';

  const cgu = $state({
    title: '',
    content: []
  });

  // Fee details toggle
  let showFeeDetails = $state(false);

  // Trade policy derived values
  const tradePolicy = $derived(SUBSCRIPTION.klubr?.trade_policy);
  const isStripeConnect = $derived(tradePolicy?.stripe_connect === true);
  const allowDonorFeeChoice = $derived(tradePolicy?.allow_donor_fee_choice ?? true);
  const showFeeChoice = $derived(isStripeConnect && allowDonorFeeChoice);

  // Determine if project or club donation
  const isProjectDonation = $derived(
    SUBSCRIPTION.project?.uuid && SUBSCRIPTION.project.uuid !== SUBSCRIPTION.klubr?.uuid
  );

  // Default value based on donation type
  const defaultDonorPaysFee = $derived(
    isProjectDonation
      ? (tradePolicy?.donor_pays_fee_project ?? true)
      : (tradePolicy?.donor_pays_fee_club ?? false)
  );

  // Fee calculations using full helper
  const commissionPercentage = $derived(tradePolicy?.commissionPercentage ?? 4);
  const fees = $derived<FeeCalculationOutput>(
    calculateFees({
      montantDon: DEFAULT_VALUES.montant,
      contribution: DEFAULT_VALUES.contributionAKlubr || 0,
      donorPaysFee: DEFAULT_VALUES.donorPaysFee,
      commissionPercentage: (commissionPercentage || 4) / 100
    })
  );

  // Legacy calculations for backward compatibility in option cards
  const baseTotal = $derived(DEFAULT_VALUES.montant + (DEFAULT_VALUES.contributionAKlubr || 0));

  onMount(() => {
    if (isNaN(DEFAULT_VALUES.contributionAKlubr)) {
      DEFAULT_VALUES.contributionAKlubr = SUBSCRIPTION.allowKlubrContribution
        ? Math.min(Math.floor(DEFAULT_VALUES.montant * 0.1), 25)
        : 0;
    }

    // Initialize donorPaysFee with default value based on donation type
    if (isStripeConnect) {
      DEFAULT_VALUES.donorPaysFee = defaultDonorPaysFee;
    }

    getKlubrCGU().then((res) => {
      cgu.title = res?.data?.attributes?.titre;
      cgu.content = res?.data?.attributes?.content;
    });
  });
</script>

{#if $isCguShown}
  <!-- CGU - PRESERVED -->
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
  <div class="don-step3">
    <!-- Header with amount -->
    <header class="don-step3__header">
      <div class="don-header-badge">
        <span>🎁</span> Votre don
      </div>
      <div class="don-header-amount">{formatCurrency(DEFAULT_VALUES.montant)}</div>
      <div class="don-header-for">pour</div>
      <div class="don-header-association">{SUBSCRIPTION.klubr?.denomination}</div>
    </header>

    <!-- Project highlight (compact for recap) -->
    {#if SUBSCRIPTION.project && SUBSCRIPTION.project.uuid !== SUBSCRIPTION.klubr?.uuid}
      <ProjectHighlight
        project={SUBSCRIPTION.project}
        selectedAmount={DEFAULT_VALUES.montant}
        variant="compact"
      />
    {/if}

    <!-- Fee choice section -->
    {#if showFeeChoice}
      <section class="don-section">
        <h2 class="don-section__title">
          <span class="don-section__icon">💡</span>
          Comment maximiser votre impact ?
        </h2>

        <div class="don-options-grid">
          <!-- Option 1: Donor pays fee -->
          <label class="don-option-card" class:don-option-card--selected={DEFAULT_VALUES.donorPaysFee === true}>
            <input
              type="radio"
              name="donorPaysFee"
              checked={DEFAULT_VALUES.donorPaysFee === true}
              onchange={() => (DEFAULT_VALUES.donorPaysFee = true)}
              class="don-option-card__radio"
            />
            {#if DEFAULT_VALUES.donorPaysFee === true}
              <div class="don-option-card__check">✓</div>
            {/if}
            <div class="don-option-card__badge">✨ Recommandé</div>
            <h3 class="don-option-card__title">Je couvre les frais</h3>
            <p class="don-option-card__desc">
              L'association reçoit <strong>100%</strong> de votre don
            </p>
            <div class="don-option-card__metrics">
              <div class="don-option-card__metric">
                <span>Association reçoit</span>
                <span class="don-metric--highlight">{formatCurrency(DEFAULT_VALUES.montant)}</span>
              </div>
              <div class="don-option-card__metric">
                <span>Vous payez</span>
                <span>{formatCurrency(DEFAULT_VALUES.montant + fees.commissionDonaction + fees.fraisStripeEstimes + (DEFAULT_VALUES.contributionAKlubr || 0))}</span>
              </div>
              {#if DEFAULT_VALUES.withTaxReduction}
                <div class="don-option-card__metric">
                  <span>Reçu fiscal</span>
                  <span>{formatCurrency(DEFAULT_VALUES.montant)}</span>
                </div>
              {/if}
            </div>
          </label>

          <!-- Option 2: Fees included -->
          <label class="don-option-card" class:don-option-card--selected={DEFAULT_VALUES.donorPaysFee === false}>
            <input
              type="radio"
              name="donorPaysFee"
              checked={DEFAULT_VALUES.donorPaysFee === false}
              onchange={() => (DEFAULT_VALUES.donorPaysFee = false)}
              class="don-option-card__radio"
            />
            {#if DEFAULT_VALUES.donorPaysFee === false}
              <div class="don-option-card__check">✓</div>
            {/if}
            <h3 class="don-option-card__title">Frais inclus dans le don</h3>
            <p class="don-option-card__desc">
              Les frais sont déduits du montant reçu
            </p>
            <div class="don-option-card__metrics">
              <div class="don-option-card__metric">
                <span>Association reçoit</span>
                <span>{formatCurrency(DEFAULT_VALUES.montant - fees.applicationFee)}</span>
              </div>
              <div class="don-option-card__metric">
                <span>Vous payez</span>
                <span>{formatCurrency(baseTotal)}</span>
              </div>
              {#if DEFAULT_VALUES.withTaxReduction}
                <div class="don-option-card__metric">
                  <span>Reçu fiscal</span>
                  <span>{formatCurrency(DEFAULT_VALUES.montant - fees.applicationFee)}</span>
                </div>
              {/if}
            </div>
          </label>
        </div>

        <!-- Fee details toggle -->
        <button type="button" class="don-details-toggle" onclick={() => showFeeDetails = !showFeeDetails}>
          <span>{showFeeDetails ? '−' : '+'}</span>
          En savoir plus sur les frais
        </button>

        {#if showFeeDetails}
          <div class="don-fee-details">
            <p class="don-fee-details__title">Détail des frais ({formatCurrency(fees.applicationFee)}) :</p>
            <div class="don-fee-details__line">
              <span>Commission plateforme ({commissionPercentage}%)</span>
              <span>{formatCurrency(fees.commissionDonaction)}</span>
            </div>
            <div class="don-fee-details__line">
              <span>Frais de transaction</span>
              <span>~{formatCurrency(fees.fraisStripeEstimes)}</span>
            </div>
            <p class="don-fee-details__note">
              Ces frais permettent à DONACTION de fonctionner et garantissent la sécurité de votre paiement.
            </p>
          </div>
        {/if}
      </section>
    {/if}

    <!-- Summary section -->
    <section class="don-section">
      <h2 class="don-section__title">
        <span class="don-section__icon">📊</span>
        Récapitulatif
      </h2>

      <div class="don-summary-layout">
        <div class="don-summary-lines">
          <!-- Main donation -->
          <div class="don-summary-line">
            <div class="don-summary-line__left">
              <span class="don-summary-line__icon">🎁</span>
              <span>Don à {SUBSCRIPTION.klubr?.denomination}</span>
            </div>
            <span class="don-summary-line__amount">{formatCurrency(DEFAULT_VALUES.montant)}</span>
          </div>

          <!-- Fees (if donor pays) -->
          {#if isStripeConnect && DEFAULT_VALUES.donorPaysFee}
            <div class="don-summary-line don-summary-line--fees">
              <div class="don-summary-line__left">
                <span class="don-summary-line__icon">💳</span>
                <span>Frais de traitement</span>
              </div>
              <span class="don-summary-line__amount--fees">+{formatCurrency(fees.commissionDonaction + fees.fraisStripeEstimes)}</span>
            </div>
          {/if}

          <!-- Platform support -->
          {#if SUBSCRIPTION.allowKlubrContribution}
            <div class="don-support-row">
              <div class="don-support-row__left">
                <span class="don-summary-line__icon">💛</span>
                <div class="don-support-row__text">
                  <span>Soutien à la plateforme</span>
                  <span class="don-support-row__note">Non déductible des impôts</span>
                </div>
              </div>
              <div class="don-support-row__right">
                <span class="don-support-row__value">{formatCurrency(DEFAULT_VALUES.contributionAKlubr)}</span>
                <button
                  type="button"
                  class="don-support-row__edit"
                  onclick={() => isContributionShown.set(true)}
                >
                  Modifier
                </button>
              </div>
            </div>
          {/if}

          <div class="don-summary-divider"></div>

          <!-- Total -->
          <div class="don-summary-line don-summary-line--total">
            <span>Total à payer</span>
            <span class="don-summary-line__total">{formatCurrency(fees.totalDonateur)}</span>
          </div>
        </div>

        <!-- Impact card -->
        <div class="don-impact-card">
          <div class="don-impact-card__icon">🏆</div>
          <div class="don-impact-card__label">L'association recevra</div>
          <div class="don-impact-card__value">{formatCurrency(fees.netAssociation)}</div>
          {#if DEFAULT_VALUES.donorPaysFee}
            <div class="don-impact-card__badge">100% de votre don !</div>
          {/if}
        </div>
      </div>

      <!-- Tax section -->
      {#if DEFAULT_VALUES.withTaxReduction}
        <div class="don-tax-section">
          <div class="don-tax-flow">
            <div class="don-tax-item">
              <span class="don-tax-item__icon">📄</span>
              <span class="don-tax-item__label">Reçu fiscal</span>
              <span class="don-tax-item__value">{formatCurrency(fees.montantRecuFiscal)}</span>
            </div>
            <span class="don-tax-arrow">→</span>
            <div class="don-tax-item">
              <span class="don-tax-item__icon">💰</span>
              <span class="don-tax-item__label">Réduction ({DEFAULT_VALUES.estOrganisme ? '60' : '66'}%)</span>
              <span class="don-tax-item__value">{formatCurrency(fees.montantRecuFiscal * (DEFAULT_VALUES.estOrganisme ? 0.6 : 0.66))}</span>
            </div>
            <span class="don-tax-arrow">→</span>
            <div class="don-tax-item don-tax-item--final">
              <span class="don-tax-item__label">Coût réel</span>
              <span class="don-tax-item__value--final">
                {calculateTaxReduction(fees.montantRecuFiscal, DEFAULT_VALUES.estOrganisme)} €
              </span>
            </div>
          </div>
          {#if SUBSCRIPTION.allowKlubrContribution && DEFAULT_VALUES.contributionAKlubr > 0}
            <p class="don-tax-note">
              * Le soutien à la plateforme ({formatCurrency(DEFAULT_VALUES.contributionAKlubr)}) n'est pas déductible
            </p>
          {/if}
        </div>
      {/if}
    </section>

    <!-- Documents section -->
    <section class="don-docs-section">
      <h3 class="don-docs-title">📬 Vous recevrez immédiatement</h3>
      <div class="don-docs-grid">
        <div class="don-doc-card">
          <span class="don-doc-card__icon">📋</span>
          <span>Attestation de don</span>
        </div>
        {#if DEFAULT_VALUES.withTaxReduction}
          <div class="don-doc-card">
            <span class="don-doc-card__icon">🧾</span>
            <span>Reçu fiscal Cerfa</span>
          </div>
        {/if}
      </div>
    </section>

    <!-- Disclaimer -->
    <p class="don-disclaimer">
      Le fonds de dotation "<b>Fond Klubr</b>" est organisme de mécénat destiné à collecter des dons
      pour le compte d'autres organismes sportifs à but non lucratif, dont "<a href="#">{SUBSCRIPTION.klubr?.denomination}</a>" et ainsi les aider à réaliser leurs oeuvres et missions d'intérêt général.
    </p>

    <!-- Checkboxes - PRESERVED structure -->
    <div class="don-checkboxes">
      <div class="don-checkbox-row">
        <input
          type="checkbox"
          id="displayName"
          name="displayName"
          bind:checked={DEFAULT_VALUES.displayName}
        />
        <label for="displayName">
          Je veux que mon nom apparaisse dans la liste des donateurs sur la page
        </label>
        <small class="don-error" aria-live="polite"></small>
      </div>
      {#if DEFAULT_VALUES.displayName}
        <div class="don-checkbox-row">
          <input
            type="checkbox"
            id="displayAmount"
            name="displayAmount"
            bind:checked={DEFAULT_VALUES.displayAmount}
          />
          <label for="displayAmount">
            Je souhaite afficher le montant de mon don
          </label>
          <small class="don-error" aria-live="polite"></small>
        </div>
      {/if}
      <div class="don-checkbox-row">
        <input
          type="checkbox"
          id="acceptCondition2"
          name="acceptCondition2"
          bind:checked={DEFAULT_VALUES.acceptConditions2}
          use:validator={{
            validateFunctions: [validateTrue]
          }}
        />
        <label>
          J'accepte <b class="cursor-pointer" onclick={() => isCguShown.set(true)}>les Conditions Générales d'Utilisation.</b> *
        </label>
        <small class="don-error" aria-live="polite"></small>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use 'index';
</style>
