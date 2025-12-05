<script lang="ts">
  import { FORM_CONFIG, SUBSCRIPTION } from '../../logic/useSponsorshipForm.svelte';

  type FormBannersType = {
    bg1: string;
    bg2: string;
    isBeingFilled: boolean;
    isCguShown: boolean;
    index: number;
  };
  let { ...props }: FormBannersType = $props();
</script>

<div
  class="outerBanner topRight {!!props.isBeingFilled}"
  style="background-color: {props.bg1}; display: {props.isCguShown ? 'none' : 'initial'}"
>
  <div class="innerBanner topRight" style="background-color: {props.bg2};" />
</div>
{#if [0, 4].includes(props.index) && !(SUBSCRIPTION.allowProjectSelection && SUBSCRIPTION.project && props.index === 0)}
  <div
    class="outerBanner botLeft {!!props.isBeingFilled}"
    style="background-color: {props.bg1}; display: {props.isCguShown ? 'none' : 'initial'}"
  >
    <div class="innerBanner botLeft" style="background-color: {props.bg2}" />
  </div>
{/if}

<style lang="scss">
  @use './index';
  @use '../../../../styles/main';
</style>
