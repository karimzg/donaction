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

  // Mobile detection
  let isMobile = $state(false);
  let mediaQueryList: MediaQueryList | null = null;
  let handleMediaChange: ((e: MediaQueryListEvent) => void) | null = null;

  // Calendar state
  let calendarOpen = $state(false);
  let calendarMonth = $state(new Date().getMonth() + 1);
  let calendarYear = $state(new Date().getFullYear());

  // Refs for auto-focus
  let dayInput: HTMLInputElement;
  let monthInput: HTMLInputElement;
  let yearInput: HTMLInputElement;
  let nativeDateInput: HTMLInputElement;
  let datePickerWrapper: HTMLDivElement;

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

  // Get days in calendar month
  const calendarDaysInMonth = $derived.by(() => {
    return new Date(calendarYear, calendarMonth, 0).getDate();
  });

  // Get first day of calendar month (0 = Sunday, 1 = Monday, etc.)
  const calendarFirstDay = $derived.by(() => {
    const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
    // Convert to Monday-first (0 = Monday, 6 = Sunday)
    return firstDay === 0 ? 6 : firstDay - 1;
  });

  // Array of calendar days including leading/trailing empty cells
  const calendarDays = $derived.by(() => {
    const days: (number | null)[] = [];
    // Leading empty cells
    for (let i = 0; i < calendarFirstDay; i++) {
      days.push(null);
    }
    // Days of month
    for (let i = 1; i <= calendarDaysInMonth; i++) {
      days.push(i);
    }
    return days;
  });

  // French month names
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // French day headers (Mon-Sun)
  const dayHeaders = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

  // Initialize from value and mobile detection
  onMount(() => {
    // Mobile detection
    if (typeof window !== 'undefined') {
      mediaQueryList = window.matchMedia('(pointer: coarse)');
      isMobile = mediaQueryList.matches;

      handleMediaChange = (e: MediaQueryListEvent) => {
        isMobile = e.matches;
      };

      mediaQueryList.addEventListener('change', handleMediaChange);
    }

    // Register outside click listener on document for shadow DOM compatibility
    document.addEventListener('mousedown', handleOutsideMousedown);

    // Initialize calendar from current selection or today
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
        calendarMonth = parseInt(month);
        calendarYear = parseInt(year);
      }
    } else {
      const today = new Date();
      calendarMonth = today.getMonth() + 1;
      calendarYear = today.getFullYear();
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

  function handleFocus() {
    if (!isMobile) {
      calendarOpen = true;
    }
  }

  function handleBlur() {
    isTouched = true;
    validateAndUpdate();
  }

  // Native date input handlers
  function handleNativeDateChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const nativeValue = input.value; // YYYY-MM-DD format

    if (nativeValue) {
      const parts = nativeValue.split('-');
      if (parts.length === 3) {
        year = parts[0];
        month = parts[1];
        day = parts[2];
        calendarMonth = parseInt(month);
        calendarYear = parseInt(year);
      }
    } else {
      day = '';
      month = '';
      year = '';
      value = '';
    }

    isTouched = true;
    validateAndUpdate();
  }

  // Calendar functions
  function toggleCalendar() {
    calendarOpen = !calendarOpen;
  }

  function closeCalendar() {
    calendarOpen = false;
  }

  function previousMonth() {
    if (calendarMonth === 1) {
      calendarMonth = 12;
      calendarYear--;
    } else {
      calendarMonth--;
    }
  }

  function nextMonth() {
    if (calendarMonth === 12) {
      calendarMonth = 1;
      calendarYear++;
    } else {
      calendarMonth++;
    }
  }

  function selectCalendarDay(dayNum: number) {
    day = String(dayNum).padStart(2, '0');
    month = String(calendarMonth).padStart(2, '0');
    year = String(calendarYear);
    isTouched = true;
    validateAndUpdate();
    closeCalendar();
  }

  function isDayDisabled(dayNum: number): boolean {
    const dateStr = `${calendarYear}-${String(calendarMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const date = new Date(dateStr);
    return date < minDate || date > maxDate;
  }

  function isDaySelected(dayNum: number): boolean {
    return (
      day === String(dayNum).padStart(2, '0') &&
      month === String(calendarMonth).padStart(2, '0') &&
      year === String(calendarYear)
    );
  }

  function isDayToday(dayNum: number): boolean {
    const today = new Date();
    return (
      dayNum === today.getDate() &&
      calendarMonth === today.getMonth() + 1 &&
      calendarYear === today.getFullYear()
    );
  }

  function handleCalendarKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      closeCalendar();
    }
  }

  function handleOutsideMousedown(e: MouseEvent) {
    if (!calendarOpen || !datePickerWrapper) return;
    const path = e.composedPath();
    if (!path.includes(datePickerWrapper)) {
      closeCalendar();
    }
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
    if (mediaQueryList && handleMediaChange) {
      mediaQueryList.removeEventListener('change', handleMediaChange);
    }
    document.removeEventListener('mousedown', handleOutsideMousedown);
  });
</script>

<svelte:window onkeydown={handleCalendarKeyDown} />

<div class="date-picker" class:touched={isTouched} class:invalid={isTouched && errorMessage} class:valid={isTouched && !errorMessage && value} bind:this={datePickerWrapper}>
  {#if isMobile}
    <!-- Mobile: Native date input -->
    <input
      bind:this={nativeDateInput}
      type="date"
      class="date-picker__native"
      class:empty={!value}
      value={value}
      onchange={handleNativeDateChange}
      onblur={handleBlur}
      min={min}
      max={max}
      disabled={disabled}
      aria-label="Date"
    />
  {:else}
    <!-- Desktop: Three-input layout with calendar -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="date-picker__inputs" class:calendar-open={calendarOpen} onclick={handleFocus}>
      <input
        bind:this={dayInput}
        type="text"
        inputmode="numeric"
        placeholder="JJ"
        value={day}
        oninput={handleDayInput}
        onfocus={handleFocus}
        onblur={handleBlur}
        onkeydown={(e) => handleKeyDown(e, 'day')}
        disabled={disabled}
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
        onfocus={handleFocus}
        onblur={handleBlur}
        onkeydown={(e) => handleKeyDown(e, 'month')}
        disabled={disabled}
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
        onfocus={handleFocus}
        onblur={handleBlur}
        onkeydown={(e) => handleKeyDown(e, 'year')}
        disabled={disabled}
        maxlength="4"
        aria-label="Année"
        class="date-picker__field date-picker__field--year"
      />

      <!-- Calendar toggle button -->
      <button
        type="button"
        class="date-picker__calendar-toggle"
        onclick={toggleCalendar}
        disabled={disabled}
        aria-label="Ouvrir le calendrier"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </button>

      <!-- Calendar dropdown -->
      {#if calendarOpen}
        <div class="date-picker__calendar" role="dialog" aria-label="Sélectionnez une date">
          <!-- Calendar header -->
          <div class="date-picker__calendar-header">
            <button
              type="button"
              class="date-picker__calendar-nav"
              onclick={previousMonth}
              aria-label="Mois précédent"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div class="date-picker__calendar-month-year">
              {monthNames[calendarMonth - 1]} {calendarYear}
            </div>

            <button
              type="button"
              class="date-picker__calendar-nav"
              onclick={nextMonth}
              aria-label="Mois suivant"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <!-- Day headers -->
          <div class="date-picker__calendar-weekdays">
            {#each dayHeaders as header}
              <div class="date-picker__calendar-weekday">{header}</div>
            {/each}
          </div>

          <!-- Calendar grid -->
          <div class="date-picker__calendar-grid">
            {#each calendarDays as dayNum, index (index)}
              {#if dayNum === null}
                <div class="date-picker__calendar-empty"></div>
              {:else}
                <button
                  type="button"
                  class="date-picker__calendar-day"
                  class:selected={isDaySelected(dayNum)}
                  class:today={isDayToday(dayNum)}
                  disabled={isDayDisabled(dayNum)}
                  onclick={() => selectCalendarDay(dayNum)}
                  aria-label={`${dayNum} ${monthNames[calendarMonth - 1]} ${calendarYear}`}
                >
                  {dayNum}
                </button>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if isTouched && errorMessage}
    <FormError message={errorMessage}/>
  {/if}
</div>

<style lang="scss">
  .date-picker {
    display: flex;
    flex-direction: column;
    gap: var(--don-spacing-sm, 4px);
    position: relative;
  }

  .date-picker__native {
    width: 100%;
    height: 44px;
    box-sizing: border-box;
    border: var(--don-border-width, 1px) solid var(--don-color-border-input, #E5E7EB);
    border-radius: var(--don-radius-lg, 8px);
    background-color: var(--don-color-bg-input, #fff);
    padding: var(--don-spacing-lg, 12px) var(--don-spacing-xl, 16px);
    font-size: var(--don-font-size-base, 14px);
    font-family: inherit;
    color: var(--don-color-text-primary, #1F2937);
    transition: border-color 200ms ease, box-shadow 200ms ease;

    // Native date: filled state
    &::-webkit-datetime-edit-text,
    &::-webkit-datetime-edit-month-field,
    &::-webkit-datetime-edit-day-field,
    &::-webkit-datetime-edit-year-field {
      color: var(--don-color-text-primary, #1F2937);
    }

    // Native date: placeholder state (no value selected)
    &.empty::-webkit-datetime-edit-text,
    &.empty::-webkit-datetime-edit-month-field,
    &.empty::-webkit-datetime-edit-day-field,
    &.empty::-webkit-datetime-edit-year-field {
      color: var(--don-color-text-placeholder, #9CA3AF);
    }

    &:focus {
      outline: none;
      border-color: var(--don-brand-primary, #3B82F6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    &:disabled {
      color: var(--don-color-text-disabled, #9CA3AF);
      background-color: var(--don-color-bg-disabled, #F3F4F6);
      cursor: not-allowed;
    }
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
    position: relative;
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
      opacity: 1;
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

  // Calendar toggle button
  .date-picker__calendar-toggle {
    border: none;
    background: transparent;
    color: var(--don-color-text-muted, #6B7280);
    cursor: pointer;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    transition: color 200ms ease;
    margin-left: auto;

    &:hover:not(:disabled) {
      color: var(--don-brand-primary, #3B82F6);
    }

    &:disabled {
      color: var(--don-color-text-disabled, #9CA3AF);
      cursor: not-allowed;
    }
  }

  // Calendar dropdown
  .date-picker__calendar {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 10;
    margin-top: 4px;
    background-color: white;
    border: var(--don-border-width, 1px) solid var(--don-color-border-input, #E5E7EB);
    border-radius: var(--don-radius-lg, 8px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    padding: var(--don-spacing-md, 8px);
    min-width: 300px;
    animation: calendarOpen 200ms ease;
    transform-origin: top;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  @keyframes calendarOpen {
    from {
      opacity: 0;
      transform: scaleY(0.95);
    }
    to {
      opacity: 1;
      transform: scaleY(1);
    }
  }

  .date-picker__calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--don-spacing-md, 8px);
    padding-bottom: var(--don-spacing-sm, 4px);
    border-bottom: var(--don-border-width, 1px) solid var(--don-color-border-input, #E5E7EB);
  }

  .date-picker__calendar-nav {
    border: none;
    background: transparent;
    color: var(--don-color-text-muted, #6B7280);
    cursor: pointer;
    padding: 4px 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--don-radius-md, 4px);
    transition: background-color 200ms ease, color 200ms ease;

    &:hover {
      background-color: var(--don-color-bg-secondary, #F3F4F6);
      color: var(--don-color-text-primary, #1F2937);
    }
  }

  .date-picker__calendar-month-year {
    font-size: var(--don-font-size-base, 14px);
    font-weight: 600;
    color: var(--don-color-text-primary, #1F2937);
  }

  .date-picker__calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    margin-bottom: var(--don-spacing-sm, 4px);
  }

  .date-picker__calendar-weekday {
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: var(--don-color-text-muted, #6B7280);
    padding: 4px 0;
  }

  .date-picker__calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .date-picker__calendar-empty {
    width: 36px;
    height: 36px;
  }

  .date-picker__calendar-day {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--don-color-text-primary, #1F2937);
    cursor: pointer;
    font-size: var(--don-font-size-sm, 12px);
    font-weight: 500;
    transition: background-color 200ms ease, color 200ms ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled) {
      background-color: var(--don-color-bg-secondary, #F3F4F6);
    }

    &.selected {
      background-color: var(--don-brand-primary, #3B82F6);
      color: white;
      font-weight: 600;
    }

    &.today {
      box-shadow: inset 0 0 0 1px var(--don-brand-primary, #3B82F6);
    }

    &:disabled {
      color: var(--don-color-text-disabled, #9CA3AF);
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  // Show error state when touched and invalid
  .date-picker.touched.invalid {
    .date-picker__inputs,
    .date-picker__native {
      border-color: var(--don-color-error, #DC2626);
      background-color: var(--don-color-error-light, #FEF2F2);

      &:focus-within,
      &:focus {
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
      }
    }
  }

  // Valid state
  .date-picker.touched.valid {
    .date-picker__inputs,
    .date-picker__native {
      border-color: var(--don-color-success, #059669);
    }
  }

  // Reduced motion
  @media (prefers-reduced-motion: reduce) {
    .date-picker__calendar {
      animation: none;
    }

    .date-picker__calendar-day,
    .date-picker__calendar-toggle,
    .date-picker__calendar-nav {
      transition: none;
    }
  }
</style>
