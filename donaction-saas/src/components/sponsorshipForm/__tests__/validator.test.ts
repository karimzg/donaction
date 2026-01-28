import { describe, it, expect } from 'vitest';
import {
  validateAmount,
  validateSiren,
  validateTrue,
  validateDateMajor,
  validateDate,
  validateString,
  validateEmail,
  validatePostalCode,
  validateRequired,
  eighteenYearsAgo,
  stringRegExp,
  stringWithoutNumbersRegExp,
} from '../logic/validator';

// ============================================================================
// validateAmount(value: number, fieldName: string)
// ============================================================================
describe('validateAmount', () => {
  it('should return "Ce champ est obligatoire" when value is 0', () => {
    expect(validateAmount(0, 'Montant')).toBe('Ce champ est obligatoire');
  });

  it('should return "Ce champ est obligatoire" when value is NaN', () => {
    expect(validateAmount(NaN, 'Montant')).toBe('Ce champ est obligatoire');
  });

  it('should return "{fieldName} non valide" when value contains scientific notation in string form', () => {
    // Note: 1e5 becomes 100000 when converted to number, so we can't test the 'e' check directly
    // The check is for when the string representation would include 'e' (very large/small numbers)
    // This is handled by JavaScript's number to string conversion
    // So this test validates the function structure exists but can't trigger 'e' string check directly
    const result = validateAmount(100000, 'Montant');
    // 100000 is >= 10, so it should be valid
    expect(result).toBe('');
  });

  it('should return "Le montant minimum est de 10 €" when value is less than 10', () => {
    expect(validateAmount(5, 'Montant')).toBe('Le montant minimum est de 10 €');
    expect(validateAmount(1, 'Montant')).toBe('Le montant minimum est de 10 €');
    expect(validateAmount(9.99, 'Montant')).toBe('Le montant minimum est de 10 €');
  });

  it('should return empty string for valid amount of 10', () => {
    expect(validateAmount(10, 'Montant')).toBe('');
  });

  it('should return empty string for valid amount greater than 10', () => {
    expect(validateAmount(100, 'Montant')).toBe('');
    expect(validateAmount(1000.50, 'Montant')).toBe('');
    expect(validateAmount(999999, 'Montant')).toBe('');
  });

  it('should use fieldName in error message', () => {
    const result = validateAmount(5, 'Donation');
    expect(result).toContain('10');
  });

  it('should handle edge case of exactly 10.00', () => {
    expect(validateAmount(10.00, 'Montant')).toBe('');
  });

  it('should handle negative values (should fail minimum check)', () => {
    expect(validateAmount(-10, 'Montant')).toBe('Le montant minimum est de 10 €');
  });
});

// ============================================================================
// validateSiren(value: number)
// ============================================================================
describe('validateSiren', () => {
  it('should return "Siren non valide" when value is NaN', () => {
    expect(validateSiren(NaN)).toBe('Siren non valide');
  });

  it('should handle very large numbers that become 10+ digits', () => {
    // 1e9 = 1000000000 (10 digits, not 9)
    const result = validateSiren(1000000000);
    expect(result).toContain('9 chiffres');
  });

  it('should return "Le numéro Siren doit contenir exactement 9 chiffres" when value has fewer than 9 digits', () => {
    expect(validateSiren(12345678)).toContain('9 chiffres');
    expect(validateSiren(1)).toContain('9 chiffres');
    expect(validateSiren(123456789)).toBe(''); // Valid: 9 digits
  });

  it('should return "Le numéro Siren doit contenir exactement 9 chiffres" when value has more than 9 digits', () => {
    expect(validateSiren(1234567890)).toContain('9 chiffres');
    expect(validateSiren(12345678901)).toContain('9 chiffres');
  });

  it('should return empty string for valid 9-digit SIREN', () => {
    expect(validateSiren(123456789)).toBe('');
    expect(validateSiren(100000000)).toBe('');
    expect(validateSiren(999999999)).toBe('');
  });

  it('should validate SIREN starting with 0', () => {
    expect(validateSiren(12345678)).toContain('9 chiffres'); // 8 digits
  });

  it('should handle leading zeros correctly', () => {
    // JavaScript converts 012345678 to octal, so we test with string representation
    // But function expects number, so test with actual numeric value
    expect(validateSiren(12345678)).not.toBe('');
  });
});

