<script lang="ts">
  import {
    FORM_CONFIG,
    isLoading,
    SUBSCRIPTION,
    triggerValidation
  } from '../../../../logic/useSponsorshipForm.svelte';
  import { onMount } from 'svelte';
  import Share from '../../../../../../utils/share/Share.svelte';
  import { sendGaEvent } from '../../../../../../utils/sendGaEvent';

  let { index }: { index: number } = $props();

  onMount(() => {
    sendGaEvent({
      step: 5,
      category: 'donation',
      label: `Donation payed, don uuid: ${FORM_CONFIG.donUuid}`
    });
    // eventBus.events.clear();
    // Object.keys(defVals).forEach((_) => {
    //   DEFAULT_VALUES[_] = defVals[_];
    // });
    FORM_CONFIG.donUuid = null;
    FORM_CONFIG.donatorUuid = null;
    // FORM_CONFIG.clubUuid = null;
    // FORM_CONFIG.projectUuid = null;
    // isBeingFilled.set(false);
    triggerValidation.set(0);
    // index.set(0);
    isLoading.set(false);
    // SUBSCRIPTION.klubr = null;
    // SUBSCRIPTION.project = null;
  });
</script>

<div class="step5 flex w-full flex-col items-center gap-3">
  <div class="flex flex-col items-center gap-1">
    <p>Votre soutien a bien été pris en compte</p>
    <p class="merci">MERCI</p>
  </div>
  <div class="flex flex-col items-center gap-1">
    <img
      width={(SUBSCRIPTION.klubr?.logo?.width / SUBSCRIPTION.klubr?.logo?.height) * 70}
      height={70}
      src={SUBSCRIPTION.klubr?.logo?.url}
      alt="logo club"
    />
    <p>
      Toute l'équipe de <b>{SUBSCRIPTION.klubr?.denomination}</b> vous remercie de votre précieux soutien
    </p>
  </div>

  <a
    style="text-decoration: none; max-width: 80vw;"
    class="primary-btn text-center"
    href={`${import.meta.env.VITE_NEXT_URL}/mes-dons`}>Retrouver mes dons</a
  >

  <div class="flex flex-col items-center gap-1">
    <p>
      Permettez à vos amis de soutenir <b>{SUBSCRIPTION.klubr?.denomination}</b> en partageant ses projets
    </p>
    <Share></Share>
  </div>
</div>

<style lang="scss">
  @use 'index';
</style>
