<script lang="ts">
  import {
    triggerValidation,
    DEFAULT_VALUES,
    SUBSCRIPTION,
    isBeingFilled,
    FORM_CONFIG,
  } from '../../../../logic/useSponsorshipForm.svelte';
  import pagination from '../../../../../../assets/icons/pagination.svg';
  import email from '../../../../../../assets/icons/email.svg';
  import userAvatar from '../../../../../../assets/icons/userAvatar.svg';
  import resendFiles from '../../../../../../assets/icons/resendFiles.svg';
  import Tooltip from '../../../../../../utils/tooltip/Tooltip.svelte';
  import { onDestroy, onMount } from 'svelte';
  import { populateForm } from '../../../../logic/initListeners';
  import { calculateTaxReduction, calculateTaxSavings } from '../../../../logic/utils';
  import { register } from 'swiper/element/bundle';
  import ProjectHighlight from '../../../projectHighlight/ProjectHighlight.svelte';
  import FormError from '../../../formError/FormError.svelte';

  let { slides }: { slides: Array<any> } = $props();

  // Check if this is a project donation (not general club)
  const isProjectDonation = $derived(
    SUBSCRIPTION.project?.uuid && SUBSCRIPTION.project.uuid !== SUBSCRIPTION.klubr?.uuid,
  );

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
    right: false,
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

  // Scroll vers la section suivante après sélection du montant (utile mobile)
  let taxSectionRef: HTMLElement;
  let scrollTimeout: ReturnType<typeof setTimeout>;

  const scrollToNextSection = () => {
    setTimeout(() => {
      taxSectionRef?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const scheduleScroll = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(scrollToNextSection, 2000);
  };

  const cancelScheduledScroll = () => {
    clearTimeout(scrollTimeout);
  };

  onDestroy(() => {
    populateForm();
  });
</script>

<form class="don-step1">
  {#if !SUBSCRIPTION.project && SUBSCRIPTION.allowProjectSelection}
    <!-- Project selection with Swiper - PRESERVED -->
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
    <!-- Header section (only for club donations, not project donations) -->
    {#if !isProjectDonation}
      <header class="don-step1__header">
        <p class="don-step1__subtitle">Contribuez au développement de</p>
        <h1 class="don-step1__title">{SUBSCRIPTION.klubr.denomination}</h1>
        <img
          class="don-step1__logo"
          width={(SUBSCRIPTION.klubr?.logo?.width / SUBSCRIPTION.klubr?.logo?.height) * 70}
          height={70}
          src={SUBSCRIPTION.klubr?.logo?.url}
          alt="logo club"
        />
      </header>
    {/if}

    <!-- Project highlight (only for project donations) -->
    {#if isProjectDonation && SUBSCRIPTION.project}
      <div class="don-step1__project-highlight">
        <ProjectHighlight
          project={SUBSCRIPTION.project}
          selectedAmount={DEFAULT_VALUES.montant}
          variant="default"
          label="Contribuez au financement du projet"
        />
      </div>
    {/if}

    <!-- Amount section -->
    <section class="don-section">
      <h2 class="don-section__label">
        Je souhaite aider {#if isProjectDonation && SUBSCRIPTION.project}le projet
        {/if}à hauteur de :
      </h2>

      <div class="don-amount-grid" role="group" aria-label="Sélection du montant">
        {#each amounts as amount}
          <button
            type="button"
            class="don-btn-amount"
            class:don-btn-amount--selected={DEFAULT_VALUES.montant === amount}
            onclick={() => {
              DEFAULT_VALUES.montant = amount;
              isBeingFilled.set(true);
              scrollToNextSection();
            }}
            aria-pressed={DEFAULT_VALUES.montant === amount}
            aria-label="Faire un don de {amount} euros"
          >
            {amount} €
          </button>
        {/each}
      </div>

      <div class="don-custom-amount">
        <label class="don-custom-amount__label" for="don-montant-libre">Montant libre</label>
        <div class="don-custom-amount__input">
          <input
            id="don-montant-libre"
            type="number"
            min="10"
            max="100000"
            placeholder="--,--"
            class="don-form-input don-form-input--with-addon"
            bind:value={DEFAULT_VALUES.montant}
            oninput={(e) => {
              if (e.target.value.length > 6) {
                e.target.value = e.target.value.slice(0, 6);
                DEFAULT_VALUES.montant = Number(e.target.value);
              }
              if (e.target.value.length >= 2) {
                scheduleScroll();
              }
            }}
            onblur={() => {
              cancelScheduledScroll();
              if (DEFAULT_VALUES.montant >= 10) scrollToNextSection();
            }}
            aria-describedby="don-montant-error"
          />
          <span class="don-custom-amount__currency" aria-hidden="true">€</span>
        </div>
      </div>

      <!-- Message d'erreur avec le composant FormError -->
      <div class="flex justify-center">
        <FormError
          msgType="glassCard"
          message={$triggerValidation > 0
            ? !DEFAULT_VALUES.montant
              ? 'Veuillez choisir un montant'
              : DEFAULT_VALUES.montant < 10
                ? 'Veuillez choisir un montant supérieure à 10 €'
                : DEFAULT_VALUES.montant > 100000
                  ? 'Veuillez choisir un montant inférieure à 100.000 €'
                  : ''
            : ''}
        />
      </div>

      <div class="don-info-row">
        <Tooltip>
          <div slot="trigger" class="don-info-trigger">
            <span class="don-info-icon">📄</span>
            <span class="don-info-text">Envoi immédiat des justificatifs</span>
            <span class="don-tooltip-trigger" aria-label="Plus d'informations">?</span>
          </div>
          <div slot="tooltip">
            <div class={'flex gap-1'}>
              <img src={email} alt={'email'} />
              <p>Réception immédiate de vos reçus et attestation par mail.</p>
            </div>
            <hr class={'w-full'} />
            <div class={'flex gap-1'}>
              <img src={userAvatar} alt={'email'} />
              <p>Retrouvez à tout instant vos justificatifs dans votre espace.</p>
            </div>
            <hr class={'w-full'} />
            <div class={'flex gap-1'}>
              <img src={resendFiles} alt={'email'} />
              <p>Envoi des justificatifs par mail pour rappel avant votre déclaration d'impôt.</p>
            </div>
          </div>
        </Tooltip>
      </div>
    </section>

    <!-- Tax reduction section -->
    <section class="don-section" bind:this={taxSectionRef}>
      <h2 class="don-section__label">
        Souhaitez-vous bénéficier d'une réduction d'impôt "mécénat" pour ce don ?
      </h2>

      <div class="don-toggle-group" role="group" aria-label="Réduction d'impôt">
        <button
          type="button"
          class="don-toggle-btn"
          class:don-toggle-btn--selected={!DEFAULT_VALUES.withTaxReduction}
          onclick={checkWithTaxReduction}
          aria-pressed={!DEFAULT_VALUES.withTaxReduction}>Non</button
        >
        <button
          type="button"
          class="don-toggle-btn"
          class:don-toggle-btn--selected={DEFAULT_VALUES.withTaxReduction}
          onclick={checkWithTaxReduction}
          aria-pressed={DEFAULT_VALUES.withTaxReduction}>Oui</button
        >
      </div>

      {#if DEFAULT_VALUES.withTaxReduction}
        <div class="don-tax-options">
          <h3 class="don-section__sublabel">Je soutiens en tant que :</h3>

          <div class="don-toggle-group" role="group" aria-label="Type de donateur">
            <button
              type="button"
              class="don-toggle-btn"
              class:don-toggle-btn--selected={!DEFAULT_VALUES.estOrganisme}
              onclick={checkIsOrganization}
              aria-pressed={!DEFAULT_VALUES.estOrganisme}>Particulier</button
            >
            <button
              type="button"
              class="don-toggle-btn"
              class:don-toggle-btn--selected={DEFAULT_VALUES.estOrganisme}
              onclick={checkIsOrganization}
              aria-pressed={DEFAULT_VALUES.estOrganisme}>Entreprise</button
            >
          </div>

          <div class="don-real-cost don-real-cost--vertical">
            <Tooltip>
              <div slot="trigger" class="don-real-cost__label-row">
                <span class="don-real-cost__label">Coût après réduction d'impôts</span>
                <span class="don-tooltip-trigger" aria-label="Plus d'informations">?</span>
              </div>
              <div slot="tooltip" class="flex flex-col gap-1">
                <h1>Réduction d'impôts</h1>
                <p>
                  Le don à <b>{SUBSCRIPTION.klubr.denomination}</b> ouvre droit à une réduction d'impôts
                  car il remplit les conditions générales prévues aux articles 200 et 238 bis du code
                  général des impôts.
                </p>
              </div>
            </Tooltip>
            <div class="don-real-cost__value">
              {calculateTaxReduction(DEFAULT_VALUES.montant, DEFAULT_VALUES.estOrganisme)} €
            </div>
            <div class="don-real-cost__savings">
              Vous économisez <strong
                >{calculateTaxSavings(DEFAULT_VALUES.montant, DEFAULT_VALUES.estOrganisme)} €</strong
              >
            </div>
            <div class="don-real-cost__detail">
              ({DEFAULT_VALUES.estOrganisme ? '60%' : '66%'} de réduction fiscale)
            </div>
          </div>
        </div>
      {/if}
    </section>
  {/if}
</form>

<style lang="scss">
  @use 'index';
</style>
