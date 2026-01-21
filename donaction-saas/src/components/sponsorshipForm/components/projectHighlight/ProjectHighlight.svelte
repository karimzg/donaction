<script lang="ts">
  import RichTextBlock from '../../../../utils/richTextBlock/RichTextBlock.svelte';

  interface ProjectData {
    titre: string;
    montantAFinancer: number | null;
    montantTotalDonations?: number | null;
    dateLimiteFinancementProjet: string | null;
    descriptionCourte?: Array<{ type: string; children: any[] }>;
    couverture?: { url: string; alternativeText?: string };
  }

  let {
    project,
    selectedAmount = 0,
    variant = 'default',
    showContributeLabel = false
  }: {
    project: ProjectData;
    selectedAmount?: number;
    variant?: 'default' | 'compact';
    showContributeLabel?: boolean;
  } = $props();

  // Accordion state
  let isExpanded = $state(false);

  // Computed values
  const currentAmount = $derived(project.montantTotalDonations ?? 0);
  const goalAmount = $derived(project.montantAFinancer ?? 0);
  const hasGoal = $derived(goalAmount > 0);

  // Progress calculations
  const currentProgress = $derived(
    hasGoal ? Math.min(100, Math.round((currentAmount / goalAmount) * 100)) : 0
  );
  const projectedAmount = $derived(currentAmount + selectedAmount);
  const projectedProgress = $derived(
    hasGoal ? Math.min(100, Math.round((projectedAmount / goalAmount) * 100)) : 0
  );
  const progressDelta = $derived(projectedProgress - currentProgress);

  // Days remaining calculation
  const daysRemaining = $derived(() => {
    if (!project.dateLimiteFinancementProjet) return null;
    const deadline = new Date(project.dateLimiteFinancementProjet);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  });

  const showUrgencyBadge = $derived(() => {
    const days = daysRemaining();
    return days !== null && days > 0 && days <= 7;
  });

  const hasDescription = $derived(
    project.descriptionCourte && project.descriptionCourte.length > 0
  );

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' €';
  };

  // Toggle accordion
  const toggleAccordion = () => {
    if (hasDescription) {
      isExpanded = !isExpanded;
    }
  };
</script>

<div
  class="project-highlight"
  class:project-highlight--compact={variant === 'compact'}
  class:project-highlight--expanded={isExpanded}
>
  <!-- Contribute label (above header) -->
  {#if showContributeLabel}
    <p class="project-highlight__contribute-label">Contribuez au financement du projet</p>
  {/if}

  <!-- Header with title and toggle -->
  <button
    type="button"
    class="project-highlight__header"
    onclick={toggleAccordion}
    aria-expanded={isExpanded}
    aria-controls="project-description"
    disabled={!hasDescription}
  >
    <span class="project-highlight__icon">🎯</span>
    <span class="project-highlight__title">{project.titre}</span>
    {#if hasDescription}
      <span class="project-highlight__toggle" aria-hidden="true">
        {isExpanded ? '▲' : '▼'}
      </span>
    {/if}
  </button>

  <!-- Accordion content: Description -->
  {#if hasDescription}
    <div
      id="project-description"
      class="project-highlight__description"
      class:project-highlight__description--visible={isExpanded}
    >
      <div class="project-highlight__description-inner">
        <RichTextBlock data={project.descriptionCourte} />
      </div>
    </div>
  {/if}

  <!-- Progress bar -->
  {#if hasGoal}
    <div class="project-highlight__progress-section">
      <div class="project-highlight__progress-bar">
        <!-- Current progress -->
        <div
          class="project-highlight__progress-current"
          style="width: {currentProgress}%"
        ></div>
        <!-- Projected progress (donation preview) -->
        {#if selectedAmount > 0 && progressDelta > 0}
          <div
            class="project-highlight__progress-projected"
            style="left: {currentProgress}%; width: {progressDelta}%"
          ></div>
        {/if}
      </div>

      <!-- Progress stats -->
      <div class="project-highlight__stats">
        {#if variant === 'compact'}
          <!-- Compact: minimal stats -->
          <span class="project-highlight__percentage">
            {currentProgress}%{#if selectedAmount > 0 && progressDelta > 0}<span class="project-highlight__percentage-arrow">→{projectedProgress}%</span>{/if}
          </span>
        {:else}
          <!-- Default: full stats -->
          <span class="project-highlight__amount-raised">
            {formatCurrency(currentAmount)} récolté
          </span>
          {#if selectedAmount > 0}
            <span class="project-highlight__amount-preview">
              · +{formatCurrency(selectedAmount)} avec votre don
            </span>
          {/if}
        {/if}
      </div>
    </div>
  {/if}

  <!-- Urgency badge -->
  {#if showUrgencyBadge()}
    <div class="project-highlight__urgency">
      🔥 {#if variant === 'compact'}{daysRemaining()}j restants{:else}{daysRemaining()} jours restants{/if}
    </div>
  {/if}
</div>

<style lang="scss">
  @use 'index';
</style>
