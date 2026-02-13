// ============================================================================
// Glassmorphism Toast System for Shadow DOM Web Components
// ============================================================================
// Converts imperative 27-line toast into a modern, stacked system with
// swipe-dismiss, depth effects, and responsive design. Fully self-contained.

// --- Types ---
type ToastType = 'success' | 'error' | 'warn' | 'info';
type LegacyToastType = 'DANGER' | 'WARNING' | 'SUCCESS';

interface ToastInstance {
  id: string;
  element: HTMLDivElement;
  type: ToastType;
  text: string;
  autoDismissTimer: ReturnType<typeof setTimeout> | null;
  removeTimer: ReturnType<typeof setTimeout> | null;
  cleanupListeners?: () => void;
}

// --- Constants ---
const TOAST_CONFIG = {
  MAX_VISIBLE: 3,
  DURATION_DESKTOP: 5000,
  DURATION_MOBILE: 4000,
  DISMISS_ANIMATION_DURATION: 400,
  ENTRY_ANIMATION_DURATION: 350,
  SWIPE_THRESHOLD: 50,
  MOBILE_BREAKPOINT: 768,
} as const;

const LEGACY_TYPE_MAP: Record<LegacyToastType, ToastType> = {
  DANGER: 'error',
  WARNING: 'warn',
  SUCCESS: 'success',
};

const ARIA_LABELS: Record<ToastType, string> = {
  success: 'Success notification',
  error: 'Error notification',
  warn: 'Warning notification',
  info: 'Information notification',
};

// --- SVG Icons (raw SVG strings, no dependencies) ---
const TOAST_ICONS: Record<ToastType, string> = {
  success: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
    <path d="M6.5 10l2.5 2.5 4-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  error: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
    <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  warn: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M10 2L2 16h16L10 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    <path d="M10 9v2M10 13v0.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
  info: `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5"/>
    <path d="M10 6v0.01M10 9v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,
};

const CLOSE_ICON = `<svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
</svg>`;

// --- CSS Styles (injected into shadow DOM) ---
const TOAST_CSS = `
/* Toast Container */
.don-toastContainer {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 999999;
  display: flex;
  flex-direction: column-reverse;
  gap: 0.75rem;
  pointer-events: none;
}

/* Mobile: top-positioned, full-width */
@media (max-width: 768px) {
  .don-toastContainer {
    top: 0.75rem;
    bottom: auto;
    right: 0;
    left: 0;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
}

/* Individual Toast Item */
.don-toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 14px 20px;
  border-radius: 12px;
  max-width: min(420px, calc(100vw - 3rem));
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 500;
  color: #374151;
  border-left: 3px solid transparent;
  transition: transform 0.3s cubic-bezier(0.21, 1.02, 0.73, 1),
              opacity 0.3s ease;

  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.35);

  /* Entry animation */
  animation: donToastSlideIn 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
}

/* Fallback for browsers without backdrop-filter */
@supports not (backdrop-filter: blur(20px)) {
  .don-toast {
    background: rgba(255, 255, 255, 0.95);
  }
}

