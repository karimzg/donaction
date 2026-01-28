<script lang="ts">
  /**
   * FormError - Composant unifié pour les messages d'erreur de formulaire
   *
   * @prop message - Le message d'erreur à afficher (optionnel si inputId est fourni)
   * @prop inputId - ID de l'input associé pour récupérer l'erreur depuis le store (optionnel)
   * @prop msgType - Le style visuel: 'pillBadge' | 'ligneAccent' | 'glassCard' | 'minimalDot'
   * @prop show - Contrôle la visibilité (default: true si message non vide)
   *
   * @example
   * // Usage direct avec message
   * <FormError message="Ce champ est requis" />
   *
   * // Usage avec inputId (lié au validator)
   * <input id="email" use:validator={{...}} />
   * <FormError inputId="email" />
   */
  import { fieldErrors } from '../../logic/fieldErrors.svelte';

  type ErrorStyle = 'pillBadge' | 'ligneAccent' | 'glassCard' | 'minimalDot';

  interface Props {
    message?: string;
    inputId?: string;
    msgType?: ErrorStyle;
    show?: boolean;
  }

  let {
    message = '',
    inputId,
    msgType = 'minimalDot',
    show = undefined
  }: Props = $props();

  // Derive message from store if inputId is provided, otherwise use prop
  let displayMessage = $derived(inputId ? (fieldErrors[inputId] || '') : message);

  // Si show n'est pas défini, on l'infère du message
  let isVisible = $derived(show !== undefined ? show : !!displayMessage);
</script>

{#if isVisible && displayMessage}
  <div
    class="don-form-error don-form-error--{msgType}"
    role="alert"
    aria-live="polite"
  >
    {#if msgType === 'pillBadge'}
      <!-- Proposition 1: Pill Badge Moderne -->
      <span class="don-form-error__icon don-form-error__icon--pill">✕</span>

    {:else if msgType === 'ligneAccent'}
      <!-- Proposition 3: Ligne Accent Subtil -->
      <span class="don-form-error__bar"></span>

    {:else if msgType === 'glassCard'}
      <!-- Proposition 4: Glass Card -->
      <div class="don-form-error__icon-wrap">
        <span class="don-form-error__icon">!</span>
      </div>

    {:else if msgType === 'minimalDot'}
      <!-- Proposition 5: Minimal Dot -->
      <span class="don-form-error__dot"></span>
    {/if}

    <!-- Texte commun à tous les styles -->
    <span class="don-form-error__text">{displayMessage}</span>
  </div>
{/if}

<style lang="scss">
  @use 'index';
</style>
