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
  let calendarMonth = $state(1);
  let calendarYear = $state(2000);

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

  // Default date: today - 18 years
  const defaultDate = $derived.by(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d;
  });

  // Year options for dropdown (descending for birth dates)
  const yearOptions = $derived.by(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  });

  // French month names
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  // French day headers (Mon-Sun)
  const dayHeaders = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];

  // Days in month calculation (for input validation)
  const daysInMonth = $derived.by(() => {
    if (!month || !year) return 31;
    const m = parseInt(month);
    const y = parseInt(year);
    if (isNaN(m) || isNaN(y)) return 31;
    return new Date(y, m, 0).getDate();
  });

  // Calendar computed values
  const calendarDaysInMonth = $derived(new Date(calendarYear, calendarMonth, 0).getDate());

  const calendarFirstDay = $derived.by(() => {
    const firstDay = new Date(calendarYear, calendarMonth - 1, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  });

  const calendarDays = $derived.by(() => {
    const days: (number | null)[] = [];
    for (let i = 0; i < calendarFirstDay; i++) days.push(null);
    for (let i = 1; i <= calendarDaysInMonth; i++) days.push(i);
    return days;
  });

  // Initialize
  onMount(() => {
    // Mobile detection
    if (typeof window !== 'undefined') {
      mediaQueryList = window.matchMedia('(pointer: coarse)');
      isMobile = mediaQueryList.matches;
      handleMediaChange = (e: MediaQueryListEvent) => { isMobile = e.matches; };
      mediaQueryList.addEventListener('change', handleMediaChange);
    }

    // Outside click listener on document for shadow DOM compatibility
    document.addEventListener('mousedown', handleOutsideMousedown);

    // Initialize from value or default to -18 years
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
      calendarMonth = defaultDate.getMonth() + 1;
      calendarYear = defaultDate.getFullYear();
    }
  });

  // ── Validation ──────────────────────────────────────────────

  function validateAndUpdate() {
    errorMessage = '';

    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (!day || !month || !year) {
      if (isTouched && required) errorMessage = 'Ce champ est obligatoire';
      value = '';
      return;
    }

    if (isNaN(d) || d < 1 || d > daysInMonth) { errorMessage = 'Jour non valide'; value = ''; return; }
    if (isNaN(m) || m < 1 || m > 12) { errorMessage = 'Mois non valide'; value = ''; return; }
    if (isNaN(y) || y < minYear || y > maxYear) { errorMessage = `Année entre ${minYear} et ${maxYear}`; value = ''; return; }

    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const date = new Date(dateStr);

    if (date < minDate) { errorMessage = 'Date trop ancienne'; value = ''; return; }
    if (date > maxDate) { errorMessage = 'Vous devez être majeur(e)'; value = ''; return; }

    value = dateStr;
    onchange?.(dateStr);
  }

  // ── Input handlers ──────────────────────────────────────────

  function handleDayInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 2);
    if (val.length === 2) {
      const num = parseInt(val);
      if (num > 31) val = '31';
      if (num < 1 && val !== '') val = '01';
    }
    day = val;
    if (val.length === 2) monthInput?.focus();
    validateAndUpdate();
  }

  function handleMonthInput(e: Event) {
    const input = e.target as HTMLInputElement;
    let val = input.value.replace(/\D/g, '').slice(0, 2);
    if (val.length === 2) {
      const num = parseInt(val);
      if (num > 12) val = '12';
      if (num < 1 && val !== '') val = '01';
    }
    month = val;
    if (val.length === 2) yearInput?.focus();
    validateAndUpdate();
  }

  function handleYearInput(e: Event) {
    const input = e.target as HTMLInputElement;
    year = input.value.replace(/\D/g, '').slice(0, 4);
    validateAndUpdate();
  }

  function handleKeyDown(e: KeyboardEvent, field: 'day' | 'month' | 'year') {
    if (e.key === 'Backspace') {
      const input = e.target as HTMLInputElement;
      if (input.value === '') {
        e.preventDefault();
        if (field === 'month') dayInput?.focus();
        if (field === 'year') monthInput?.focus();
      }
    }
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
    // Close calendar if focus leaves the date picker entirely
    requestAnimationFrame(() => {
      const root = datePickerWrapper?.getRootNode() as ShadowRoot | Document;
      const activeEl = root?.activeElement;
      if (!activeEl || !datePickerWrapper?.contains(activeEl)) {
        closeCalendar();
      }
    });
  }

  // ── Native date input (mobile) ──────────────────────────────

  function handleNativeDateChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const nativeValue = input.value;
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
      day = ''; month = ''; year = ''; value = '';
    }
    isTouched = true;
    validateAndUpdate();
  }

  // ── Calendar logic ──────────────────────────────────────────

  function toggleCalendar() {
    calendarOpen = !calendarOpen;
  }

  function closeCalendar() {
    calendarOpen = false;
  }

  function previousMonth() {
    if (calendarMonth === 1) { calendarMonth = 12; calendarYear--; }
    else calendarMonth--;
  }

  function nextMonth() {
    if (calendarMonth === 12) { calendarMonth = 1; calendarYear++; }
    else calendarMonth++;
  }

  function handleMonthSelect(e: Event) {
    calendarMonth = parseInt((e.target as HTMLSelectElement).value);
  }

  function handleYearSelect(e: Event) {
    calendarYear = parseInt((e.target as HTMLSelectElement).value);
  }

  function selectCalendarDay(dayNum: number) {
    day = String(dayNum).padStart(2, '0');
    month = String(calendarMonth).padStart(2, '0');
    year = String(calendarYear);
    isTouched = true;
    calendarOpen = false;
    validateAndUpdate();
    // Focus next form field after the date picker
    requestAnimationFrame(() => {
      const root = datePickerWrapper?.getRootNode() as ShadowRoot | Document;
      if (!root) return;
      const allFocusable = Array.from(
        root.querySelectorAll('input:not([type="hidden"]), select, textarea') ?? []
      ) as HTMLElement[];
      const lastPickerIndex = allFocusable.reduce(
        (last, el, i) => datePickerWrapper?.contains(el) ? i : last, -1
      );
      if (lastPickerIndex >= 0 && lastPickerIndex < allFocusable.length - 1) {
        allFocusable[lastPickerIndex + 1]?.focus();
      }
    });
  }

  function isDayDisabled(dayNum: number): boolean {
    const date = new Date(calendarYear, calendarMonth - 1, dayNum);
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
    return dayNum === today.getDate() && calendarMonth === today.getMonth() + 1 && calendarYear === today.getFullYear();
  }

  function handleCalendarKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeCalendar();
  }

  function handleOutsideMousedown(e: MouseEvent) {
    if (!calendarOpen || !datePickerWrapper) return;
    const path = e.composedPath();
    if (!path.includes(datePickerWrapper)) closeCalendar();
  }

  // ── Form validation subscription ───────────────────────────

  const unsubscribe = triggerValidation.subscribe((_) => {
    if (_ > 0) { isTouched = true; validateAndUpdate(); }
  });

  onDestroy(() => {
    unsubscribe();
    if (mediaQueryList && handleMediaChange) mediaQueryList.removeEventListener('change', handleMediaChange);
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
    <div class="date-picker__inputs" class:calendar-open={calendarOpen}>
      <input
        bind:this={dayInput}
        type="text"
        inputmode="numeric"
        placeholder="JJ"
        value={day}
        oninput={handleDayInput}
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
          <!-- Calendar header with dropdowns -->
          <div class="date-picker__calendar-header">
            <button type="button" class="date-picker__calendar-nav" onclick={previousMonth} aria-label="Mois précédent">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <div class="date-picker__calendar-selectors">
              <select
                class="date-picker__calendar-select"
                value={calendarMonth}
                onchange={handleMonthSelect}
                aria-label="Mois"
              >
                {#each monthNames as name, i}
                  <option value={i + 1}>{name}</option>
                {/each}
              </select>

              <select
                class="date-picker__calendar-select date-picker__calendar-select--year"
                value={calendarYear}
                onchange={handleYearSelect}
                aria-label="Année"
              >
                {#each yearOptions as y}
                  <option value={y}>{y}</option>
                {/each}
              </select>
            </div>

            <button type="button" class="date-picker__calendar-nav" onclick={nextMonth} aria-label="Mois suivant">
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

  // ── Mobile native input ─────────────────────────────────────

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

    &::-webkit-datetime-edit-text,
    &::-webkit-datetime-edit-month-field,
    &::-webkit-datetime-edit-day-field,
    &::-webkit-datetime-edit-year-field {
      color: var(--don-color-text-primary, #1F2937);
    }

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

  // ── Desktop inputs container ────────────────────────────────

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
    cursor: text;
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

  // ── Calendar toggle ─────────────────────────────────────────

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

  // ── Calendar dropdown ───────────────────────────────────────

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
    padding: 12px;
    width: 308px;
    animation: calendarOpen 200ms ease;
    transform-origin: top;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  @keyframes calendarOpen {
    from { opacity: 0; transform: scaleY(0.95); }
    to { opacity: 1; transform: scaleY(1); }
  }

  // ── Calendar header ─────────────────────────────────────────

  .date-picker__calendar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    padding-bottom: 8px;
    border-bottom: var(--don-border-width, 1px) solid var(--don-color-border-input, #E5E7EB);
  }

  .date-picker__calendar-nav {
    border: none;
    background: transparent;
    color: var(--don-color-text-muted, #6B7280);
    cursor: pointer;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--don-radius-md, 4px);
    transition: background-color 150ms ease, color 150ms ease;
    flex-shrink: 0;

    &:hover {
      background-color: var(--don-color-bg-secondary, #F3F4F6);
      color: var(--don-color-text-primary, #1F2937);
    }
  }

  .date-picker__calendar-selectors {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .date-picker__calendar-select {
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid transparent;
    border-radius: var(--don-radius-md, 4px);
    background: transparent;
    color: var(--don-color-text-primary, #1F2937);
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    padding: 4px 20px 4px 8px;
    transition: border-color 150ms ease, background-color 150ms ease;

    // Custom dropdown arrow
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;

    &:hover {
      border-color: var(--don-color-border-input, #E5E7EB);
      background-color: var(--don-color-bg-secondary, #F3F4F6);
    }

    &:focus {
      outline: none;
      border-color: var(--don-brand-primary, #3B82F6);
    }

    &--year {
      width: 76px;
    }
  }

  // ── Weekday headers ─────────────────────────────────────────

  .date-picker__calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 4px;
  }

  .date-picker__calendar-weekday {
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--don-color-text-muted, #6B7280);
    padding: 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  // ── Day grid ────────────────────────────────────────────────

  .date-picker__calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }

  .date-picker__calendar-empty {
    width: 38px;
    height: 38px;
  }

  .date-picker__calendar-day {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--don-color-text-primary, #1F2937);
    cursor: pointer;
    font-size: 13px;
    font-weight: 500;
    transition: background-color 150ms ease, color 150ms ease, box-shadow 150ms ease;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover:not(:disabled):not(.selected) {
      background-color: var(--don-color-accent-light, rgba(59, 130, 246, 0.08));
      color: var(--don-brand-primary, #3B82F6);
    }

    &.selected {
      background-color: var(--don-brand-primary, #3B82F6);
      color: white;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    &.today:not(.selected) {
      font-weight: 700;
      box-shadow: inset 0 0 0 1.5px var(--don-brand-primary, #3B82F6);
    }

    &:disabled {
      color: var(--don-color-text-disabled, #9CA3AF);
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  // ── Validation states ───────────────────────────────────────

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

  .date-picker.touched.valid {
    .date-picker__inputs,
    .date-picker__native {
      border-color: var(--don-color-success, #059669);
    }
  }

  // ── Reduced motion ──────────────────────────────────────────

  @media (prefers-reduced-motion: reduce) {
    .date-picker__calendar { animation: none; }

    .date-picker__calendar-day,
    .date-picker__calendar-toggle,
    .date-picker__calendar-nav,
    .date-picker__calendar-select {
      transition: none;
    }
  }
</style>