/* Type-specific accents */
.don-toast--success { border-left-color: #73cfa8; }
.don-toast--success .don-toast__icon { color: #059669; }

.don-toast--error { border-left-color: #fb9289; }
.don-toast--error .don-toast__icon { color: #dc2626; }

.don-toast--warn { border-left-color: #fde179; }
.don-toast--warn .don-toast__icon { color: #d97706; }

.don-toast--info { border-left-color: #73b1ff; }
.don-toast--info .don-toast__icon { color: #2563eb; }

/* Icon Container */
.don-toast__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.don-toast__icon svg {
  width: 20px;
  height: 20px;
}

/* Text Content */
.don-toast__text {
  flex: 1;
  line-height: 1.4;
}

/* Close Button */
.don-toast__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin-left: 4px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.don-toast__close:hover {
  color: #374151;
  background-color: rgba(0, 0, 0, 0.06);
}

.don-toast__close:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 1px;
}

.don-toast__close svg {
  width: 14px;
  height: 14px;
}

/* Depth effect -- toasts further back appear slightly receded */
.don-toast--depth-1 {
  transform: scale(0.96);
  opacity: 0.85;
}

.don-toast--depth-2 {
  transform: scale(0.92);
  opacity: 0.7;
}

/* Dismiss animation */
.don-toast--dismissing {
  animation: donToastFadeOut 0.4s ease forwards;
}

/* Mobile: Compact Sizing */
@media (max-width: 768px) {
  .don-toast {
    padding: 10px 14px;
    font-size: 13px;
    gap: 0.5rem;
    max-width: calc(100vw - 1.5rem);
    border-radius: 10px;
    touch-action: pan-x;
    user-select: none;
  }

  .don-toast__icon svg {
    width: 16px;
    height: 16px;
  }

  .don-toast__close {
    width: 20px;
    height: 20px;
  }

  .don-toast__close svg {
    width: 12px;
    height: 12px;
  }
}

/* Animations -- desktop */
@keyframes donToastSlideIn {
  0% { opacity: 0; transform: translateY(100%) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes donToastFadeOut {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(8px) scale(0.96); }
}

/* Animations -- mobile (from top) */
@keyframes donToastSlideInFromTop {
  0% { opacity: 0; transform: translateY(-100%) scale(0.95); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes donToastSwipeOut {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-100%) scale(0.96); }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .don-toast {
    animation: none;
    opacity: 1;
    transform: none;
    transition: none;
  }

  .don-toast--dismissing {
    animation: none;
    opacity: 0;
  }

  .don-toast--depth-1 {
    opacity: 0.85;
    transform: none;
  }

  .don-toast--depth-2 {
    opacity: 0.7;
    transform: none;
  }

  .don-toast__close {
    transition: none;
  }
}

/* Mobile: Entry from top, swipe-out upward */
@media (max-width: 768px) {
  .don-toast {
    animation-name: donToastSlideInFromTop;
  }

  .don-toast--dismissing {
    animation-name: donToastSwipeOut;
  }
}
`;

// --- State Management ---
const activeToasts: ToastInstance[] = [];
let toastContainer: HTMLDivElement | null = null;
let toastIdCounter = 0;

// --- Helper Functions ---

/**
 * Get the shadow root of the sponsorship form web component
 */
function getShadowRoot(): ShadowRoot | null {
  const element = document.querySelector('klubr-sponsorship-form');
  return element?.shadowRoot || null;
}

/**
 * Check if device is mobile based on viewport width
 */
function isMobile(): boolean {
  return typeof window !== 'undefined' && window.innerWidth <= TOAST_CONFIG.MOBILE_BREAKPOINT;
}

/**
 * Inject CSS styles into shadow root (once)
 */
function ensureStyles(shadowRoot: ShadowRoot): void {
  if (shadowRoot.querySelector('#don-toast-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'don-toast-styles';
  style.textContent = TOAST_CSS;
  shadowRoot.appendChild(style);
}

/**
 * Create or retrieve the toast container in shadow DOM
 */
function ensureToastContainer(shadowRoot: ShadowRoot): HTMLDivElement {
  if (toastContainer && toastContainer.parentNode) {
    return toastContainer;
  }

  toastContainer = document.createElement('div');
  toastContainer.className = 'don-toastContainer';
  toastContainer.setAttribute('role', 'status');
  toastContainer.setAttribute('aria-live', 'polite');
  toastContainer.setAttribute('aria-atomic', 'false');

  shadowRoot.appendChild(toastContainer);
  return toastContainer;
}

/**
 * Create a toast element with icon, text, and close button
 */
function createToastElement(id: string, text: string, type: ToastType): HTMLDivElement {
  const toast = document.createElement('div');
  toast.className = `don-toast don-toast--${type}`;
  toast.setAttribute('data-toast-id', id);
  toast.setAttribute('aria-label', ARIA_LABELS[type]);

  // Icon container
  // Safe: TOAST_ICONS are static SVG constants, not user input
  const iconContainer = document.createElement('div');
  iconContainer.className = 'don-toast__icon';
  iconContainer.innerHTML = TOAST_ICONS[type];

  // Text content
  const textElement = document.createElement('div');
  textElement.className = 'don-toast__text';
  textElement.textContent = text;

  // Close button
  const closeButton = document.createElement('button');
  closeButton.className = 'don-toast__close';
  closeButton.type = 'button';
  // Safe: CLOSE_ICON is a static SVG string, not user input
  closeButton.innerHTML = CLOSE_ICON;
  closeButton.setAttribute('aria-label', 'Dismiss notification');
  closeButton.addEventListener('click', () => dismissToast(id));

  // Assemble toast
  toast.appendChild(iconContainer);
  toast.appendChild(textElement);
  toast.appendChild(closeButton);

  return toast;
}

/**
 * Update depth classes (newest at depth-0, older at depth-1/2)
 */
function updateDepths(): void {
  const count = activeToasts.length;
  activeToasts.forEach((toast, index) => {
    const element = toast.element;
    const depth = count - 1 - index;

    // Remove all depth classes
    element.classList.remove('don-toast--depth-1', 'don-toast--depth-2');

    // Apply depth class for non-zero depths
    if (depth === 1) {
      element.classList.add('don-toast--depth-1');
    } else if (depth >= 2) {
      element.classList.add('don-toast--depth-2');
    }

    element.setAttribute('data-depth', String(depth));
  });
}

/**
 * Attach swipe-to-dismiss handlers for mobile (adapted from frontend useSwipeDismiss)
 */
function attachSwipeHandlers(element: HTMLDivElement, toastId: string): (() => void) | undefined {
  if (!isMobile()) {
    return undefined;
  }

  let startY = 0;
  let currentOffset = 0;

  const onTouchStart = (e: TouchEvent): void => {
    startY = e.touches[0].clientY;
    currentOffset = 0;
  };

  const onTouchMove = (e: TouchEvent): void => {
    const deltaY = e.touches[0].clientY - startY;
    // Only allow upward swipe (negative delta)
    const offset = Math.min(0, deltaY);
    currentOffset = offset;

    // Direct DOM manipulation for smooth 60fps visual feedback
    element.style.transform = `translateY(${offset}px)`;
    element.style.opacity = `${Math.max(0.3, 1 - Math.abs(offset) / 150)}`;
  };

  const onTouchEnd = (): void => {
    if (Math.abs(currentOffset) >= TOAST_CONFIG.SWIPE_THRESHOLD) {
      dismissToast(toastId);
    } else {
      // Snap back with transition
      element.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
      element.style.transform = '';
      element.style.opacity = '';
      const cleanup = () => {
        element.style.transition = '';
        element.removeEventListener('transitionend', cleanup);
      };
      element.addEventListener('transitionend', cleanup);
    }
    currentOffset = 0;
  };

  const onTouchCancel = (): void => {
    element.style.transform = '';
    element.style.opacity = '';
    currentOffset = 0;
  };

  element.addEventListener('touchstart', onTouchStart, { passive: true });
  element.addEventListener('touchmove', onTouchMove, { passive: true });
  element.addEventListener('touchend', onTouchEnd);
  element.addEventListener('touchcancel', onTouchCancel);

  return () => {
    element.removeEventListener('touchstart', onTouchStart);
    element.removeEventListener('touchmove', onTouchMove);
    element.removeEventListener('touchend', onTouchEnd);
    element.removeEventListener('touchcancel', onTouchCancel);
  };
}

/**
 * Remove a toast completely (after dismiss animation)
 */
function removeToast(id: string): void {
  const index = activeToasts.findIndex((t) => t.id === id);
  if (index === -1) {
    return;
  }

  const toast = activeToasts[index];

  // Clear all timers
  if (toast.autoDismissTimer) {
    clearTimeout(toast.autoDismissTimer);
  }
  if (toast.removeTimer) {
    clearTimeout(toast.removeTimer);
  }

  // Clean up event listeners
  if (toast.cleanupListeners) {
    toast.cleanupListeners();
  }

  // Remove element from DOM
  if (toast.element.parentElement) {
    toast.element.remove();
  }

  // Remove from state
  activeToasts.splice(index, 1);

  // Update depths
  updateDepths();

  // Remove container and reset counter if empty
  if (activeToasts.length === 0) {
    toastIdCounter = 0;
    if (toastContainer?.parentElement) {
      toastContainer.remove();
    }
    toastContainer = null;
  }
}

/**
 * Dismiss a toast (start animation, then remove)
 */
function dismissToast(id: string): void {
  const toast = activeToasts.find((t) => t.id === id);
  if (!toast) {
    return;
  }

  // Clear auto-dismiss timer if still pending
  if (toast.autoDismissTimer) {
    clearTimeout(toast.autoDismissTimer);
    toast.autoDismissTimer = null;
  }

  // Add dismissing animation
  toast.element.classList.add('don-toast--dismissing');

  // Schedule removal after animation
  toast.removeTimer = setTimeout(() => {
    removeToast(id);
  }, TOAST_CONFIG.DISMISS_ANIMATION_DURATION);
}

/**
 * Core API: Dispatch a toast notification
 */
export function dispatchToast(text: string, type: LegacyToastType | ToastType): void {
  const shadowRoot = getShadowRoot();
  if (!shadowRoot) {
    return;
  }

  // Ensure styles are injected
  ensureStyles(shadowRoot);

  // Resolve type
  const resolvedType = (LEGACY_TYPE_MAP[type as LegacyToastType] || type) as ToastType;

  // Ensure container exists
  const container = ensureToastContainer(shadowRoot);

  // If at max capacity, evict oldest
  if (activeToasts.length >= TOAST_CONFIG.MAX_VISIBLE) {
    const oldestId = activeToasts[activeToasts.length - 1].id;
    removeToast(oldestId);
  }

  // Create toast element
  const toastId = String(toastIdCounter++);
  const element = createToastElement(toastId, text, resolvedType);

  // Add to state
  const toastInstance: ToastInstance = {
    id: toastId,
    element,
    type: resolvedType,
    text,
    autoDismissTimer: null,
    removeTimer: null,
  };
  activeToasts.unshift(toastInstance); // Newest first

  // Append to DOM (triggers animation via CSS)
  container.appendChild(element);

  // Update depths
  updateDepths();

  // Attach swipe handlers for mobile
  toastInstance.cleanupListeners = attachSwipeHandlers(element, toastId);

  // Schedule auto-dismiss
  const duration = isMobile() ? TOAST_CONFIG.DURATION_MOBILE : TOAST_CONFIG.DURATION_DESKTOP;
  toastInstance.autoDismissTimer = setTimeout(() => {
    dismissToast(toastId);
  }, duration);
}

/**
 * Clear all visible toasts
 */
export function clearAllToasts(): void {
  // Copy array to avoid mutation during iteration
  const toastsToClear = [...activeToasts];
  toastsToClear.forEach((toast) => {
    dismissToast(toast.id);
  });
}

/**
 * Testing utilities (for unit tests)
 */
export const __testing__ = {
  TOAST_CONFIG,
  TOAST_CSS,
  TOAST_ICONS,
  CLOSE_ICON,
  ARIA_LABELS,
  LEGACY_TYPE_MAP,

  /**
   * Get current active toasts
   */
  getActiveToasts: (): ToastInstance[] => {
    return [...activeToasts];
  },

  /**
   * Get current toast container reference
   */
  getToastContainer: (): HTMLDivElement | null => {
    return toastContainer;
  },

  /**
   * Reset all internal state (for test cleanup)
   */
  resetState: (): void => {
    // Clear all toasts
    activeToasts.forEach((toast) => {
      if (toast.autoDismissTimer) {
        clearTimeout(toast.autoDismissTimer);
      }
      if (toast.removeTimer) {
        clearTimeout(toast.removeTimer);
      }
    });
    activeToasts.length = 0;

    // Remove container
    if (toastContainer && toastContainer.parentElement) {
      toastContainer.remove();
    }
    toastContainer = null;

    // Reset counter
    toastIdCounter = 0;
  },
};
