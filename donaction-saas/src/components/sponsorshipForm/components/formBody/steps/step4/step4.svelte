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
    FORM_CONFIG,
    SUBSCRIPTION
  } from '../../../../logic/useSponsorshipForm.svelte';
  import { updateKlubrDonStatus } from '../../../../logic/submit';
  import { dispatchToast } from '../../../../logic/toaster';
  import eventBus from '../../../../../../utils/eventBus';
  import { EVENT_CONTEXT } from '../../../../logic/initListeners';
  import LottieAnimation from '../../../../../../utils/lottie/LottieAnimation.svelte';
  import loader from '../../../../../../assets/animations/loader.json';
  import error from '../../../../../../assets/animations/error.json';
  import { sendGaEvent } from '../../../../../../utils/sendGaEvent';
  import { calculateFeeAmount } from '../../../../logic/utils';

  let clientSecret: string | null = $state(null);
  let stripe: Stripe | null = $state(null);
  let elements: StripeElements | null = $state(null);
  let stripeLoading = $state('loading');
  let stripeErrorMessage: string | null = $state(null);
  let idempotencyKey: string | null = $state(null);

  function generateIdempotencyKey(): string {
    return crypto.randomUUID();
  }

  onMount(async () => {
    try {
      sendGaEvent({
        category: 'donation',
        label: `Create payment intent for don: ${FORM_CONFIG.donUuid} price: ${DEFAULT_VALUES.montant})`
      });

      // Generate idempotency key for this payment session
      idempotencyKey = generateIdempotencyKey();

      // Calculate fee if donor pays fee (Stripe Connect mode)
      const tradePolicy = SUBSCRIPTION.klubr?.trade_policy;
      const isStripeConnect = tradePolicy?.stripe_connect === true;
      const commissionPercentage = tradePolicy?.commissionPercentage ?? 4;
      const feeAmount =
        isStripeConnect && DEFAULT_VALUES.donorPaysFee
          ? calculateFeeAmount(DEFAULT_VALUES.montant, commissionPercentage)
          : 0;

      const totalAmount = DEFAULT_VALUES.montant + (DEFAULT_VALUES.contributionAKlubr || 0) + feeAmount;
      const response = await createPaymentIntent(totalAmount, idempotencyKey, false);

      clientSecret = response.intent;

      if (response.reused) {
        console.log('♻️ Réutilisation du payment intent existant');
      }

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
    } catch (e: any) {
      sendGaEvent({
        category: 'donation_error',
        label: `Create payment intent (prices: ${DEFAULT_VALUES.montant})`
      });
      console.error('Erreur création payment intent:', e);

      // Extract error message from API response
      const errorMessage =
        e?.error?.message ||
        e?.message ||
        'Une erreur est survenue lors de l\'initialisation du paiement';

      stripeErrorMessage = errorMessage;
      stripeLoading = 'error';

      // Show toast with specific error message
      dispatchToast(errorMessage, 'DANGER');
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

{#if stripeLoading === 'loading'}
  <div class="animation">
    <LottieAnimation animation={loader} />
  </div>
{:else if stripeLoading === 'error'}
  <div class="animation">
    <LottieAnimation animation={error} />
    {#if stripeErrorMessage}
      <p class="error-message">{stripeErrorMessage}</p>
    {/if}
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
    text-align: center;
  }

  .error-message {
    color: #dc3545;
    font-size: 14px;
    margin-top: 16px;
    padding: 12px;
    background-color: #fdf2f2;
    border-radius: 8px;
    text-align: center;
  }
</style>
