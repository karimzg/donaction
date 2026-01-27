<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { triggerValidation } from '../../../../logic/useSponsorshipForm.svelte';
  import FormError from '../../../formError/FormError.svelte';

  interface Props {
    value?: string;
    min?: string;
    max?: string;
    required?: boolean;
    disabled?: boolean;
    onchange?: (value: string) => void;
  }

  let { value = $bindable(''), min = '1901-01-01', max, required = false, disabled = false, onchange }: Props = $props();

  // Parse initial value if exists (format: YYYY-MM-DD)
  let day = $state('');
  let month = $state('');
  let year = $state('');
  let isTouched = $state(false);
  let errorMessage = $state('');

  // Refs for auto-focus
  let dayInput: HTMLInputElement;
  let monthInput: HTMLInputElement;
  let yearInput: HTMLInputElement;

  // Parse min/max dates
  const minDate = $derived(min ? new Date(min) : new Date('1901-01-01'));
  const maxDate = $derived(max ? new Date(max) : new Date());
  const minYear = $derived(minDate.getFullYear());
  const maxYear = $derived(maxDate.getFullYear());

  // Days in month calculation
  const daysInMonth = $derived.by(() => {
    if (!month || !year) return 31;
    const m = parseInt(month);
    const y = parseInt(year);
    if (isNaN(m) || isNaN(y)) return 31;
    return new Date(y, m, 0).getDate();
  });

  // Initialize from value
  onMount(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
      }
    }
  });

  // Validate and build date string
  function validateAndUpdate() {
    errorMessage = '';

    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    // Check if all fields have values
    if (!day || !month || !year) {
      if (isTouched && required) {
        errorMessage = 'Ce champ est obligatoire';
      }
      value = '';
      return;
    }

    // Validate ranges
    if (isNaN(d) || d < 1 || d > daysInMonth) {
      errorMessage = 'Jour non valide';
      value = '';
      return;
    }

    if (isNaN(m) || m < 1 || m > 12) {
      errorMessage = 'Mois non valide';
      value = '';
      return;
    }

    if (isNaN(y) || y < minYear || y > maxYear) {
      errorMessage = `Année entre ${minYear} et ${maxYear}`;
      value = '';
      return;
    }

    // Build date and check against min/max
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const date = new Date(dateStr);

    if (date < minDate) {
      errorMessage = 'Date trop ancienne';
      value = '';
      return;
    }

    if (date > maxDate) {
      errorMessage = 'Vous devez être majeur(e)';
      value = '';
      return;
    }

    // Valid date
    value = dateStr;
    onchange?.(dateStr);
  }

  // Handle input with auto-advance
  function handleDayInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 2);

    // Auto-correct day
    if (val.length === 2) {
      const num = parseInt(val);
      if (num > 31) val = '31';
      if (num < 1 && val !== '') val = '01';
    }

    day = val;

    // Auto-advance to month
    if (val.length === 2) {
      monthInput?.focus();
    }

    validateAndUpdate();
  }

  function handleMonthInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 2);

    // Auto-correct month
    if (val.length === 2) {
      const num = parseInt(val);
      if (num > 12) val = '12';
      if (num < 1 && val !== '') val = '01';
    }

    month = val;

    // Auto-advance to year
    if (val.length === 2) {
      yearInput?.focus();
    }

    validateAndUpdate();
  }

  function handleYearInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 4);
    year = val;
    validateAndUpdate();
  }

  // Handle backspace for field navigation
  function handleKeyDown(e: KeyboardEvent, field: 'day' | 'month' | 'year') {
    if (e.key === 'Backspace') {
      const input = e.target as HTMLInputElement;
      if (input.value === '') {
        e.preventDefault();
        if (field === 'month') dayInput?.focus();
        if (field === 'year') monthInput?.focus();
      }
    }
    // Arrow navigation
    if (e.key === 'ArrowRight' && (e.target as HTMLInputElement).selectionStart === (e.target as HTMLInputElement).value.length) {
      if (field === 'day') monthInput?.focus();
      if (field === 'month') yearInput?.focus();
    }
    if (e.key === 'ArrowLeft' && (e.target as HTMLInputElement).selectionStart === 0) {
      if (field === 'month') dayInput?.focus();
      if (field === 'year') monthInput?.focus();
    }
  }

  function handleBlur() {
    isTouched = true;
    validateAndUpdate();
  }

  // Subscribe to form validation trigger
  const unsubscribe = triggerValidation.subscribe((_) => {
    if (_ > 0) {
      isTouched = true;
      validateAndUpdate();
    }
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<div class="date-picker" class:touched={isTouched} class:invalid={isTouched && errorMessage} class:valid={isTouched && !errorMessage && value}>
  <div class="date-picker__inputs">
    <input
      bind:this={dayInput}
      type="text"
      inputmode="numeric"
      placeholder="JJ"
      value={day}
      oninput={handleDayInput}
      onblur={handleBlur}
      onkeydown={(e) => handleKeyDown(e, 'day')}
      {disabled}
      maxlength="2"
      aria-label="Jour"
      class="date-picker__field date-picker__field--day"
    />
    <span class="date-picker__separator">/</span>
    <input
      bind:this={monthInput}
      type="text"
      inputmode="numeric"
      placeholder="MM"
      value={month}
      oninput={handleMonthInput}
      onblur={handleBlur}
      onkeydown={(e) => handleKeyDown(e, 'month')}
      {disabled}
      maxlength="2"
      aria-label="Mois"
      class="date-picker__field date-picker__field--month"
    />
    <span class="date-picker__separator">/</span>
    <input
      bind:this={yearInput}
      type="text"
      inputmode="numeric"
      placeholder="AAAA"
      value={year}
      oninput={handleYearInput}
      onblur={handleBlur}
      onkeydown={(e) => handleKeyDown(e, 'year')}
      {disabled}
      maxlength="4"
      aria-label="Année"
      class="date-picker__field date-picker__field--year"
    />
  </div>
  {#if isTouched && errorMessage}
    <FormError message={errorMessage}/>
  {/if}
</div>

<style lang="scss">
  .date-picker {
    display: flex;
    flex-direction: column;
    gap: var(--don-spacing-sm, 4px);
  }

  .date-picker__inputs {
    display: flex;
    align-items: center;
    gap: 0;
    border: var(--don-border-width, 1px) solid var(--don-color-border-input, #E5E7EB);
    border-radius: var(--don-radius-lg, 8px);
    background-color: var(--don-color-bg-input, #fff);
    padding: 0 var(--don-spacing-lg, 12px);
    height: 44px;
    transition: border-color 200ms ease, box-shadow 200ms ease;

    &:focus-within {
      border-color: var(--don-brand-primary, #3B82F6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
  }

  .date-picker__field {
    border: none;
    background: transparent;
    font-size: var(--don-font-size-base, 14px);
    font-family: inherit;
    color: var(--don-color-text-primary, #1F2937);
    text-align: center;
    padding: var(--don-spacing-sm, 4px) 0;
    outline: none;

    &::placeholder {
      color: var(--don-color-text-placeholder, #9CA3AF);
    }

    &--day,
    &--month {
      width: 32px;
    }

    &--year {
      width: 48px;
    }

    &:disabled {
      color: var(--don-color-text-disabled, #9CA3AF);
      cursor: not-allowed;
    }
  }

  .date-picker__separator {
    color: var(--don-color-text-muted, #6B7280);
    font-size: var(--don-font-size-base, 14px);
    user-select: none;
  }

  // Show error state when touched and invalid
  .date-picker.touched.invalid {
    .date-picker__inputs {
      border-color: var(--don-color-error, #DC2626);
      background-color: var(--don-color-error-light, #FEF2F2);

      &:focus-within {
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
      }
    }
  }

  // Valid state
  .date-picker.touched.valid {
    .date-picker__inputs {
      border-color: var(--don-color-success, #059669);
    }
  }

  // Reduced motion
  @media (prefers-reduced-motion: reduce) {
    .date-picker__error {
      transition: none;
    }
  }
</style>
