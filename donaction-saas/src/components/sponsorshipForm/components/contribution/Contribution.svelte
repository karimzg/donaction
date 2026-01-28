<script lang="ts">
  import {
    DEFAULT_VALUES,
    isContributionShown,
    SUBSCRIPTION
  } from '../../logic/useSponsorshipForm.svelte';
  import arrowCircleLeft from '../../../../assets/icons/arrowCircleLeft.svg';
  import smiley from '../../../../assets/animations/Smiles.json';
  import LottieAnimation from '../../../../utils/lottie/LottieAnimation.svelte';
  import VideoPlayer from '../videoPlayer/VideoPlayer.svelte';
  import alertIcon from '../../../../assets/icons/alertIcon.svg';
  import Tooltip from '../../../../utils/tooltip/Tooltip.svelte';
  import { calculateTaxReduction } from '../../logic/utils';
  import { sendGaEvent } from '../../../../utils/sendGaEvent';

  const initialValue = DEFAULT_VALUES.contributionAKlubr;
  let rejectedContribution = $state(false);
  const lottieSegments = [
    { name: '0% -> 0%', start_frame: 375, end_frame: 436 },
    { name: '1% -> 70%', start_frame: 171, end_frame: 188.625 },
    { name: '70% -> 100%', start_frame: 0, end_frame: 70 }
  ];
  let rangeRef: HTMLInputElement | undefined = undefined;
  let segmentIndex = $state(0);
  let goToFrame = $state({
    value: 0,
    cap: 1
  });

  const tradePolicy = $derived(SUBSCRIPTION.klubr?.trade_policy);
  const isStripeConnect = $derived(tradePolicy?.stripe_connect === true);

  const calc = (node: HTMLInputElement) => {
    const value = (node.value / node.max) * 100;
    switch (true) {
      case value === 0:
        segmentIndex = 0;
        goToFrame = {
          value,
          cap: 1,
          override: true
        };
        break;
      case value < 70:
        segmentIndex = 1;
        goToFrame = {
          value: value - 1,
          cap: 69
        };
        break;
      case value <= 100:
        segmentIndex = 2;
        goToFrame = {
          value: value - 70,
          cap: 30
        };
        break;
      default:
        segmentIndex = 0;
        break;
    }
    rejectedContribution = false;
    node.style.setProperty('--value', value);
  };

  const range = (node: HTMLInputElement) => {
    calc(node);
    rangeRef = node;
    node.addEventListener('input', () => calc(node));
  };

  const rejectContribution = () => {
    if (rangeRef) {
      sendGaEvent({
        category: 'contribution',
        label: `Rejected contribution`,
        value: 0
      });
      rangeRef.value = 0;
      DEFAULT_VALUES.contributionAKlubr = 0;
      calc(rangeRef);
      rejectedContribution = true;
    }
  };

  const close = () => {
    sendGaEvent({
      category: 'contribution',
      label: `closed contribution`,
      value: initialValue
    });
    DEFAULT_VALUES.contributionAKlubr = initialValue;
    isContributionShown.set(false);
  };

  // const calculateTaxReduction = () => {
  //   const TAUX_DEDUCTION_FISCALE_PART = 0.66;
  //   const TAUX_DEDUCTION_FISCALE_PRO = 0.6;
  //   const montant = Number(DEFAULT_VALUES.contributionAKlubr);
  //   if (isNaN(montant) || montant < +0) return '0';
  //   return (
  //     montant -
  //     montant *
  //       (DEFAULT_VALUES.estOrganisme ? TAUX_DEDUCTION_FISCALE_PRO : TAUX_DEDUCTION_FISCALE_PART)
  //   )
  //     .toFixed(2)
  //     .replace(/\.00$/, '');
  // };
</script>

<div class="contributionToKlubr">
  <div
    class="backToRecap flex items-center gap-1"
    onclick={close}
    style="cursor: pointer; margin-bottom: 40px"
  >
    <img alt="back to recap" src={arrowCircleLeft} />
    <p class="font-semibold">Modifier le soutien</p>
  </div>
  <!--{#if rejectedContribution || DEFAULT_VALUES.contributionAKlubr === 0}-->
  <!--  <div class="videoPlayerContainer">-->
  <!--    <VideoPlayer-->
  <!--      src="https://ik.imagekit.io/donaction/Klubs/klubr/House/klubr_house_d2307f7ea5_c8xlQ7qIN.mp4"-->
  <!--    />-->
  <!--  </div>-->
  <!--{/if}-->
  <!--{#if !rejectedContribution && DEFAULT_VALUES.contributionAKlubr > 0}-->
  <p class="messageHint font-semibold">
    Votre soutien permet de financer Klubr, une plateforme qui offre gratuitement ses technologies
    et services aux clubs et associations. Chaque contribution compte pour soutenir le sport et ceux
    qui le font vivre. Merci pour votre engagement !
  </p>
  <!--{/if}-->
  <div class="smiley">
    <LottieAnimation
      animation={smiley}
      isControlled
      {goToFrame}
      segment={lottieSegments[segmentIndex]}
    ></LottieAnimation>
  </div>
  <div class="sliderContainer">
    <div class="flex items-center justify-between">
      <p class="font-semibold">Votre précieux soutien :</p>
      <span class="font-semibold" style="color: #F79707"
        >{DEFAULT_VALUES.contributionAKlubr || 0}€</span
      >
    </div>
    <input
      bind:value={DEFAULT_VALUES.contributionAKlubr}
      max={Math.min(DEFAULT_VALUES.montant, 25)}
      min={0}
      step="1"
      type="range"
      use:range
    />
    <div class="flex items-center justify-between" style="margin-top: -8px">
      <p class="font-semibold">0€</p>
      <p class="font-semibold">{Math.min(DEFAULT_VALUES.montant, 25)}€</p>
    </div>
    {#if !isStripeConnect}
    {#if DEFAULT_VALUES.withTaxReduction}
      <div class="afterTax flex flex-col items-center gap-1-2 font-semibold" style="margin: 20px 0">
        <Tooltip>
          <div slot="trigger" class="flex gap-1-2 items-center">
            <p class="text-center">Coût après réduction d'impôts</p>
            <img width={25} height={25} src={alertIcon} alt={''} />
          </div>

          <div slot="tooltip" class="flex flex-col gap-1">
            <h1 style="margin: unset;">Réduction d'impôts</h1>
            <p style="font-weight: normal">
              La contribution à <b>Klubr</b> ouvre droit à une réduction d'impôts car il remplit les
              conditions générales prévues aux articles 200 et 238 bis du code général des impôts.
            </p>
          </div>
        </Tooltip>
        <span class="flex items-center justify-center"
          >{calculateTaxReduction(
            DEFAULT_VALUES.contributionAKlubr,
            DEFAULT_VALUES.estOrganisme
          )}&nbsp;€</span
        >
      </div>
    {/if}
    {/if}
    {#if !rejectedContribution && DEFAULT_VALUES.contributionAKlubr > 0}
      <p class="rejectContributionLabel" onclick={rejectContribution}>
        Je ne souhaite pas donner de soutien à Klubr
      </p>
    {/if}
  </div>
</div>

<style lang="scss">
  @use 'index';
  @use '../../../../styles/main';
</style>
