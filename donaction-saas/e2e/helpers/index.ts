/**
 * E2E Test Helpers Index
 *
 * Central export point for all E2E testing utilities
 */

// API Mocking
export { ApiMocker } from './api-mocker';

// Shadow DOM Utilities
export {
  piercingLocator,
  getFormComponent,
  waitForStep,
  getFormField,
  getFormButton,
  getFormButtonByType,
  getFieldError,
  getSuccessMessage,
  getFirstVisibleError,
  isStepVisible,
  getCurrentStep,
  getVisibleFields,
  getFormContainer,
  getProgressIndicator,
  waitForFormReady,
} from './shadow-dom';

// Stripe Payment Helpers
export {
  STRIPE_TEST_CARDS,
  getStripeFrame,
  getCardNumberFrame,
  getExpiryFrame,
  getCvcFrame,
  fillStripeCard,
  fillCardNumber,
  fillExpiry,
  fillCvc,
  waitForStripeElement,
  waitForStripeFrame,
  getCardBehavior,
  focusCardNumber,
  getStripeError,
  clearStripeCard,
} from './stripe-helpers';

// reCAPTCHA Mocking
export {
  mockRecaptcha,
  mockRecaptchaWithToken,
  mockRecaptchaFailure,
  mockRecaptchaWithHistory,
  getRecaptchaHistory,
  verifyRecaptchaAction,
  clearRecaptchaHistory,
  getLastRecaptchaToken,
  waitForRecaptchaCall,
} from './recaptcha-mock';

// Google Maps Mocking
export {
  mockGoogleMaps,
  triggerPlaceSelection,
  setMockPlace,
  getMockPlace,
  mockGoogleMapsPredictions,
  mockGoogleMapsError,
  verifyMockPlace,
  waitForGoogleMapsAPI,
  clearMockPlace,
  DEFAULT_MOCK_PLACE,
  type MockPlaceDetails,
} from './google-maps-mock';

// Test Data Factory
export {
  generateParticulier,
  generateEntreprise,
  generateAmount,
  generatePostalCode,
  generatePhoneNumber,
  generateCity,
  generateAddress,
  generateEmail,
  generateCompanyName,
  generateSiren,
  generateSiret,
  generateLegalForm,
  generateBirthdate,
  generateCivility,
  generateFirstName,
  generateLastName,
  generateDonation,
  generateCompleteDonationPackage,
  generateUuid,
  generateDocumentId,
  generateBulkDonors,
  seedFaker,
  resetFaker,
  type ParticulierData,
  type EntrepriseData,
  type DonationData,
} from './test-data-factory';
