<script lang="ts">
  import { onMount } from 'svelte';
  import {
    checkKlubDonPayment,
    createKlubDonPayment,
    createPaymentIntent,
    createReCaptchaToken
  } from '../../../../logic/api';
  import { getStripe } from '../../../../logic/stripe';
  import type { Stripe, StripeElements } from '@stripe/stripe-js';
  import {
    DEFAULT_VALUES,
    index,
    isLoading,
    FORM_CONFIG
  } from '../../../../logic/useSponsorshipForm.svelte';
  import { updateKlubrDonStatus } from '../../../../logic/submit';
  import { dispatchToast } from '../../../../logic/toaster';
  import eventBus from '../../../../../../utils/eventBus';
  import { EVENT_CONTEXT } from '../../../../logic/initListeners';
  import LottieAnimation from '../../../../../../utils/lottie/LottieAnimation.svelte';
  import loader from '../../../../../../assets/animations/loader.json';
  import error from '../../../../../../assets/animations/error.json';
  import { sendGaEvent } from '../../../../../../utils/sendGaEvent';
  let clientSecret: string | null = $state(null);
  let stripe: Stripe | null = $state(null);
  let elements: StripeElements | null = $state(null);
  let stripeLoading = $state('loading');

  onMount(async () => {
    try {
      //TODO: check
      // if (!FORM_CONFIG.donUuid || !DEFAULT_VALUES.montant) {
      //   new Error('error');
      // }
      sendGaEvent({
        category: 'donation',
        label: `Create payment intent for don: ${FORM_CONFIG.donUuid} price: ${DEFAULT_VALUES.montant})`
      });
      clientSecret = await createPaymentIntent(
        DEFAULT_VALUES.montant + (DEFAULT_VALUES.contributionAKlubr || 0)
      ).then((res) => res.intent);
      stripe = await getStripe();

      const appearance = {
        theme: 'stripe'
      };
      elements = stripe.elements({
        appearance,
        clientSecret
      });

      const paymentElementOptions = {
        layout: 'tabs'
      };

      const paymentElement = elements.create('payment', paymentElementOptions);
      const el = document.querySelector(`div[slot="stripe-payment-form"]`);
      paymentElement.mount(el);
      setTimeout(() => {
        stripeLoading = 'loaded';
      }, 300);
    } catch (e) {
      sendGaEvent({
        category: 'donation_error',
        label: `Create payment intent (prices: ${DEFAULT_VALUES.montant})`
      });
      console.log(e);
      stripeLoading = 'error';
    }
  });

  async function onsubmit(event) {
    event.preventDefault();
    try {
      if (!stripe || !elements) return;
      isLoading.set(true);

      await checkKlubDonPayment(clientSecret);

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: 'if_required'
      });
      const error = result?.error;
      if (error) {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          dispatchToast(error.message || 'Une erreur est survenue', 'DANGER');
        } else {
          dispatchToast('Une erreur est survenue', 'DANGER');
        }
        sendGaEvent({
          category: 'donation',
          label: `Create klub don payment for don: ${FORM_CONFIG.donUuid}, price: ${DEFAULT_VALUES.montant} ==> ERROR`
        });
      } else {
        if (result.paymentIntent?.client_secret) {
          await stripe
            .retrievePaymentIntent(result.paymentIntent?.client_secret)
            .then(async ({ paymentIntent, error }) => {
              try {
                sendGaEvent({
                  category: 'donation',
                  label: `Create klub don payment for don: ${FORM_CONFIG.donUuid}, price: ${DEFAULT_VALUES.montant} ==> SUCCESS`
                });
                sendGaEvent({
                  category: 'donation',
                  revenue: {
                    currency: 'EUR',
                    amount: DEFAULT_VALUES.montant + (DEFAULT_VALUES.contributionAKlubr || 0)
                  }
                });
                switch (paymentIntent?.status) {
                  case 'succeeded':
                    index.update((_) => _ + 1);
                    // setMessage('Payment succeeded!');
                    break;
                  case 'processing':
                    // setMessage('Your payment is processing.');
                    dispatchToast('Your payment is processing.', 'WARNING');
                    break;
                  case 'requires_payment_method':
                    // setMessage('Your payment was not successful, please try again.');
                    dispatchToast('Your payment was not successful, please try again.', 'DANGER');
                    break;
                  default:
                    // setMessage('Something went wrong.');
                    dispatchToast('Une erreur est survenue', 'DANGER');
                    break;
                }
                isLoading.set(false);
              } catch (e) {
                dispatchToast('Une erreur est survenue', 'DANGER');
                isLoading.set(false);
              }
            })
            .catch((e) => {
              dispatchToast('Une erreur est survenue', 'DANGER');
              isLoading.set(false);
            });
        }
      }
      isLoading.set(false);
    } catch (e) {
      dispatchToast('Une erreur est survenue', 'DANGER');
      console.log('Error payment', e);
      isLoading.set(false);
    }
  }
</script>

{#if ['loading', 'error'].includes(stripeLoading)}
  <div class="animation">
    <LottieAnimation animation={stripeLoading === 'loading' ? loader : error} />
  </div>
{:else}
  <form
    class="flex flex-col items-center gap-1"
    id="klubr-sponsorship-form-payment-form"
    {onsubmit}
  >
    <slot name="stripe-payment-form"></slot>
    <button
      id="klubr-sponsorship-form-payment-for"
      style="width: 290px;"
      disabled={$isLoading}
      class={`primary-btn ${$isLoading && 'disabled'} desktop`}
    >
      <span id="button-text">Valider</span>
    </button>
    <div id="payment-message" class="hidden"></div>
  </form>
{/if}

<style lang="scss">
  @use 'index';

  .animation {
    max-width: 300px;
    max-height: 300px;
    margin: auto;
  }
</style>
