import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

// Load auth data before tests
let authToken: string;

test.beforeAll(() => {
  const authData = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
  authToken = authData.token;
  if (!authToken) {
    throw new Error('No auth token found. Run setup first.');
  }
});

test.describe('Member Invitation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the session API to return our captured token
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ token: authToken }),
      });
    });

    // Navigate to admin dashboard
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for dashboard to load (check for a known element)
    await page.waitForSelector('text=Mon Klub', { timeout: 10000 });
  });

  test('should send invitation email and show success toaster', async ({ page }) => {
    const inviteeEmail = 'k.zgoulli@gmail.com';

    // Open invitation modal
    await page.getByRole('button', { name: "Envoyer l'invitation" }).click();

    // Verify modal is open
    const modal = page.getByRole('dialog', { name: 'Inviter de nouveaux membres à rejoindre mon équipe' });
    await expect(modal).toBeVisible();

    // Fill email in "Ou par mail" section
    await page.getByRole('textbox', { name: 'Adresse e-mail' }).fill(inviteeEmail);

    // Click the invite button (second one, for email invitation)
    await page.getByRole('button', { name: 'Inviter' }).nth(1).click();

    // Verify success toaster appears
    const toaster = page.getByRole('alert');
    await expect(toaster).toBeVisible();
    await expect(toaster).toContainText('Invitation envoyée');
    await expect(toaster).toContainText("L'invitation a bien été envoyée");
  });

  test('should display invitation code in modal', async ({ page }) => {
    // Open invitation modal
    await page.getByRole('button', { name: "Envoyer l'invitation" }).click();

    // Verify invitation code section is visible
    await expect(page.getByRole('heading', { name: 'Votre code invitation :' })).toBeVisible();

    // Verify invitation link is displayed
    await expect(page.getByRole('heading', { name: /localhost:3100\/s\// })).toBeVisible();
  });

  test('should copy invitation code to clipboard when clicking copy button', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    // Open invitation modal
    await page.getByRole('button', { name: "Envoyer l'invitation" }).click();

    // Wait for modal
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Get the displayed invitation code (span.font-medium next to "Votre code invitation")
    const codeSection = modal.locator('text=Votre code invitation').locator('..');
    const codeElement = codeSection.locator('span.font-medium');
    await expect(codeElement).toBeVisible();
    const displayedCode = await codeElement.textContent();

    // Click the first copy icon (pi-clone) in the code section
    const copyButton = codeSection.locator('.pi-clone').first();
    await copyButton.click();

    // Verify toaster appears with copy confirmation
    const toaster = page.getByRole('alert');
    await expect(toaster).toBeVisible();
    await expect(toaster).toContainText('Copié');
    await expect(toaster).toContainText('Lien copié dans le presse-papier');

    // Verify clipboard content matches displayed code
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toBe(displayedCode?.trim());
  });

  test('should allow role selection before invitation', async ({ page }) => {
    // Verify role selection buttons exist
    const dirigeantButton = page.getByRole('button', { name: 'Dirigeant' });
    const membreButton = page.getByRole('button', { name: 'Membre' });

    await expect(dirigeantButton).toBeVisible();
    await expect(membreButton).toBeVisible();

    // Select "Dirigeant" role
    await dirigeantButton.click();

    // Open invitation modal
    await page.getByRole('button', { name: "Envoyer l'invitation" }).click();

    // Verify modal opens
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
  });
});
