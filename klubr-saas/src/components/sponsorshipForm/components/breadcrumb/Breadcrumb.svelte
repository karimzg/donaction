<script lang="ts">
  let { index, isBeingFilled }: { index: number; isBeingFilled: boolean } = $props();
  let breadcrumbs = $derived([
    'Don',
    'Informations personelles',
    'Récapitulatif',
    'Paiement',
    index === 4 ? 'Remerciements' : null
  ]);
</script>

<div class="breadcrumbContainer {!!isBeingFilled}">
  {#each breadcrumbs as breadcrumb, _index}
    <p class={_index === index ? 'active' : ''}>
      {`${_index > 0 ? '>' : ''}`}
      {breadcrumb}
    </p>
  {/each}
</div>

<style lang="scss">
  @use './index';
  @use '../../../../styles/main';
</style>
