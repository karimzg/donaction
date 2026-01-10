import { test as setup } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

const TEST_USER = {
  email: 'dev@nakaa.fr',
  password: 'Popopo31@',
};

const FRONTEND_URL = 'http://localhost:3100';

setup('authenticate', async ({ page }) => {
  // Go to frontend login page
  await page.goto(`${FRONTEND_URL}/connexion`);
  await page.waitForLoadState('networkidle');

  // Enter email
  await page.getByRole('textbox', { name: 'Adresse E-mail' }).fill(TEST_USER.email);
  await page.getByRole('button', { name: 'Se connecter/Créer un compte' }).click();

  // Wait for password field and enter password
  await page.getByRole('textbox', { name: 'Mot de passe' }).waitFor();
  await page.getByRole('textbox', { name: 'Mot de passe' }).fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Se connecter' }).click();

  // Wait for page to reload and stabilize after login
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Navigate to a page to ensure we're logged in, then fetch session
  await page.goto(`${FRONTEND_URL}/`);
  await page.waitForLoadState('networkidle');

  // Fetch session to get token
  const sessionResponse = await page.evaluate(async () => {
    const res = await fetch('/api/auth/session');
    return res.json();
  });

  const capturedToken = sessionResponse?.token;

  if (!capturedToken) {
    console.error('Session response:', sessionResponse);
    throw new Error('Failed to capture JWT token from session');
  }

  // Save token
  const authData = { token: capturedToken };

  // Ensure directory exists
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  fs.writeFileSync(AUTH_FILE, JSON.stringify(authData, null, 2));

  console.log('Auth setup complete. Token captured.');
});
