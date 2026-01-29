import { faker } from '@faker-js/faker/locale/fr_FR';

/**
 * Test data factory for generating realistic French test data
 * Uses @faker-js/faker with French locale for localized data
 */

/**
 * Particulier (Individual) donor data
 */
export interface ParticulierData {
  email: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  tel: string;
  civility: 'Monsieur' | 'Madame';
  address?: string;
  postalCode?: string;
  city?: string;
}

/**
 * Entreprise (Company) donor data
 */
export interface EntrepriseData extends ParticulierData {
  socialReason: string;
  siren: string;
  legalForm: 'SARL' | 'SAS' | 'SA' | 'EURL' | 'Association' | 'SCOP' | 'SPRL';
}

/**
 * Donation data
 */
export interface DonationData {
  amount: number;
  withTaxReduction: boolean;
  donatorType: 'particulier' | 'entreprise';
  projectUuid?: string;
}

/**
 * Generate random individual (particulier) donor data
 *
 * @param overrides Optional field overrides
 * @returns ParticulierData object
 */
export function generateParticulier(overrides?: Partial<ParticulierData>): ParticulierData {
  const civility = faker.helpers.arrayElement(['Monsieur', 'Madame'] as const);

  return {
    civility,
    email: faker.internet.email(),
    firstName: faker.person.firstName(civility === 'Monsieur' ? 'male' : 'female'),
    lastName: faker.person.lastName(),
    birthdate: faker.date.birthdate({ min: 18, max: 100, mode: 'age' }).toISOString().split('T')[0],
    tel: faker.phone.number({ style: 'international' }),
    address: `${faker.location.buildingNumber()} ${faker.location.streetName()}`,
    postalCode: faker.location.zipCode('####0'),
    city: faker.location.city(),
    ...overrides,
  };
}

/**
 * Generate random company (entreprise) donor data
 *
 * @param overrides Optional field overrides
 * @returns EntrepriseData object
 */
export function generateEntreprise(overrides?: Partial<EntrepriseData>): EntrepriseData {
  const civility = faker.helpers.arrayElement(['Monsieur', 'Madame'] as const);

  return {
    civility,
    email: faker.internet.email(),
    firstName: faker.person.firstName(civility === 'Monsieur' ? 'male' : 'female'),
    lastName: faker.person.lastName(),
    birthdate: faker.date.birthdate({ min: 18, max: 100, mode: 'age' }).toISOString().split('T')[0],
    tel: faker.phone.number({ style: 'international' }),
    address: `${faker.location.buildingNumber()} ${faker.location.streetName()}`,
    postalCode: faker.location.zipCode('####0'),
    city: faker.location.city(),
    socialReason: faker.company.name(),
    siren: faker.string.numeric(9),
    legalForm: faker.helpers.arrayElement([
      'SARL',
      'SAS',
      'SA',
      'EURL',
      'Association',
      'SCOP',
      'SPRL',
    ] as const),
    ...overrides,
  };
}

/**
 * Generate random donation amount from common test values
 * Returns common donation amounts used in testing
 *
 * @returns Donation amount in euros
 */
export function generateAmount(): number {
  return faker.helpers.arrayElement([10, 20, 50, 100, 250, 500, 1000, 5000]);
}

/**
 * Generate realistic postal code (French format: 5 digits)
 *
 * @returns French postal code
 */
export function generatePostalCode(): string {
  return faker.location.zipCode('####0');
}

/**
 * Generate realistic phone number (French format)
 *
 * @returns French phone number
 */
export function generatePhoneNumber(): string {
  return faker.phone.number({ style: 'international' });
}

/**
 * Generate random French city name
 *
 * @returns City name
 */
export function generateCity(): string {
  return faker.location.city();
}

/**
 * Generate random French street address
 *
 * @returns Street address
 */
export function generateAddress(): string {
  return `${faker.location.buildingNumber()} ${faker.location.streetName()}`;
}

/**
 * Generate random email address
 *
 * @param firstName Optional first name for email generation
 * @param lastName Optional last name for email generation
 * @returns Email address
 */
export function generateEmail(firstName?: string, lastName?: string): string {
  if (firstName && lastName) {
    return faker.internet.email({ firstName, lastName });
  }
  return faker.internet.email();
}

/**
 * Generate random French company name
 *
 * @returns Company name
 */
