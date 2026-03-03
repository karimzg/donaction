import { describe, it, expect, beforeEach } from 'vitest';
import {
  fieldErrors,
  setFieldError,
  getFieldError,
  clearAllFieldErrors,
  clearFieldError,
} from '../logic/fieldErrors.svelte';

describe('fieldErrors store tests', () => {
  beforeEach(() => {
    Object.keys(fieldErrors).forEach((key) => {
      delete fieldErrors[key];
    });
  });

  describe('setFieldError', () => {
    it('should set error message for a field', () => {
      setFieldError('email', 'Email invalide');
      expect(fieldErrors['email']).toBe('Email invalide');
    });

    it('should do nothing when fieldId is empty string', () => {
      setFieldError('', 'Error message');
      expect(Object.keys(fieldErrors).length).toBe(0);
    });

    it('should overwrite existing error', () => {
      setFieldError('email', 'First error');
      expect(fieldErrors['email']).toBe('First error');
      setFieldError('email', 'Second error');
      expect(fieldErrors['email']).toBe('Second error');
    });

    it('should handle multiple fields', () => {
      setFieldError('email', 'Email invalide');
      setFieldError('name', 'Nom requis');
      setFieldError('phone', 'Téléphone invalide');
      expect(fieldErrors['email']).toBe('Email invalide');
      expect(fieldErrors['name']).toBe('Nom requis');
      expect(fieldErrors['phone']).toBe('Téléphone invalide');
    });
  });

  describe('getFieldError', () => {
    it('should return error message for existing field', () => {
      setFieldError('email', 'Email invalide');
      expect(getFieldError('email')).toBe('Email invalide');
    });

    it('should return empty string for unknown field', () => {
      expect(getFieldError('nonexistent')).toBe('');
    });

    it('should return empty string for cleared field', () => {
      setFieldError('email', 'Error');
      clearFieldError('email');
      expect(getFieldError('email')).toBe('');
    });
  });

  describe('clearAllFieldErrors', () => {
    it('should clear all errors by setting to empty string', () => {
      setFieldError('email', 'Email invalide');
      setFieldError('name', 'Nom requis');
      setFieldError('phone', 'Téléphone invalide');
      clearAllFieldErrors();
      expect(fieldErrors['email']).toBe('');
      expect(fieldErrors['name']).toBe('');
      expect(fieldErrors['phone']).toBe('');
    });

    it('should work when no errors exist', () => {
      clearAllFieldErrors();
      expect(Object.keys(fieldErrors).length).toBe(0);
    });

    it('should keep keys after clearing (values are empty strings)', () => {
      setFieldError('email', 'Error');
      setFieldError('name', 'Error');
      clearAllFieldErrors();
      expect('email' in fieldErrors).toBe(true);
      expect('name' in fieldErrors).toBe(true);
      expect(fieldErrors['email']).toBe('');
      expect(fieldErrors['name']).toBe('');
    });
  });

  describe('clearFieldError', () => {
    it('should clear specific field error', () => {
      setFieldError('email', 'Email invalide');
      setFieldError('name', 'Nom requis');
      clearFieldError('email');
      expect(fieldErrors['email']).toBe('');
      expect(fieldErrors['name']).toBe('Nom requis');
    });

    it('should do nothing for non-existent field', () => {
      setFieldError('email', 'Error');
      clearFieldError('nonexistent');
      expect(fieldErrors['email']).toBe('Error');
    });

    it('should do nothing for empty fieldId', () => {
      setFieldError('email', 'Error');
      clearFieldError('');
      expect(fieldErrors['email']).toBe('Error');
    });

    it('should leave other field errors intact', () => {
      setFieldError('email', 'Email invalide');
      setFieldError('name', 'Nom requis');
      setFieldError('phone', 'Téléphone invalide');
      clearFieldError('name');
      expect(fieldErrors['email']).toBe('Email invalide');
      expect(fieldErrors['name']).toBe('');
      expect(fieldErrors['phone']).toBe('Téléphone invalide');
    });
  });

  describe('fieldErrors object', () => {
    it('should be directly readable after setFieldError', () => {
      setFieldError('email', 'Error message');
      expect(fieldErrors['email']).toBe('Error message');
    });

    it('should start empty', () => {
      expect(Object.keys(fieldErrors).length).toBe(0);
    });
  });
});
