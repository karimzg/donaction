<script lang="ts">
  import {
    triggerValidation,
    DEFAULT_VALUES,
    SUBSCRIPTION,
    isBeingFilled,
    FORM_CONFIG
  } from '../../../../logic/useSponsorshipForm.svelte';
  import alertIcon from '../../../../../../assets/icons/alertIcon.svg';
  import pagination from '../../../../../../assets/icons/pagination.svg';
  import email from '../../../../../../assets/icons/email.svg';
  import userAvatar from '../../../../../../assets/icons/userAvatar.svg';
  import resendFiles from '../../../../../../assets/icons/resendFiles.svg';
  import Tooltip from '../../../../../../utils/tooltip/Tooltip.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { populateForm } from '../../../../logic/initListeners';
  import { calculateTaxReduction } from '../../../../logic/utils';
  import { register } from 'swiper/element/bundle';

  let { slides }: { slides: Array<any> } = $props();

  let amounts = $derived(DEFAULT_VALUES.estOrganisme ? [100, 200, 500, 1000] : [10, 50, 100, 200]);

  const checkIsOrganization = () => {
    isBeingFilled.set(true);
    DEFAULT_VALUES.estOrganisme = !DEFAULT_VALUES.estOrganisme;
  };
  const checkWithTaxReduction = () => {
    isBeingFilled.set(true);
    DEFAULT_VALUES.withTaxReduction = !DEFAULT_VALUES.withTaxReduction;
    DEFAULT_VALUES.estOrganisme = false;
  };

  const selectProject = (project: any) => {
    isBeingFilled.set(true);
    FORM_CONFIG.projectUuid = project.uuid;
  };

  const saveSelection = (event: any) => {
    event.preventDefault();
    isBeingFilled.set(true);
    SUBSCRIPTION.project = slides.find((_) => _?.uuid === FORM_CONFIG.projectUuid);
  };

  let swiperEl = null;
  let paginateState = $state({
    left: false,
    right: false
  });
  const swiperInstaller = (node: any) => {
    register();
    swiperEl = node;
    swiperEl.swiper.activeIndex = slides.findIndex((_) => _.uuid === FORM_CONFIG.projectUuid);
    paginateState.left = swiperEl.swiper.activeIndex > 0;
    paginateState.right = swiperEl.swiper.activeIndex < slides.length - 1;

    setTimeout(() => {
      paginateState.left = !swiperEl.swiper.isBeginning;
      paginateState.right = !swiperEl.swiper.isEnd;
    }, 20);

    const updateSwiper = () => {
      switch (true) {
        case window.innerWidth > 768:
          // if (swiperEl.getAttribute('slides-per-view') !== '3') {
          swiperEl.setAttribute('slides-per-view', slides.length > 2 ? '3' : '2');
          // }
          break;
        case window.innerWidth > 480:
          if (swiperEl.getAttribute('slides-per-view') !== '2') {
            swiperEl.setAttribute('slides-per-view', '2');
          }
          break;
        default:
          if (swiperEl.getAttribute('slides-per-view') !== '1') {
            swiperEl.setAttribute('slides-per-view', '1');
          }
          break;
      }
    };

    updateSwiper();

    window.addEventListener('resize', updateSwiper);

    swiperEl.addEventListener('swiperslidechange', (e) => {
      paginateState.left = !swiperEl.swiper.isBeginning;
      paginateState.right = !swiperEl.swiper.isEnd;
    });
  };

  const paginate = (acc: 1 | -1) => {
    swiperEl?.swiper[acc > 0 ? 'slideNext' : 'slidePrev']();
  };

  onDestroy(() => {
    populateForm();
  });
</script>