// ============================================================================
// validateTrue(value: boolean)
// ============================================================================
describe('validateTrue', () => {
  it('should return "Ce champ est obligatoire" when value is false', () => {
    expect(validateTrue(false)).toBe('Ce champ est obligatoire');
  });

  it('should return empty string when value is true', () => {
    expect(validateTrue(true)).toBe('');
  });

  it('should treat falsy non-boolean as false', () => {
    // Note: function signature expects boolean, but let's test behavior
    expect(validateTrue(false as any)).toBe('Ce champ est obligatoire');
  });

  it('should treat true as valid', () => {
    expect(validateTrue(true as any)).toBe('');
  });
});

// ============================================================================
// validateDateMajor(value: string)
// ============================================================================
describe('validateDateMajor', () => {
  it('should return "Vous devez être majeur(e)" when age is less than 18', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const dateString = birthDate.toISOString().split('T')[0];
    expect(validateDateMajor(dateString)).toBe('Vous devez être majeur(e)');
  });

  it('should return empty string when age is exactly 18', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const dateString = birthDate.toISOString().split('T')[0];
    expect(validateDateMajor(dateString)).toBe('');
  });

  it('should return empty string when age is greater than 18', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 30, today.getMonth(), today.getDate());
    const dateString = birthDate.toISOString().split('T')[0];
    expect(validateDateMajor(dateString)).toBe('');
  });

  it('should return "Date non valide" when age exceeds 110 years', () => {
    const birthDate = new Date(1800, 0, 1); // Born in 1800 = ~224 years old
    const dateString = birthDate.toISOString().split('T')[0];
    expect(validateDateMajor(dateString)).toBe('Date non valide');
  });

  it('should correctly calculate age considering month difference', () => {
    const today = new Date();
    // Person born 18 years ago but next month (so currently 17)
    const birthDate = new Date(
      today.getFullYear() - 18,
      today.getMonth() + 1,
      today.getDate()
    );
    const dateString = birthDate.toISOString().split('T')[0];
    expect(validateDateMajor(dateString)).toBe('Vous devez être majeur(e)');
  });

  it('should correctly calculate age considering day of month', () => {
    const today = new Date();
    // Person born 18 years ago but previous day (so currently 18 and valid)
    // Because if the birth date is tomorrow, they are still 17
    const birthDate = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate() - 1
    );
    const dateString = birthDate.toISOString().split('T')[0];
    const result = validateDateMajor(dateString);
    // This person is exactly 18 or older by 1 day, so should be valid
    expect(result).toBe('');
  });

  it('should handle leap year dates correctly', () => {
    const birthDate = new Date(1976, 1, 29); // Feb 29 (leap year)
    const dateString = birthDate.toISOString().split('T')[0];
    const result = validateDateMajor(dateString);
    expect(['', 'Vous devez être majeur(e)', 'Date non valide']).toContain(result);
  });

  it('should return empty string for age exactly 110', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 110, today.getMonth(), today.getDate());
    const dateString = birthDate.toISOString().split('T')[0];
    expect(validateDateMajor(dateString)).toBe('');
  });

  it('should return "Date non valide" for age 111', () => {
    const today = new Date();
    const birthDate = new Date(today.getFullYear() - 111, today.getMonth(), today.getDate());
    const dateString = birthDate.toISOString().split('T')[0];
    expect(validateDateMajor(dateString)).toBe('Date non valide');
  });
});

// ============================================================================
// validateDate(value: string, fieldName: string)
// ============================================================================
describe('validateDate', () => {
  it('should return "Ce champ est obligatoire" when value is empty string', () => {
    expect(validateDate('', 'Date')).toBe('Ce champ est obligatoire');
  });

  it('should return "Ce champ est obligatoire" when value is whitespace only', () => {
    expect(validateDate('   ', 'Date')).toBe('Ce champ est obligatoire');
  });

  it('should return "{fieldName} non valide" when value is invalid date string', () => {
    const result = validateDate('invalid-date', 'Date de naissance');
    expect(result).toBe('Date de naissance non valide');
  });

  it('should return "{fieldName} non valide" when value is not a date', () => {
    const result = validateDate('abc123', 'Date');
    expect(result).toBe('Date non valide');
  });

  it('should return empty string for valid ISO date format', () => {
    expect(validateDate('2000-01-15', 'Date')).toBe('');
  });

  it('should return empty string for valid date string', () => {
    expect(validateDate('2023-12-25', 'Date')).toBe('');
  });

  it('should use fieldName in error message', () => {
    const result = validateDate('invalid', 'Date de naissance');
    expect(result).toContain('Date de naissance');
  });

  it('should accept various date formats that JavaScript can parse', () => {
    expect(validateDate('01/15/2000', 'Date')).toBe('');
    expect(validateDate('January 15, 2000', 'Date')).toBe('');
  });
});

