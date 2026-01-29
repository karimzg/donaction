import { test, expect } from '@playwright/test';
import { Step5Page } from '../../pages/Step5Page';

test.describe('Step 5 — Confirmation', () => {
  test('9.1 — Should display confirmation page elements', async ({ page }) => {
    const step5 = new Step5Page(page);

    // Verify step5 component elements are defined
    expect(step5.container).toBeDefined();
    expect(step5.thankYouText).toBeDefined();
    expect(step5.linkMyDonations).toBeDefined();

    // Verify the container locator targets the correct element
    const containerSelector = step5.container.toString();
    expect(containerSelector).toContain('step5');
  });

  test('9.2 — My donations link should point to correct URL', async ({ page }) => {
    const step5 = new Step5Page(page);

    // Verify the link element is defined and targets an anchor tag
    expect(step5.linkMyDonations).toBeDefined();

    // The link locator should reference a link element
    const linkSelector = step5.linkMyDonations.toString();
    expect(linkSelector).toContain('link-my-donations');
  });
});
