import type { Page, Route } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MockOptions {
  // Original keys (kept for backward compatibility)
  decryptConfig?: Record<string, any>;
  projectsData?: Record<string, any>;
  donResponse?: Record<string, any>;
  donatorResponse?: Record<string, any>;
  paymentIntentResponse?: Record<string, any>;
  paymentCheckResponse?: Record<string, any>;
  cguResponse?: Record<string, any>;
  // Friendly aliases used by specs
  klubrConfig?: string | Record<string, any>;
  projects?: string | Record<string, any>;
  apiError?: boolean;
  invalidToken?: boolean;
  paymentIntent?: Record<string, any>;
}

export class ApiMocker {
  private page: Page;
  private fixturesPath = path.join(__dirname, '../fixtures');

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Setup all API route mocks at once
   */
  async setupAllMocks(options: MockOptions = {}) {
    // Handle apiError - mock decrypt to return 500
    if (options.apiError) {
      await this.mockDecryptError();
      return;
    }

    // Handle invalidToken - mock decrypt to return 401
    if (options.invalidToken) {
      await this.mockDecryptInvalidToken();
      return;
    }

    // Resolve klubrConfig → decryptConfig
    const decryptConfig = this.resolveDecryptConfig(options);

    // Resolve projects → projectsData
    const projectsData = this.resolveProjectsData(options);

    // Resolve paymentIntent → paymentIntentResponse
    const paymentIntentResponse = options.paymentIntent || options.paymentIntentResponse;

    await this.mockDecrypt(decryptConfig);
    await this.mockProjects(projectsData);
    await this.mockCreateDon();
    await this.mockCreateDonateur();
    await this.mockUploadLogo();
    await this.mockCreatePaymentIntent(paymentIntentResponse);
    await this.mockCheckPayment(options.paymentCheckResponse);
    await this.mockCreatePayment();
    await this.mockCgu(options.cguResponse);
  }