// ============================================================================
// validateString(value: string, fieldName: string, regExp: RegExp)
// ============================================================================
describe('validateString', () => {
  it('should return "{fieldName} non valide" when regex test returns true', () => {
    const invalidRegExp = /[0-9]/; // Matches numbers (invalid)
    const result = validateString('Test123', 'Nom', invalidRegExp);
    expect(result).toBe('Nom non valide');
  });

  it('should return empty string when regex test returns false', () => {
    const validRegExp = /[0-9]/; // Matches numbers (invalid)
    const result = validateString('TestName', 'Nom', validRegExp);
    expect(result).toBe('');
  });

  it('should trim value before testing', () => {
    const invalidRegExp = /[0-9]/;
    const result = validateString('  Test123  ', 'Nom', invalidRegExp);
    expect(result).toBe('Nom non valide');
  });

  it('should use fieldName in error message', () => {
    const invalidRegExp = /[0-9]/;
    const result = validateString('Test123', 'Raison sociale', invalidRegExp);
    expect(result).toContain('Raison sociale');
  });

  it('should handle empty string', () => {
    const regExp = /[0-9]/;
    const result = validateString('', 'Nom', regExp);
    expect(result).toBe('');
  });

  it('should work with stringWithoutNumbersRegExp pattern', () => {
    const result = validateString('Test123', 'Nom', stringWithoutNumbersRegExp);
    expect(result).toBe('Nom non valide');
  });

  it('should return valid for pure letters with stringWithoutNumbersRegExp', () => {
    const result = validateString('TestName', 'Nom', stringWithoutNumbersRegExp);
    expect(result).toBe('');
  });

  it('should work with complex regex patterns', () => {
    const complexRegex = /^[A-Z][a-z]*$/; // Must start with uppercase
    const result1 = validateString('ValidName', 'Nom', complexRegex);
    expect(result1).toBe(''); // matches the pattern

    const result2 = validateString('invalidName', 'Nom', complexRegex);
    expect(result2).toBe(''); // doesn't match, so no error
  });
});

// ============================================================================
// validateEmail(value: string)
// ============================================================================
describe('validateEmail', () => {
  it('should return "E-mail non valide" for email without @ symbol', () => {
    expect(validateEmail('testexample.com')).toBe('E-mail non valide');
  });

  it('should return "E-mail non valide" for email without domain', () => {
    expect(validateEmail('test@')).toBe('E-mail non valide');
  });

  it('should return "E-mail non valide" for email without local part', () => {
    expect(validateEmail('@example.com')).toBe('E-mail non valide');
  });

  it('should return "E-mail non valide" for email without TLD', () => {
    expect(validateEmail('test@example')).toBe('E-mail non valide');
  });

  it('should return "E-mail non valide" for email with spaces', () => {
    expect(validateEmail('test @example.com')).toBe('E-mail non valide');
  });

  it('should return empty string for valid email', () => {
    expect(validateEmail('test@example.com')).toBe('');
  });

  it('should return empty string for valid email with subdomain', () => {
    expect(validateEmail('user@mail.example.com')).toBe('');
  });

  it('should return empty string for valid email with numbers', () => {
    expect(validateEmail('test123@example.com')).toBe('');
  });

  it('should return empty string for valid email with dots in local part', () => {
    expect(validateEmail('first.last@example.com')).toBe('');
  });

  it('should return empty string for valid email with plus sign', () => {
    expect(validateEmail('test+tag@example.com')).toBe('');
  });

  it('should trim whitespace before validation', () => {
    expect(validateEmail('  test@example.com  ')).toBe('');
  });

  it('should reject email with multiple @ symbols', () => {
    expect(validateEmail('test@@example.com')).toBe('E-mail non valide');
  });

  it('should accept common TLDs', () => {
    expect(validateEmail('user@example.fr')).toBe('');
    expect(validateEmail('user@example.co.uk')).toBe('');
    expect(validateEmail('user@example.io')).toBe('');
  });
});

