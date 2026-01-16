<script lang="ts">
  import camera from '../../../../../../assets/icons/camera.svg';

  interface Props {
    value?: string;
    maxSize?: number;
    accept?: string[];
    onchange?: (value: string | null, file: File | null) => void;
  }

  let {
    value = $bindable(''),
    maxSize = 2 * 1024 * 1024, // 2MB default
    accept = ['image/png', 'image/jpeg', 'image/webp'],
    onchange
  }: Props = $props();

  let isDragging = $state(false);
  let isLoading = $state(false);
  let errorMessage = $state('');
  let fileInputRef: HTMLInputElement;

  // Format max size for display
  const maxSizeDisplay = $derived(() => {
    if (maxSize >= 1024 * 1024) {
      return `${(maxSize / (1024 * 1024)).toFixed(0)}MB`;
    }
    return `${(maxSize / 1024).toFixed(0)}KB`;
  });

  // Format accepted types for display
  const acceptDisplay = $derived(() => {
    return accept.map(type => type.split('/')[1].toUpperCase()).join(', ');
  });

  function validateFile(file: File): string | null {
    // Check type
    if (!accept.includes(file.type)) {
      return `Format non supporté. Utilisez: ${acceptDisplay()}`;
    }

    // Check size
    if (file.size > maxSize) {
      return `Fichier trop lourd. Max: ${maxSizeDisplay()}`;
    }

    return null;
  }

  function processFile(file: File) {
    errorMessage = '';

    const validationError = validateFile(file);
    if (validationError) {
      errorMessage = validationError;
      return;
    }

    isLoading = true;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    value = previewUrl;
    onchange?.(previewUrl, file);

    // Simulate small delay for UX feedback
    setTimeout(() => {
      isLoading = false;
    }, 300);
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input to allow selecting same file again
    input.value = '';
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      processFile(file);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(event: DragEvent) {
    event.preventDefault();
    isDragging = false;
  }

  function handleClick() {
    fileInputRef?.click();
  }

  function handleRemove(event: MouseEvent) {
    event.stopPropagation();

    // Revoke old URL to prevent memory leak
    if (value) {
      URL.revokeObjectURL(value);
    }

    value = '';
    errorMessage = '';
    onchange?.(null, null);
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (value) {
        handleRemove(event as unknown as MouseEvent);
      } else {
        handleClick();
      }
    }
  }
</script>

<div class="logo-upload">
  <div
    class="logo-upload__zone"
    class:dragging={isDragging}
    class:has-preview={!!value}
    class:loading={isLoading}
    class:has-error={!!errorMessage}
    onclick={handleClick}
    onkeydown={handleKeyDown}
    ondrop={handleDrop}
    ondragover={handleDragOver}
    ondragleave={handleDragLeave}
    role="button"
    tabindex="0"
    aria-label={value ? "Changer le logo" : "Ajouter un logo"}
  >
    {#if isLoading}
      <div class="logo-upload__loader">
        <div class="logo-upload__spinner"></div>
      </div>
    {:else if value}
      <div class="logo-upload__preview">
        <img src={value} alt="Logo preview" class="logo-upload__image" />
        <button
          type="button"
          class="logo-upload__remove"
          onclick={handleRemove}
          aria-label="Supprimer le logo"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    {:else}
      <div class="logo-upload__placeholder">
        <div class="logo-upload__icon">
          <img src={camera} alt="" width="32" height="32" />
        </div>
        <span class="logo-upload__text">Glissez ou cliquez</span>
        <small class="logo-upload__hint">{acceptDisplay()} • Max {maxSizeDisplay()}</small>
      </div>
    {/if}
  </div>

  <input
    bind:this={fileInputRef}
    type="file"
    accept={accept.join(',')}
    onchange={handleFileSelect}
    class="logo-upload__input"
    aria-hidden="true"
    tabindex="-1"
  />

  {#if errorMessage}
    <small class="logo-upload__error">{errorMessage}</small>
  {/if}
</div>

<style lang="scss">
  .logo-upload {
    display: flex;
    flex-direction: column;
    gap: var(--don-spacing-sm, 8px);
    width: fit-content;
  }

  .logo-upload__zone {
    width: 100px;
    height: 100px;
    border: 2px dashed var(--don-color-border-input, #E5E7EB);
    border-radius: var(--don-radius-lg, 12px);
    background-color: var(--don-color-bg-subtle, #F9FAFB);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      border-color 200ms ease,
      background-color 200ms ease,
      transform 150ms ease;
    position: relative;
    overflow: hidden;

    &:hover {
      border-color: var(--don-brand-primary, #3B82F6);
      background-color: var(--don-color-bg-input, #fff);
    }

    &:focus-visible {
      outline: none;
      border-color: var(--don-brand-primary, #3B82F6);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    &.dragging {
      border-color: var(--don-brand-primary, #3B82F6);
      background-color: rgba(59, 130, 246, 0.05);
      transform: scale(1.02);
    }

    &.has-preview {
      border-style: solid;
      border-color: var(--don-color-border-input, #E5E7EB);
      background-color: transparent;

      &:hover {
        border-color: var(--don-brand-primary, #3B82F6);
      }
    }

    &.has-error {
      border-color: var(--don-color-error, #DC2626);
      background-color: var(--don-color-error-light, #FEF2F2);
    }

    &.loading {
      pointer-events: none;
      opacity: 0.7;
    }
  }

  .logo-upload__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--don-spacing-xs, 4px);
    padding: var(--don-spacing-sm, 8px);
    text-align: center;
  }

  .logo-upload__icon {
    opacity: 0.5;
    transition: opacity 200ms ease;

    .logo-upload__zone:hover & {
      opacity: 0.8;
    }
  }

  .logo-upload__text {
    font-size: var(--don-font-size-xs, 11px);
    font-weight: var(--don-font-weight-medium, 500);
    color: var(--don-color-text-secondary, #6B7280);
  }

  .logo-upload__hint {
    font-size: 9px;
    color: var(--don-color-text-muted, #9CA3AF);
  }

  .logo-upload__preview {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .logo-upload__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: calc(var(--don-radius-lg, 12px) - 2px);
  }

  .logo-upload__remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: none;
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 150ms ease, background-color 150ms ease;

    .logo-upload__zone:hover &,
    .logo-upload__zone:focus-visible & {
      opacity: 1;
    }

    &:hover {
      background-color: var(--don-color-error, #DC2626);
    }

    &:focus-visible {
      opacity: 1;
      outline: 2px solid white;
    }
  }

  .logo-upload__loader {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-upload__spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--don-color-border-input, #E5E7EB);
    border-top-color: var(--don-brand-primary, #3B82F6);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .logo-upload__input {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .logo-upload__error {
    font-size: var(--don-font-size-sm, 12px);
    color: var(--don-color-error, #DC2626);
    display: flex;
    align-items: center;
    gap: var(--don-spacing-xs, 4px);
    animation: fadeIn 150ms ease-out;

    &::before {
      content: "⚠";
      font-size: 10px;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-4px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  // Reduced motion
  @media (prefers-reduced-motion: reduce) {
    .logo-upload__zone {
      transition: none;
    }

    .logo-upload__spinner {
      animation: none;
    }

    .logo-upload__error {
      animation: none;
    }
  }
</style>
