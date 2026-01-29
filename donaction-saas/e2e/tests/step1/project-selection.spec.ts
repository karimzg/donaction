import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Step1Page } from '../../pages/Step1Page';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectsList = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../fixtures/projects/projects-list.json'), 'utf-8')
);
const emptyProjects = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../fixtures/projects/empty-projects.json'), 'utf-8')
);

test.describe('Step 1 — Project Selection', () => {
  let step1: Step1Page;

  test('2.1 — Should show club donation without projects', async ({ page }) => {
    step1 = new Step1Page(page);
    await step1.navigate({ projects: emptyProjects, skipAutoProjectSelect: true });
    await step1.waitForStep(0);
    // No project selection should be visible, go straight to amount
    await expect(step1.projectSelection).not.toBeVisible();
  });

  test('2.2 — Should display project carousel when projects available', async ({ page }) => {
    step1 = new Step1Page(page);
    await step1.navigate({ projects: projectsList, skipAutoProjectSelect: true });
    await step1.waitForStep(0);
    await expect(step1.projectSelection).toBeVisible();
  });

  test('2.3 — Should select a project via carousel', async ({ page }) => {
    step1 = new Step1Page(page);
    await step1.navigate({ projects: projectsList, skipAutoProjectSelect: true });
    await step1.waitForStep(0);
    // Click first project slide
    const firstSlide = step1.shadow('swiper-slide').first();
    await firstSlide.click();
    await step1.btnSelectProject.click();
    // Should now show amount selection
    await expect(step1.shadow('.don-step1__header, .don-step1__project-highlight')).toBeVisible();
  });

  test('2.4 — Should skip project selection when projectUuid prop is set', async ({ page }) => {
    step1 = new Step1Page(page);
    // When project is returned from decrypt, allowProjectSelection is false
    await step1.navigate({
      klubrConfig: {
        project: {
          uuid: 'test-project-uuid',
          titre: 'Projet Test',
          couverture: { url: 'https://via.placeholder.com/300', alternativeText: 'test' },
          status: 'published',
        },
      },
      skipAutoProjectSelect: true,
    });
    await step1.waitForStep(0);
    // Project selection carousel should NOT be shown
    await expect(step1.projectSelection).not.toBeVisible();
    // Project highlight should be shown
    await expect(step1.shadow('.don-step1__project-highlight')).toBeVisible();
  });
});
