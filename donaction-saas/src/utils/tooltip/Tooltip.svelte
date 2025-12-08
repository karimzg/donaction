<script lang="ts">
  let { position } = $props();
  let tooltipVisible = $state(false);
  let triggerEl: HTMLElement | null = null;

  const showTooltip = () => {
    tooltipVisible = true;
  };

  const hideTooltip = () => {
    tooltipVisible = false;
  };
</script>

<div
  class="tooltip-container"
  bind:this={triggerEl}
  on:mouseenter={showTooltip}
  on:mouseleave={hideTooltip}
  on:focus={showTooltip}
  on:blur={hideTooltip}
  on:keydown={(e) => e.key === 'Escape' && hideTooltip()}
>
  <slot name="trigger"></slot>
  {#if tooltipVisible}
    <div class="tooltip {position}" role="tooltip">
      <slot name="tooltip"></slot>
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../styles/main';
  @use 'index';
</style>
