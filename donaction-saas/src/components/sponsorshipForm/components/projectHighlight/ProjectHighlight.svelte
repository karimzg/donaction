<script lang="ts">
  interface ProjectData {
    titre: string;
    montantAFinancer: number | null;
    montantTotalDonations?: number | null;
    dateLimiteFinancementProjet: string | null;
    couverture?: { url: string; alternativeText?: string };
  }

  let {
    project,
    selectedAmount = 0,
    variant = 'default',
    label = ''
  }: {
    project: ProjectData;
    selectedAmount?: number;
    variant?: 'default' | 'compact';
    label?: string;
  } = $props();

  // Determine if we should show the image layout
  const hasImage = $derived(!!project.couverture?.url);

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

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' €';
  };
</script>

<div
  class="project-highlight"
  class:project-highlight--compact={variant === 'compact'}
  class:project-highlight--with-image={hasImage}
>
  <!-- Image (left side) -->
  {#if hasImage}
    <img
      class="project-highlight__image"
      src={project.couverture.url}
      alt={project.couverture.alternativeText || project.titre}
    />
  {/if}

  <!-- Content (right side) -->
  <div class="project-highlight__content">
    <!-- Label -->
    {#if label}
      <span class="project-highlight__label">{label}</span>
    {/if}

    <!-- Title -->
    <strong class="project-highlight__title">{project.titre}</strong>

    <!-- Progress bar -->
    {#if hasGoal}
      <div class="project-highlight__progress-section">
        <div class="project-highlight__progress-bar">
          <div
            class="project-highlight__progress-current"
            style="width: {currentProgress}%"
          ></div>
          {#if selectedAmount > 0 && progressDelta > 0}
            <div
              class="project-highlight__progress-projected"
              style="left: {currentProgress}%; width: {progressDelta}%"
            ></div>
          {/if}
        </div>

        <!-- Progress stats -->
        <div class="project-highlight__stats">
          <span class="project-highlight__amount-raised">
            {formatCurrency(currentAmount)} / {formatCurrency(goalAmount)}
          </span>
          {#if selectedAmount > 0}
            <span class="project-highlight__amount-preview">
              · +{formatCurrency(selectedAmount)} avec votre don
            </span>
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
</div>

<style lang="scss">
  @use 'index';
</style>