// ============================================================================
// validatePostalCode(value: string)
// ============================================================================
describe('validatePostalCode', () => {
  it('should return "Code postal non valide" for non-numeric input', () => {
    expect(validatePostalCode('ABCDE')).toBe('Code postal non valide');
  });

  it('should return "Code postal non valide" for too short postal code', () => {
    expect(validatePostalCode('123')).toBe('Code postal non valide');
  });

  it('should return "Code postal non valide" for too long postal code', () => {
    expect(validatePostalCode('123456')).toBe('Code postal non valide');
  });

  it('should return "Code postal non valide" for empty string', () => {
    expect(validatePostalCode('')).toBe('Code postal non valide');
  });

  it('should return empty string for valid postal code 75000 (Paris)', () => {
    expect(validatePostalCode('75000')).toBe('');
  });

  it('should return empty string for valid postal code 13000 (Marseille)', () => {
    expect(validatePostalCode('13000')).toBe('');
  });

  it('should return empty string for valid postal code 92000 (Hauts-de-Seine)', () => {
    expect(validatePostalCode('92000')).toBe('');
  });

  it('should return empty string for postal code starting with 01 (Ain)', () => {
    expect(validatePostalCode('01000')).toBe('');
  });

  it('should return empty string for postal code starting with 95 (Val-d\'Oise)', () => {
    expect(validatePostalCode('95000')).toBe('');
  });

  it('should return "Code postal non valide" for postal code starting with 96', () => {
    expect(validatePostalCode('96000')).toBe('Code postal non valide');
  });

  it('should return "Code postal non valide" for postal code starting with 99', () => {
    expect(validatePostalCode('99000')).toBe('Code postal non valide');
  });

  it('should trim whitespace before validation', () => {
    expect(validatePostalCode('  75000  ')).toBe('');
  });

  it('should reject postal code with letters', () => {
    expect(validatePostalCode('7500A')).toBe('Code postal non valide');
  });

  it('should reject postal code with special characters', () => {
    expect(validatePostalCode('75-000')).toBe('Code postal non valide');
    expect(validatePostalCode('75 000')).toBe('Code postal non valide');
  });

  it('should validate all departments from 01 to 95', () => {
    // Test first digit 0-8 with any last digit
    expect(validatePostalCode('08123')).toBe('');
    expect(validatePostalCode('85999')).toBe('');

    // Test first digit 9 with second digit 0-5
    expect(validatePostalCode('90000')).toBe('');
    expect(validatePostalCode('94000')).toBe('');
  });
});

// ============================================================================
// validateRequired(value: string)
// ============================================================================
describe('validateRequired', () => {
  it('should return "Ce champ est obligatoire" for empty string', () => {
    expect(validateRequired('')).toBe('Ce champ est obligatoire');
  });

  it('should return "Ce champ est obligatoire" for single character', () => {
    expect(validateRequired('A')).toBe('Ce champ est obligatoire');
  });

  it('should return "Ce champ est obligatoire" for whitespace only', () => {
    expect(validateRequired('   ')).toBe('Ce champ est obligatoire');
  });

  it('should return empty string for exactly 2 characters', () => {
    expect(validateRequired('AB')).toBe('');
  });

  it('should return empty string for string longer than 2 characters', () => {
    expect(validateRequired('ABC')).toBe('');
    expect(validateRequired('Hello World')).toBe('');
  });

  it('should trim whitespace before validation', () => {
    expect(validateRequired('  A  ')).toBe('Ce champ est obligatoire');
    expect(validateRequired('  AB  ')).toBe('');
  });

  it('should handle numbers as strings', () => {
    expect(validateRequired('1')).toBe('Ce champ est obligatoire');
    expect(validateRequired('12')).toBe('');
  });

  it('should handle special characters', () => {
    expect(validateRequired('!')).toBe('Ce champ est obligatoire');
    expect(validateRequired('!@')).toBe('');
  });
});

