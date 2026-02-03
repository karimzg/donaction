<script lang="ts">
  import { formatCurrency, calculateTaxReduction } from '../../logic/utils';

  let {
    taxReceiptAmount,
    isOrganization,
    platformContribution = 0,
    showContributionNote = false,
  }: {
    taxReceiptAmount: number;
    isOrganization: boolean;
    platformContribution?: number;
    showContributionNote?: boolean;
  } = $props();

  // Tax rates per French tax law
  // Individual: 66% (article 200 CGI)
  // Organization: 60% (article 238 bis CGI)
  const taxRate = $derived(isOrganization ? 0.6 : 0.66);
  const taxRateLabel = $derived(isOrganization ? '60' : '66');
  const taxSavingsAmount = $derived(taxReceiptAmount * taxRate);
  const realCost = $derived(calculateTaxReduction(taxReceiptAmount, isOrganization));

  // Show footnote only if contribution > 0 and allowed
  const showNote = $derived(showContributionNote && platformContribution > 0);
</script>

<div class="tax-reduction" data-testid="tax-reduction-summary">
  <div class="tax-reduction__flow">
    <!-- Tax Receipt -->
    <div class="tax-reduction__item" data-testid="tax-receipt-item">
      <span class="tax-reduction__item-icon">📄</span>
      <span class="tax-reduction__item-label">Reçu fiscal</span>
      <span class="tax-reduction__item-value" data-testid="tax-receipt-value">
        {formatCurrency(taxReceiptAmount)}
      </span>
    </div>

    <span class="tax-reduction__arrow">→</span>

    <!-- Tax Reduction -->
    <div class="tax-reduction__item" data-testid="tax-reduction-item">
      <span class="tax-reduction__item-icon">💰</span>
      <span class="tax-reduction__item-label">Réduction ({taxRateLabel}%)</span>
      <span class="tax-reduction__item-value" data-testid="tax-savings-value">
        {formatCurrency(taxSavingsAmount)}
      </span>
    </div>

    <span class="tax-reduction__arrow">→</span>

    <!-- Real Cost -->
    <div class="tax-reduction__item tax-reduction__item--final" data-testid="real-cost-item">
      <span class="tax-reduction__item-label">Coût réel</span>
      <span class="tax-reduction__item-value--final" data-testid="real-cost-value">
        {realCost} €
      </span>
    </div>
  </div>

  {#if showNote}
    <p class="tax-reduction__note" data-testid="contribution-note">
      * Le soutien à la plateforme ({formatCurrency(platformContribution)}) n'est pas déductible
    </p>
  {/if}
</div>

<style lang="scss">
  @use 'index';
</style>
