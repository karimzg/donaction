<svelte:options
        customElement={{
    tag: 'klubr-sponsorship-form'
  }}
/>

<script async lang="ts">
    import { onDestroy } from 'svelte';
    import FormBanners from './components/formBanner/FormBanners.svelte';
    import Breadcrumb from './components/breadcrumb/Breadcrumb.svelte';
    import x from '../../assets/icons/x.svg';
    import FormBody from './components/formBody/FormBody.svelte';
    import FormNavigation from './components/formNavigation/FormNavigation.svelte';
    import {
        DEFAULT_VALUES,
        defVals,
        FORM_CONFIG,
        index,
        isBeingFilled,
        isCguShown,
        isContributionShown,
        submitForm,
        SUBSCRIPTION
    } from './logic/useSponsorshipForm.svelte';
    import { initComponent } from './logic/initComponent';
    import eventBus from '../../utils/eventBus';
    import initListeners, { EVENT_CONTEXT } from './logic/initListeners';
    import LottieAnimation from '../../utils/lottie/LottieAnimation.svelte';
    import loader from '../../assets/animations/loader.json';
    import error from '../../assets/animations/error.json';
    import { initPlausible } from '../../utils/initPlausible';
    import { getProjectsList } from './logic/api';

    const {klubrUuid, projectUuid}: { klubrUuid?: string; projectUuid?: string } = $props();

    let SCRIPT_LOADED: string = $state('loading');
    let slides = $state([]);

    console.log('INIT', import.meta.env.VITE_ACTIVATE_ANALYTICS, import.meta.env.VITE_ACTIVATE_ANALYTICS === 'true');
    if (import.meta.env.VITE_ACTIVATE_ANALYTICS === 'true') {
        initPlausible();
    }

    // Inject Google Font (Inter) into document head for Shadow DOM compatibility
    const loadGoogleFont = () => {
        if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Inter"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
            document.head.appendChild(link);
        }
    };
    loadGoogleFont();

    $effect(async () => {
        window.KLUBR_EVENT_BUS = eventBus;
        initListeners();
        const event = new CustomEvent(`${EVENT_CONTEXT}LOADED`, {
            detail: {loaded: true},
            bubbles: true,
            composed: true
        });
        dispatchEvent(event);
        await initComponent(klubrUuid, projectUuid)
            .then(async () => {
                if (!SUBSCRIPTION.project && SUBSCRIPTION.allowProjectSelection) {
                    const res = await getProjectsList();
                    if (res.data?.length === 0) {
                        SUBSCRIPTION.allowProjectSelection = false;
                    } else {
                        slides = [
                            ...res.data,
                            {
                                uuid: SUBSCRIPTION.klubr.uuid,
                                couverture: {
                                    alternativeText: SUBSCRIPTION.klubr?.logo?.alternativeText,
                                    url: SUBSCRIPTION.klubr?.logo?.url
                                },
                                titre: 'Fonctionnement général du klub ',
                                fit: 'object-fit: contain;'
                            }
                        ];
                        FORM_CONFIG.projectUuid = FORM_CONFIG.projectUuid || slides[0].uuid;
                    }
                }
                SCRIPT_LOADED = 'loaded';
            })
            .catch(() => (SCRIPT_LOADED = 'error'));
    });

    onDestroy(() => {
        console.log('HERE: ON DESTROY');
        document.body.style.overflow = 'auto';
        Object.keys(DEFAULT_VALUES).forEach((_) => {
            DEFAULT_VALUES[_] = defVals[_];
        });
        SUBSCRIPTION.allowProjectSelection = false;
        SUBSCRIPTION.allowKlubrContribution = false;
        SUBSCRIPTION.klubr = null;
        SUBSCRIPTION.project = false;
        SUBSCRIPTION.token = false;
        FORM_CONFIG.dirty = false;
        FORM_CONFIG.myLasts = null;
        FORM_CONFIG.myLast = null;
        FORM_CONFIG.authEmail = null;
        FORM_CONFIG.donatorUuid = null;
        FORM_CONFIG.donUuid = null;
        FORM_CONFIG.clubUuid = null;
        FORM_CONFIG.projectUuid = null;
        isBeingFilled.set(false);
        index.set(0);
        isCguShown.set(false);
        isContributionShown.set(false);
    });
</script>

{#if SCRIPT_LOADED === 'loaded'}
    <div class={`sponsorFormParent ${$isBeingFilled && 'isBeingFilled'}`}>
        <!-- Project background image (desktop only, when form is active) -->
        {#if $isBeingFilled && SUBSCRIPTION.project?.couverture?.url}
            <div
                class="project-background-image"
                style="background-image: url({SUBSCRIPTION.project.couverture.url});"
                aria-hidden="true"
            ></div>
        {/if}
        <div
            class={`mainContainer ${$isBeingFilled && 'isBeingFilled'} boxBoxShadow`}
            style="--don-brand-primary: {SUBSCRIPTION.klubr?.klubr_house?.primary_color || '#3bacf7'}; --don-brand-secondary: {SUBSCRIPTION.klubr?.klubr_house?.secondary_color || '#050505'};"
        >
            {#if !$isCguShown}
                <Breadcrumb index={$index} isBeingFilled={$isBeingFilled}/>
                <img src={x} class="formX" onclick={() => isBeingFilled.set(false)}/>
            {/if}

            {#if !!$$slots['c-g-u']}
                <FormBody index={$index} {slides}>
                    <div slot="stripe-payment-form">
                        <slot name="stripe-payment-form"></slot>
                    </div>
                    <div slot="c-g-u">
                        <slot name="c-g-u"></slot>
                    </div>
                </FormBody>
            {:else}
                <FormBody index={$index} {slides}>
                    <div slot="stripe-payment-form">
                        <slot name="stripe-payment-form"></slot>
                    </div>
                </FormBody>
            {/if}

            {#if !$isCguShown}
                <FormNavigation index={$index} {submitForm}/>
            {/if}
            <!-- Brand colors injected via CSS variables on mainContainer -->
        </div>
        <script
                defer
                async
                src={`https://www.google.com/recaptcha/enterprise.js?render=${import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY}`}
        ></script>
        <script
                src={`https://maps.googleapis.com/maps/api/js?key=${
        import.meta.env.VITE_GOOGLE_MAPS_KEY
      }&libraries=places&language=fr`}
                async
                defer
        ></script>
    </div>
{/if}
{#if SCRIPT_LOADED === 'loading'}
    <div class={`sponsorFormParent ${$isBeingFilled && 'isBeingFilled'}`}>
        <div class={`mainContainer ${$isBeingFilled && 'isBeingFilled'} boxBoxShadow`}>
            <div class="animation">
                <LottieAnimation animation={loader}></LottieAnimation>
            </div>
        </div>
    </div>
{/if}
{#if SCRIPT_LOADED === 'error'}
    <div class={`sponsorFormParent ${$isBeingFilled && 'isBeingFilled'}`}>
        <div class={`mainContainer ${$isBeingFilled && 'isBeingFilled'} boxBoxShadow`}>
            <div class="animation">
                <LottieAnimation animation={error}></LottieAnimation>
            </div>
        </div>
    </div>
{/if}

<style lang="scss">
  @use './index';
  @forward '../../styles/main';

  .animation {
    max-width: 350px;
    max-height: 350px;
    margin: auto;
  }
</style>