<form class="step1 flex flex-col" style="gap: 1rem">
  {#if !SUBSCRIPTION.project && SUBSCRIPTION.allowProjectSelection}
    <div class="projectSelectionContainer flex flex-col items-center gap-1">
      <p class="text-center font-semibold">Quel projet souhaitez-vous soutenir ?</p>
      <div class="swiperContainer">
        {#if paginateState.left}
          <img
            src={pagination}
            style="position: absolute; left: -34px; top: 42%; transform: rotate(180deg); cursor: pointer;"
            onclick={() => paginate(-1)}
          />
        {/if}
        <swiper-container
          use:swiperInstaller
          slides-per-view={3}
          space-between={10}
          centered-slides={false}
        >
          {#each slides as slide}
            <swiper-slide onclick={() => selectProject(slide)}>
              <div
                style="border-color: {SUBSCRIPTION.klubr.klubr_house.primary_color}"
                class={`${FORM_CONFIG.projectUuid === slide.uuid ? 'true' : 'boxBoxShadow'} content`}
              >
                <img
                  src={slide?.couverture?.url}
                  alt={slide?.couverture?.alternativeText}
                  style={slide.fit}
                />
                <p>{slide?.titre}</p>
              </div>
            </swiper-slide>
          {/each}
        </swiper-container>
        {#if paginateState.right}
          <img
            src={pagination}
            style="position: absolute; right: -34px; top: 42%; cursor: pointer;"
            onclick={() => paginate(1)}
          />
        {/if}
      </div>

      <p
        style="{FORM_CONFIG.projectUuid === SUBSCRIPTION.klubr.uuid
          ? ''
          : 'visibility: hidden;'} font-size: 14px; max-width: 70%;"
        class="text-center font-semibold"
      >
        Je ne souhaite pas soutenir un projet en particulier et préfère affecter mon don au
        financement des activités d'intérêt général du Klub
      </p>
      <button onclick={saveSelection} class="primary-btn">
        {FORM_CONFIG.projectUuid === SUBSCRIPTION.klubr.uuid ? 'Valider' : 'Selectionner ce projet'}
      </button>
    </div>
  {:else}
    <div class="clubProjectContainer flex flex-col items-center gap-1-2">
      <p class="text-center">
        {!!SUBSCRIPTION.project && SUBSCRIPTION.project?.uuid !== SUBSCRIPTION.klubr.uuid
          ? 'Contribuez au financement du projet'
          : 'Contribuez au développement de'}
      </p>
      <p class="title text-center font-bold">
        {!!SUBSCRIPTION.project && SUBSCRIPTION.project?.uuid !== SUBSCRIPTION.klubr.uuid
          ? SUBSCRIPTION?.project?.titre
          : SUBSCRIPTION.klubr.denomination}
      </p>
      <img
        width={(SUBSCRIPTION.klubr?.logo?.width / SUBSCRIPTION.klubr?.logo?.height) * 70}
        height={70}
        src={SUBSCRIPTION.klubr?.logo?.url}
        alt="logo club"
      />
    </div>
    <div class="amountPicker flex flex-col items-center gap-1">
      <p class="font-bold text-center">Je souhaite aider le projet à hauteur de :</p>
      <div class="amounts flex items-center gap-1-2">
        {#each amounts as amount, _index}
          <div
            class="amount font-bold {DEFAULT_VALUES.montant === amount}"
            onclick={() => (DEFAULT_VALUES.montant = amount) && isBeingFilled.set(true)}
          >
            {amount} €
          </div>
        {/each}
      </div>
      <small class="error">
        {$triggerValidation > 0
          ? !DEFAULT_VALUES.montant
            ? 'Veuillez choisir un montant'
            : DEFAULT_VALUES.montant < 10
              ? 'Veuillez choisir un montant supérieure à 10 €'
              : DEFAULT_VALUES.montant > 100000
                ? 'Veuillez choisir un montant inférieure à 100.000 €'
                : ''
          : ''}
      </small>
    </div>
    <div class="freeAmount flex items-center justify-center flex-wrap gap-1 font-bold">
      <p>Montant libre</p>
      <div>
        <input
          min="10"
          max="100000"
          placeholder="--,--"
          type="number"
          bind:value={DEFAULT_VALUES.montant}
        />
        <span>€</span>
      </div>
    </div>

    <Tooltip>
      <div
        slot="trigger"
        tabindex="0"
        class={'flex items-center gap-1-2'}
        data-tooltip-id={'Envoi'}
      >
        <p class="font-semibold">Envoi immédiat des justificatifs</p>
        <img width={25} height={25} src={alertIcon} alt={''} />
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

    <div class="enTantQue flex flex-col items-center gap-1-2">
      <p class="font-bold text-center">
        Souhaitez-vous bénéficier d'une réduction d'impôt "mécénat" pour ce don ?
      </p>
      <div class="choice flex gap-3" onclick={checkWithTaxReduction}>
        <span class={!DEFAULT_VALUES.withTaxReduction && 'font-bold'}>Non</span>
        <span style="margin-right: 6px" class={!!DEFAULT_VALUES.withTaxReduction && 'font-bold'}
          >Oui</span
        >
        <span class="{!!DEFAULT_VALUES.withTaxReduction} selector"></span>
      </div>
    </div>

    {#if !!DEFAULT_VALUES.withTaxReduction}
      <div class="enTantQue flex items-center gap-1-2">
        <p class="font-bold">Je soutiens en tant que :</p>
        <div class="choice flex gap-3" onclick={checkIsOrganization}>
          <span class={!DEFAULT_VALUES.estOrganisme && 'font-bold'}>Particulier</span>
          <span class={!!DEFAULT_VALUES.estOrganisme && 'font-bold'}>Entreprise</span>
          <span class="{!!DEFAULT_VALUES.estOrganisme} selector"></span>
        </div>
      </div>

      <div class="afterTax flex flex-col items-center gap-1-2 font-semibold">
        <Tooltip>
          <div slot="trigger" class="flex gap-1-2 items-center">
            <p class="text-center">Coût après réduction d'impôts</p>
            <img width={25} height={25} src={alertIcon} alt={''} />
          </div>
          <div slot="tooltip" class="flex flex-col gap-1">
            <h1 style="margin: unset;">Réduction d'impôts</h1>
            <p style="font-weight: normal">
              Le don à <b>{SUBSCRIPTION.klubr.denomination}</b> ouvre droit à une réduction d'impôts
              car il remplit les conditions générales prévues aux articles 200 et 238 bis du code général
              des impôts.
            </p>
          </div>
        </Tooltip>
        <span class="flex items-center justify-center"
          >{calculateTaxReduction(DEFAULT_VALUES.montant, DEFAULT_VALUES.estOrganisme)}&nbsp;€</span
        >
      </div>
    {/if}
  {/if}
</form>

<style lang="scss">
  @use 'index';
</style>