export function generateCompanyName(): string {
  return faker.company.name();
}

/**
 * Generate random SIREN (French company identification number)
 * SIREN is 9 digits
 *
 * @returns SIREN number
 */
export function generateSiren(): string {
  return faker.string.numeric(9);
}

/**
 * Generate random SIRET (French establishment identification number)
 * SIRET is 14 digits (SIREN + 5 digits)
 *
 * @returns SIRET number
 */
export function generateSiret(): string {
  return faker.string.numeric(14);
}

/**
 * Generate random legal form for French companies
 *
 * @returns Legal form abbreviation
 */
export function generateLegalForm(): EntrepriseData['legalForm'] {
  return faker.helpers.arrayElement([
    'SARL',
    'SAS',
    'SA',
    'EURL',
    'Association',
    'SCOP',
    'SPRL',
  ] as const);
}

/**
 * Generate random birthdate for a person aged between min and max
 *
 * @param min Minimum age
 * @param max Maximum age
 * @returns ISO date string (YYYY-MM-DD)
 */
export function generateBirthdate(min: number = 18, max: number = 100): string {
  return faker.date.birthdate({ min, max, mode: 'age' }).toISOString().split('T')[0];
}

/**
 * Generate random civility (title)
 *
 * @returns 'Monsieur' or 'Madame'
 */
export function generateCivility(): 'Monsieur' | 'Madame' {
  return faker.helpers.arrayElement(['Monsieur', 'Madame'] as const);
}

/**
 * Generate random first name based on civility
 *
 * @param civility Optional civility to determine gender
 * @returns First name
 */
export function generateFirstName(civility?: 'Monsieur' | 'Madame'): string {
  const gender = civility === 'Madame' ? 'female' : civility === 'Monsieur' ? 'male' : undefined;
  return faker.person.firstName(gender);
}

/**
 * Generate random last name
 *
 * @returns Last name
 */
export function generateLastName(): string {
  return faker.person.lastName();
}

/**
 * Generate donation data with random values
 *
 * @param overrides Optional field overrides
 * @returns DonationData object
 */
export function generateDonation(overrides?: Partial<DonationData>): DonationData {
  return {
    amount: generateAmount(),
    withTaxReduction: faker.datatype.boolean({ probability: 0.7 }),
    donatorType: faker.helpers.arrayElement(['particulier', 'entreprise'] as const),
    ...overrides,
  };
}

/**
 * Generate a complete donation flow data package
 * Includes both donor and donation information
 */
export function generateCompleteDonationPackage(
  donatorType: 'particulier' | 'entreprise' = 'particulier'
): {
  donator: ParticulierData | EntrepriseData;
  donation: DonationData;
} {
  const donator = donatorType === 'particulier' ? generateParticulier() : generateEntreprise();

  return {
    donator,
    donation: generateDonation({ donatorType }),
  };
}

/**
 * Generate mock UUID (v4 format)
 * For testing purposes only - not cryptographically secure
 *
 * @returns UUID string
 */
export function generateUuid(): string {
  return faker.string.uuid();
}

/**
 * Generate mock document ID (Strapi format)
 * Typical format: lowercase-letters + numbers
 *
 * @param prefix Optional prefix
 * @returns Document ID
 */
export function generateDocumentId(prefix: string = 'doc'): string {
  return `${prefix}_${faker.string.alphaNumeric(20)}`.toLowerCase();
}

/**
 * Generate a bulk array of test data
 *
 * @param count Number of records to generate
 * @param type Type of data to generate: 'particulier' or 'entreprise'
 * @returns Array of donor data
 */
export function generateBulkDonors(
  count: number,
  type: 'particulier' | 'entreprise' = 'particulier'
): Array<ParticulierData | EntrepriseData> {
  const donors = [];
  for (let i = 0; i < count; i++) {
    donors.push(type === 'particulier' ? generateParticulier() : generateEntreprise());
  }
  return donors;
}

/**
 * Seed the faker library for reproducible test data
 * Useful for consistent test data across test runs
 *
 * @param seed Seed value
 */
export function seedFaker(seed: number): void {
  faker.seed(seed);
}

/**
 * Reset faker to generate non-seeded random data
 */
export function resetFaker(): void {
  faker.seed(undefined as any);
}
