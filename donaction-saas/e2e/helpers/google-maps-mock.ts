import type { Page } from '@playwright/test';

/**
 * Mock address details returned by Google Places Service
 */
export interface MockPlaceDetails {
  formatted_address: string;
  name: string;
  place_id?: string;
  geometry?: {
    location: { lat: number; lng: number };
  };
  address_components?: Array<{
    types: string[];
    long_name: string;
    short_name?: string;
  }>;
}

/**
 * Default mock place details for testing
 */
export const DEFAULT_MOCK_PLACE: MockPlaceDetails = {
  formatted_address: '8 Rue Victor Hugo, 59000 Lille, France',
  name: '8 Rue Victor Hugo',
  place_id: 'mock-place-id-lille',
  geometry: {
    location: { lat: 50.6292, lng: 3.0573 }, // Lille, France coordinates
  },
  address_components: [
    { types: ['street_number'], long_name: '8' },
    { types: ['route'], long_name: 'Rue Victor Hugo' },
    { types: ['locality'], long_name: 'Lille' },
    { types: ['administrative_area_level_2'], long_name: 'Nord' },
    { types: ['administrative_area_level_1'], long_name: 'Hauts-de-France' },
    { types: ['country'], long_name: 'France', short_name: 'FR' },
    { types: ['postal_code'], long_name: '59000' },
  ],
};

/**
 * Mock Google Maps API on the page
 * Injects google.maps.places with mocked Autocomplete and PlacesService
 *
 * @param page The Playwright Page object
 * @param customPlace Optional custom place details to return
 */
export async function mockGoogleMaps(
  page: Page,
  customPlace?: Partial<MockPlaceDetails>
): Promise<void> {
  const place = { ...DEFAULT_MOCK_PLACE, ...(customPlace || {}) };

  // Block real Google Maps API so the mock is not overwritten
  await page.route('**/maps.googleapis.com/**', (route) => route.abort());

  await page.addInitScript((mockPlace: MockPlaceDetails) => {
    // Store the place handler for manual triggering in tests
    (window as any).__gmapsPlaceHandler = null;
    (window as any).__gmapsSelectedPlace = null;

    (window as any).google = {
      maps: {
        places: {
          /**
           * Mock Autocomplete class
           * Simulates Google Places Autocomplete behavior
           */
          Autocomplete: class {
            private listeners: Record<string, Array<() => void>> = {};

            constructor(public inputElement?: HTMLInputElement) {
              // Constructor can be called with optional input element
            }

            addListener(event: string, handler: () => void) {
              if (!this.listeners[event]) {
                this.listeners[event] = [];
              }
              this.listeners[event].push(handler);

              // Store the handler globally for manual triggering in tests
              if (event === 'place_changed') {
                (window as any).__gmapsPlaceHandler = () => {
                  this.listeners[event].forEach((h) => h());
                };
              }
            }

            getPlace() {
              return (window as any).__gmapsSelectedPlace || mockPlace;
            }

            /**
             * Trigger listeners manually (for testing)
             */
            private triggerListeners(event: string) {
              if (this.listeners[event]) {
                this.listeners[event].forEach((handler) => handler());
              }
            }
          },

          /**
           * Mock PlacesService class
           * Simulates Google Places service for place details requests
           */
          PlacesService: class {
            constructor(private mapElement?: HTMLElement) {
              // Constructor can be called with optional map element
            }

            getDetails(
              request: { placeId?: string; fields?: string[] },
              callback: (place: MockPlaceDetails | null, status: string) => void
            ) {
              // Simulate async API call
              setTimeout(() => {
                if (request.placeId === mockPlace.place_id) {
                  callback(mockPlace, 'OK');
                } else {
                  // Return the default mock place for any other request
                  callback(mockPlace, 'OK');
                }
              }, 100);
            }

            getPlacePredictions(
              request: { input: string },
              callback: (predictions: any[] | null, status: string) => void
            ) {
              // Mock predictions based on input
              const predictions = [
                {
                  place_id: mockPlace.place_id,
                  description: mockPlace.formatted_address,
                  main_text: mockPlace.name,
                  secondary_text: 'Lille, France',
                },
              ];

              setTimeout(() => {
                callback(predictions, 'OK');
              }, 100);
            }
          },

          /**
           * Mock PlacesServiceStatus enum
           */
          PlacesServiceStatus: {
            OK: 'OK',
            ZERO_RESULTS: 'ZERO_RESULTS',
            INVALID_REQUEST: 'INVALID_REQUEST',
            OVER_QUERY_LIMIT: 'OVER_QUERY_LIMIT',
            REQUEST_DENIED: 'REQUEST_DENIED',
            UNKNOWN_ERROR: 'UNKNOWN_ERROR',
            NOT_FOUND: 'NOT_FOUND',
          },
        },
      },
    };
  }, place);
}

