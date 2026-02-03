import type { Page, Locator } from '@playwright/test';

/**
 * Use Playwright's piercing locator syntax (>>>) to traverse shadow DOM
 * Shadow DOM is automatically pierced by Playwright in modern versions
 */
export function piercingLocator(page: Page, selector: string): Locator {
  return page.locator(selector);
}

/**
 * Get the main klubr-sponsorship-form component
 */
export function getFormComponent(page: Page): Locator {
  return piercingLocator(page, 'klubr-sponsorship-form');
}

/**
 * Wait for specific form step to be visible
 *
 * Step mappings:
 * - step1: .don-step1
 * - step2: .don-step2
 * - step3: .don-step3
 * - step4: Payment form (contains Stripe Payment Element)
 * - step5: Confirmation/completion (class step5)
 */
export async function waitForStep(page: Page, stepIndex: number): Promise<void> {
  let selector: string;

  switch (stepIndex) {
    case 1:
      selector = 'klubr-sponsorship-form >>> .don-step1';
      break;
    case 2:
      selector = 'klubr-sponsorship-form >>> .don-step2';
      break;
    case 3:
      selector = 'klubr-sponsorship-form >>> .don-step3';
      break;
    case 4:
      // Step 4 contains payment form
      selector = 'klubr-sponsorship-form >>> form[data-testid="payment-form"]';
      break;
    case 5:
      selector = 'klubr-sponsorship-form >>> .step5';
      break;
    default:
      throw new Error(`Invalid step index: ${stepIndex}. Expected 1-5`);
  }

  await page.locator(selector).waitFor({ state: 'visible', timeout: 10000 });
}

/**
 * Get a specific form field by its name or data-testid
 */
export function getFormField(
  page: Page,
  fieldName: string,
  searchBy: 'name' | 'testid' = 'name'
): Locator {
  const selector =
    searchBy === 'testid'
      ? `klubr-sponsorship-form >>> [data-testid="${fieldName}"]`
      : `klubr-sponsorship-form >>> input[name="${fieldName}"], klubr-sponsorship-form >>> select[name="${fieldName}"], klubr-sponsorship-form >>> textarea[name="${fieldName}"]`;

  return piercingLocator(page, selector);
}

/**
 * Get a form button by its text content
 */
export function getFormButton(page: Page, buttonText: string): Locator {
  return piercingLocator(
    page,
    `klubr-sponsorship-form >>> button:has-text("${buttonText}")`
  );
}

/**
 * Get a form button by its type (e.g., "submit", "button", "reset")
 */
export function getFormButtonByType(page: Page, type: string): Locator {
  return piercingLocator(page, `klubr-sponsorship-form >>> button[type="${type}"]`);
}

/**
 * Get error message displayed for a specific field
 */
export function getFieldError(page: Page, fieldName: string): Locator {
  return piercingLocator(
    page,
    `klubr-sponsorship-form >>> [data-field="${fieldName}"] + .error, klubr-sponsorship-form >>> .error[data-field="${fieldName}"]`
  );
}

/**
 * Get success message after donation completes
 */
export function getSuccessMessage(page: Page): Locator {
  return piercingLocator(page, 'klubr-sponsorship-form >>> .success-message');
}

/**
 * Get any visible error message in the form
 */
export function getFirstVisibleError(page: Page): Locator {
  return piercingLocator(page, 'klubr-sponsorship-form >>> .error:visible');
}

/**
 * Check if a specific step is currently visible
 */
export async function isStepVisible(page: Page, stepIndex: number): Promise<boolean> {
  try {
    await waitForStep(page, stepIndex);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current visible step number
 * Returns 0 if no recognizable step is visible
 */
export async function getCurrentStep(page: Page): Promise<number> {
  for (let step = 1; step <= 5; step++) {
    if (await isStepVisible(page, step)) {
      return step;
    }
  }
  return 0;
}

/**
 * Get all visible fields in current step
 */
export function getVisibleFields(page: Page): Locator {
  return piercingLocator(
    page,
    'klubr-sponsorship-form >>> input:visible, klubr-sponsorship-form >>> select:visible, klubr-sponsorship-form >>> textarea:visible'
  );
}

/**
 * Get the form's main container
 */
export function getFormContainer(page: Page): Locator {
  return piercingLocator(page, 'klubr-sponsorship-form >>> .form-container');
}

/**
 * Get progress indicator/stepper element
 */
export function getProgressIndicator(page: Page): Locator {
  return piercingLocator(page, 'klubr-sponsorship-form >>> .progress-stepper');
}

/**
 * Wait for form to be fully loaded (component initialized)
 */
export async function waitForFormReady(page: Page): Promise<void> {
  await getFormComponent(page).waitFor({ state: 'attached', timeout: 10000 });
  // Wait a bit for initial render and step 1 to appear
  await waitForStep(page, 1);
}
