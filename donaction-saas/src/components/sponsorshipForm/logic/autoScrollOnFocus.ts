const MOBILE_BREAKPOINT = 768;
const HEADER_OFFSET = 16;
const SCROLL_DELAY_MS = 300;

const FOCUSABLE_SELECTORS = 'input, textarea, select, [contenteditable="true"]';

/**
 * Svelte action: auto-scrolls the container so the focused input
 * appears just below the sticky header on mobile.
 *
 * Usage: <div use:autoScrollOnFocus>...</div>
 */
export function autoScrollOnFocus(container: HTMLElement) {
  function handleFocusIn(event: FocusEvent) {
    const target = event.target as HTMLElement;

    if (!target?.matches(FOCUSABLE_SELECTORS)) return;
    if (window.innerWidth > MOBILE_BREAKPOINT) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Delay to let the mobile keyboard open and viewport resize
    setTimeout(() => {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const offsetTop = targetRect.top - containerRect.top + container.scrollTop;

      container.scrollTo({
        top: offsetTop - HEADER_OFFSET,
        behavior: 'smooth',
      });
    }, SCROLL_DELAY_MS);
  }

  container.addEventListener('focusin', handleFocusIn);

  return {
    destroy() {
      container.removeEventListener('focusin', handleFocusIn);
    },
  };
}