/**
 * Trigger place selection in the Google Maps mock
 * Calls any registered 'place_changed' event handlers
 *
 * @param page The Playwright Page object
 */
export async function triggerPlaceSelection(page: Page): Promise<void> {
  await page.evaluate(() => {
    if ((window as any).__gmapsPlaceHandler) {
      (window as any).__gmapsPlaceHandler();
    }
  });
}

/**
 * Set a custom place to be returned by the mock
 * Updates __gmapsSelectedPlace so getPlace() returns this value
 *
 * @param page The Playwright Page object
 * @param place The custom place to return
 */
export async function setMockPlace(page: Page, place: Partial<MockPlaceDetails>): Promise<void> {
  await page.evaluate((newPlace: Partial<MockPlaceDetails>) => {
    (window as any).__gmapsSelectedPlace = {
      ...DEFAULT_MOCK_PLACE,
      ...newPlace,
    };
  }, place);
}

/**
 * Get the currently selected place from the mock
 *
 * @param page The Playwright Page object
 * @returns The mock place details
 */
export async function getMockPlace(page: Page): Promise<MockPlaceDetails> {
  const place = await page.evaluate(() => {
    return (window as any).__gmapsSelectedPlace || DEFAULT_MOCK_PLACE;
  });
  return place;
}

/**
 * Mock Google Maps to return multiple place predictions
 * Useful for testing autocomplete suggestion lists
 *
 * @param page The Playwright Page object
 * @param predictions Array of place predictions
 */
export async function mockGoogleMapsPredictions(
  page: Page,
  predictions: Array<{ place_id: string; description: string }>
): Promise<void> {
  await page.addInitScript(
    (preds: Array<{ place_id: string; description: string }>) => {
      (window as any).__gmapsPredictions = preds;

      (window as any).google = {
        maps: {
          places: {
            Autocomplete: class {
              addListener() {}
              getPlace() {
                return { place_id: preds[0]?.place_id };
              }
            },

            PlacesService: class {
              getPlacePredictions(
                request: { input: string },
                callback: (predictions: any[] | null, status: string) => void
              ) {
                setTimeout(() => {
                  callback(preds, 'OK');
                }, 100);
              }

              getDetails(
                request: { placeId?: string },
                callback: (place: MockPlaceDetails | null, status: string) => void
              ) {
                const place = preds.find((p) => p.place_id === request.placeId);
                callback(
                  place
                    ? {
                        place_id: place.place_id,
                        formatted_address: place.description,
                        name: place.description,
                      }
                    : null,
                  place ? 'OK' : 'NOT_FOUND'
                );
              }
            },

            PlacesServiceStatus: { OK: 'OK' },
          },
        },
      };
    },
    predictions
  );
}

/**
 * Mock Google Maps to fail with a specific error status
 * Useful for testing error handling
 *
 * @param page The Playwright Page object
 * @param status The error status to return (e.g., 'ZERO_RESULTS', 'REQUEST_DENIED')
 */
export async function mockGoogleMapsError(page: Page, status: string = 'REQUEST_DENIED'): Promise<void> {
  await page.addInitScript((errorStatus: string) => {
    (window as any).google = {
      maps: {
        places: {
          Autocomplete: class {
            addListener() {}
            getPlace() {
              return null;
            }
          },

          PlacesService: class {
            getDetails(
              request: any,
              callback: (place: null, status: string) => void
            ) {
              setTimeout(() => {
                callback(null, errorStatus);
              }, 100);
            }

            getPlacePredictions(
              request: any,
              callback: (predictions: null, status: string) => void
            ) {
              setTimeout(() => {
                callback(null, errorStatus);
              }, 100);
            }
          },

          PlacesServiceStatus: { OK: 'OK', REQUEST_DENIED: 'REQUEST_DENIED' },
        },
      },
    };
  }, status);
}

/**
 * Verify that a place was selected in the mock
 *
 * @param page The Playwright Page object
 * @param expectedAddress The expected address to verify
 * @returns True if the selected place matches the expected address
 */
export async function verifyMockPlace(page: Page, expectedAddress: string): Promise<boolean> {
  const place = await getMockPlace(page);
  return place.formatted_address === expectedAddress;
}

/**
 * Wait for Google Maps API to be available on the page
 *
 * @param page The Playwright Page object
 * @param timeout Maximum time to wait in milliseconds
 */
export async function waitForGoogleMapsAPI(page: Page, timeout: number = 5000): Promise<void> {
  await page.waitForFunction(
    () => (window as any).google?.maps?.places,
    { timeout }
  );
}

/**
 * Clear the mock place selection
 *
 * @param page The Playwright Page object
 */
export async function clearMockPlace(page: Page): Promise<void> {
  await page.evaluate(() => {
    (window as any).__gmapsSelectedPlace = null;
  });
}