  /**
   * Mock POST /api/klubr-subscriptions/decrypt
   */
  async mockDecrypt(config?: Record<string, any>) {
    const defaultConfig = this.loadFixture('klubr-configs/standard.json');
    const responseConfig = config || defaultConfig;

    await this.page.route('**/api/klubr-subscriptions/decrypt', async (route: Route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify(responseConfig),
        contentType: 'application/json',
      });
    });
  }

  /**
   * Mock GET /api/klub-projets/byKlub/*
   */
  async mockProjects(data?: Record<string, any>) {
    const defaultData = {
      data: [
        {
          id: 1,
          documentId: 'proj_test_001',
          uuid: '550e8400-e29b-41d4-a716-446655440201',
          titre: 'Project 1',
          description: 'Test project 1',
          status: 'published',
        },
        {
          id: 2,
          documentId: 'proj_test_002',
          uuid: '550e8400-e29b-41d4-a716-446655440202',
          titre: 'Project 2',
          description: 'Test project 2',
          status: 'published',
        },
      ],
      meta: { pagination: { page: 1, pageSize: 20, pageCount: 1, total: 2 } },
    };

    const responseData = data || defaultData;

    await this.page.route('**/api/klub-projets/byKlub/**', async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(responseData),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock POST /api/klub-dons
   */
  async mockCreateDon() {
    const defaultResponse = {
      data: {
        id: 1,
        documentId: 'don_test_001',
        uuid: 'test-don-uuid',
        statusPaiment: 'pending',
        montant: 100,
        attestationNumber: null,
        contributionAKlubr: 0,
        datePaiment: new Date().toISOString(),
        deductionFiscale: 0,
        estOrganisme: false,
        withTaxReduction: false,
      },
    };

    await this.page.route('**/api/klub-dons/', async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock PUT /api/klub-dons/:uuid
   */
  async mockUpdateDon() {
    const defaultResponse = {
      data: {
        id: 1,
        documentId: 'don_test_001',
        uuid: 'test-don-uuid',
        statusPaiment: 'completed',
        montant: 100,
        attestationNumber: 'ATT-2024-001',
        contributionAKlubr: 4,
        datePaiment: new Date().toISOString(),
        deductionFiscale: 66,
        estOrganisme: false,
        withTaxReduction: true,
      },
    };

    await this.page.route('**/api/klub-dons/*', async (route: Route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock POST /api/klubr-donateurs
   */
  async mockCreateDonateur() {
    const defaultResponse = {
      data: {
        id: 1,
        documentId: 'donateur_test_001',
        uuid: 'test-donateur-uuid',
        email: 'test@e2e.com',
        firstName: 'Test',
        lastName: 'Donor',
        civility: 'Monsieur',
        telephone: '+33612345678',
        estOrganisme: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await this.page.route('**/api/klubr-donateurs/', async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock PUT /api/klubr-donateurs/:uuid
   */
  async mockUpdateDonateur() {
    const defaultResponse = {
      data: {
        id: 1,
        documentId: 'donateur_test_001',
        uuid: 'test-donateur-uuid',
        email: 'updated@e2e.com',
        firstName: 'Test',
        lastName: 'Donor',
        civility: 'Monsieur',
        telephone: '+33612345678',
        estOrganisme: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await this.page.route('**/api/klubr-donateurs/*', async (route: Route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock POST /api/medias/klubr-donateur/:uuid/files (logo upload)
   */
  async mockUploadLogo() {
    const defaultResponse = {
      data: {
        id: 1,
        documentId: 'media_test_001',
        url: '/uploads/donor-logo-test.png',
        width: 200,
        height: 200,
        alternativeText: 'Donor Logo',
      },
    };

    await this.page.route('**/api/medias/klubr-donateur/*/files', async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock POST /api/klub-don-payments/create-payment-intent
   */
  async mockCreatePaymentIntent(response?: Record<string, any>) {
    const defaultResponse = response || {
      data: {
        intent: 'pi_test_payment_intent_123456',
        reused: false,
        clientSecret: 'pi_test_payment_intent_123456_secret_abcdef123456',
      },
    };

    await this.page.route('**/api/klub-don-payments/create-payment-intent', async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock GET /api/klub-don-payments/check?clientSecret=*&donUuid=*
   */
  async mockCheckPayment(response?: Record<string, any>) {
    const defaultResponse = response || {
      data: {
        status: 'succeeded',
        statusPaiment: 'success',
        montant: 100,
        uuid: 'test-don-uuid',
      },
    };

    await this.page.route('**/api/klub-don-payments/check**', async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock POST /api/klub-don-payments
   */
  async mockCreatePayment() {
    const defaultResponse = {
      data: {
        id: 1,
        documentId: 'payment_test_001',
        uuid: 'test-payment-uuid',
        statusPaiment: 'success',
        montant: 100,
        stripePaymentId: 'pi_test_payment_intent_123456',
        createdAt: new Date().toISOString(),
      },
    };

    await this.page.route('**/api/klub-don-payments', async (route: Route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Mock GET /api/cgu (Terms and conditions)
   */
  async mockCgu(response?: Record<string, any>) {
    const defaultResponse = response || {
      data: {
        id: 1,
        documentId: 'cgu_001',
        titre: 'Conditions Générales d\'Utilisation',
        content: [
          {
            type: 'paragraph',
            children: [
              {
                text: 'Conditions générales de donaction. À lire attentivement avant toute utilisation.',
              },
            ],
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };

    await this.page.route('**/api/cgu', async (route: Route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          body: JSON.stringify(defaultResponse),
          contentType: 'application/json',
        });
      }
    });
  }

  /**
   * Load fixture file from fixtures directory
   */
  private loadFixture(fixturePath: string): Record<string, any> {
    try {
      const fullPath = path.join(this.fixturesPath, fixturePath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load fixture: ${fixturePath}`, error);
      return {};
    }
  }

  /**
   * Resolve klubrConfig to a decrypt config object
   * Supports: string fixture name, partial object (merged with standard), or full object
   */
  private resolveDecryptConfig(options: MockOptions): Record<string, any> | undefined {
    const klubrConfig = options.klubrConfig ?? options.decryptConfig;
    if (!klubrConfig) return undefined;

    if (typeof klubrConfig === 'string') {
      // Map known fixture names
      const fixtureMap: Record<string, string> = {
        'custom-commission-6percent': 'klubr-configs/custom-commission.json',
      };
      const fixturePath = fixtureMap[klubrConfig] || `klubr-configs/${klubrConfig}.json`;
      return this.loadFixture(fixturePath);
    }

    // If it's an object with partial data (e.g., { project: {...} }), merge with standard
    const standard = this.loadFixture('klubr-configs/standard.json');
    return { ...standard, ...klubrConfig };
  }

  /**
   * Resolve projects option to projects data
   * Supports: string fixture name, object data, or undefined (use default)
   */
  private resolveProjectsData(options: MockOptions): Record<string, any> | undefined {
    const projects = options.projects ?? options.projectsData;
    if (!projects) return undefined;

    if (typeof projects === 'string') {
      // Map known project fixture names
      const fixtureMap: Record<string, string> = {
        'with-projects': 'projects/projects-list.json',
        'empty': 'projects/empty-projects.json',
      };
      const fixturePath = fixtureMap[projects] || `projects/${projects}.json`;
      return this.loadFixture(fixturePath);
    }

    return projects as Record<string, any>;
  }

  /**
   * Mock decrypt with server error (500)
   */
  async mockDecryptError() {
    await this.page.route('**/api/klubr-subscriptions/decrypt', async (route: Route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
        contentType: 'application/json',
      });
    });
  }

  /**
   * Mock decrypt with invalid token (401)
   */
  async mockDecryptInvalidToken() {
    await this.page.route('**/api/klubr-subscriptions/decrypt', async (route: Route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ error: 'Invalid token' }),
        contentType: 'application/json',
      });
    });
  }
}