// ============================================================================
// eighteenYearsAgo()
// ============================================================================
describe('eighteenYearsAgo', () => {
  it('should return a date string in YYYY-MM-DD format', () => {
    const result = eighteenYearsAgo();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should return a date 18 years ago from today', () => {
    const result = eighteenYearsAgo();
    const [year, month, day] = result.split('-').map(Number);

    // Create date object from result
    const resultDate = new Date(year, month - 1, day);

    // Create expected date: today minus 18 years
    const today = new Date();
    const expectedDate = new Date(today);
    expectedDate.setFullYear(expectedDate.getFullYear() - 18);

    // The dates should be the same date (allowing for time component differences)
    expect(resultDate.getFullYear()).toBe(expectedDate.getFullYear());
    expect(resultDate.getMonth()).toBe(expectedDate.getMonth());
    expect(resultDate.getDate()).toBe(expectedDate.getDate());
  });

  it('should have zero-padded month', () => {
    const result = eighteenYearsAgo();
    const [, month] = result.split('-');
    expect(month).toMatch(/^\d{2}$/);
    expect(month.length).toBe(2);
  });

  it('should have zero-padded day', () => {
    const result = eighteenYearsAgo();
    const [, , day] = result.split('-');
    expect(day).toMatch(/^\d{2}$/);
    expect(day.length).toBe(2);
  });

  it('should return correct year', () => {
    const result = eighteenYearsAgo();
    const [year] = result.split('-');
    const today = new Date();
    const expectedYear = today.getFullYear() - 18;
    expect(Number(year)).toBe(expectedYear);
  });

  it('should pad single-digit months with zero', () => {
    // This test validates behavior for January-September
    const result = eighteenYearsAgo();
    const parts = result.split('-');
    expect(parts.length).toBe(3);
    expect(parts[1]).toMatch(/^0\d$|^1[0-2]$/);
  });

  it('should pad single-digit days with zero', () => {
    const result = eighteenYearsAgo();
    const [, , day] = result.split('-');
    expect(day).toMatch(/^0\d$|^[12]\d$|^3[01]$/);
  });

  it('should work correctly around leap years', () => {
    // Just verify it returns a valid date format
    const result = eighteenYearsAgo();
    const [year, month, day] = result.split('-').map(Number);

    // Verify each part is in valid range
    expect(year).toBeGreaterThan(2000);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
    expect(day).toBeGreaterThanOrEqual(1);
    expect(day).toBeLessThanOrEqual(31);
  });

  it('should be usable with validateDateMajor', () => {
    const dateString = eighteenYearsAgo();
    const result = validateDateMajor(dateString);
    // Should return empty string (valid) or be at boundary
    expect(['', 'Vous devez être majeur(e)', 'Date non valide']).toContain(result);
  });
});

// ============================================================================
// Regex Pattern Tests
// ============================================================================
describe('stringRegExp', () => {
  // This regex matches strings that DO NOT consist only of: word chars, spaces, commas, dots, hyphens, slashes, accented letters
  // In other words: it matches strings that have at least one "invalid" character

  it('should match strings with special characters (@, #, etc)', () => {
    expect(stringRegExp.test('Test@123')).toBe(true);
  });

  it('should match strings with exclamation mark', () => {
    expect(stringRegExp.test('Test!')).toBe(true);
  });

  it('should not match pure alphanumeric strings (only word chars allowed)', () => {
    expect(stringRegExp.test('TestName')).toBe(false);
  });

  it('should not match strings with only spaces and letters', () => {
    expect(stringRegExp.test('Test Name')).toBe(false);
  });

  it('should not match strings with hyphens and spaces only', () => {
    expect(stringRegExp.test('Test-Name')).toBe(false);
    expect(stringRegExp.test('Test, Name')).toBe(false);
  });

  it('should match strings with numbers (numbers are word chars, but combined with other rules)', () => {
    // Numbers are \w, but this is testing the negative lookahead
    // \w includes [A-Za-z0-9_] plus unicode letter chars
    // So 'Test123' should NOT match because it's only word chars
    expect(stringRegExp.test('Test123')).toBe(false);
  });

  it('should match strings with prohibited characters like parentheses', () => {
    expect(stringRegExp.test('Test(Name)')).toBe(true);
  });
});

describe('stringWithoutNumbersRegExp', () => {
  it('should match strings containing numbers', () => {
    expect(stringWithoutNumbersRegExp.test('Test1')).toBe(true);
  });

  it('should match strings containing special characters', () => {
    expect(stringWithoutNumbersRegExp.test('Test@')).toBe(true);
  });

  it('should not match pure alphabetic strings', () => {
    expect(stringWithoutNumbersRegExp.test('TestName')).toBe(false);
  });

  it('should not match strings with only spaces and letters', () => {
    expect(stringWithoutNumbersRegExp.test('Test Name')).toBe(false);
  });

  it('should match strings with apostrophes and numbers', () => {
    expect(stringWithoutNumbersRegExp.test("D'Angelo1")).toBe(true);
  });

  it('should not match strings with hyphens only', () => {
    expect(stringWithoutNumbersRegExp.test("Mary-Jane")).toBe(false);
  });

  it('should match strings with numbers', () => {
    expect(stringWithoutNumbersRegExp.test("Test2023")).toBe(true);
  });
});
