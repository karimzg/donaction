import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockSetFieldError = vi.fn();
vi.mock('../logic/fieldErrors.svelte', () => ({
  setFieldError: (...args: unknown[]) => mockSetFieldError(...args),
}));

const mockEventBusEmit = vi.fn();
vi.mock('../../../utils/eventBus', () => ({
  default: {
    emit: (...args: unknown[]) => mockEventBusEmit(...args),
    on: vi.fn(),
    off: vi.fn(),
  },
}));

let mockTriggerValidationCb: ((val: number) => void) | null = null;
const mockTriggerValidationUnsubscribe = vi.fn();

const mockDefaultValues: Record<string, unknown> = {};
const mockFormConfig: Record<string, unknown> = {
  myLast: null,
  dirty: false,
  donUuid: null,
};

vi.mock('../logic/useSponsorshipForm.svelte', () => ({
  DEFAULT_VALUES: mockDefaultValues,
  FORM_CONFIG: mockFormConfig,
  isBeingFilled: { set: vi.fn() },
  triggerValidation: {
    subscribe: (cb: (val: number) => void) => {
      mockTriggerValidationCb = cb;
      return mockTriggerValidationUnsubscribe;
    },
    set: vi.fn(),
  },
  SUBSCRIPTION: { klubr: { uuid: 'klubr-1' }, project: null },
  defVals: {},
  index: { subscribe: vi.fn(), set: vi.fn() },
}));

describe('validator action', () => {
  let validator: typeof import('../logic/validator').validator;
  let sanitizeInput: typeof import('../logic/validator').sanitizeInput;

  beforeEach(async () => {
    vi.useFakeTimers();
    mockSetFieldError.mockReset();
    mockEventBusEmit.mockReset();
    mockTriggerValidationCb = null;
    mockTriggerValidationUnsubscribe.mockReset();
    mockFormConfig.myLast = null;
    mockFormConfig.dirty = false;

    const mod = await import('../logic/validator');
    validator = mod.validator;
    sanitizeInput = mod.sanitizeInput;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function createMockInput(overrides: Partial<HTMLInputElement> = {}): HTMLInputElement {
    const formGroup = document.createElement('div');
    formGroup.classList.add('don-form-group');

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'test-field';
    input.value = '';
    Object.assign(input, overrides);
    formGroup.appendChild(input);

    return input;
  }

  describe('setup and destroy', () => {
    it('attaches blur and input listeners, subscribes to triggerValidation', () => {
      const input = createMockInput();
      const addSpy = vi.spyOn(input, 'addEventListener');

      const action = validator(input, {
        validateFunctions: [(v: any) => (v ? '' : 'required')],
        fieldName: 'Test',
      });

      expect(addSpy).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(addSpy).toHaveBeenCalledWith('input', expect.any(Function));
      expect(mockTriggerValidationCb).toBeTypeOf('function');

      action.destroy();
    });

    it('removes listeners and unsubscribes on destroy', () => {
      const input = createMockInput();
      const removeSpy = vi.spyOn(input, 'removeEventListener');

      const action = validator(input, {
        validateFunctions: [],
        fieldName: 'Test',
      });

      action.destroy();

      expect(removeSpy).toHaveBeenCalledWith('blur', expect.any(Function));
      expect(removeSpy).toHaveBeenCalledWith('input', expect.any(Function));
      expect(mockTriggerValidationUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('blur validation', () => {
    it('marks parent as touched and validates on blur', () => {
      const input = createMockInput();
      input.value = '';

      validator(input, {
        validateFunctions: [(v: any) => (String(v).trim().length < 2 ? 'required' : '')],
        fieldName: 'Prénom',
      });

      input.dispatchEvent(new Event('blur'));

      const formGroup = input.closest('.don-form-group')!;
      expect(formGroup.classList.contains('touched')).toBe(true);
      expect(formGroup.classList.contains('invalid')).toBe(true);
      expect(mockSetFieldError).toHaveBeenCalledWith('test-field', 'required');
    });

    it('marks valid when value passes all validators', () => {
      const input = createMockInput();
      input.value = 'Jean';

      validator(input, {
        validateFunctions: [(v: any) => (String(v).trim().length < 2 ? 'required' : '')],
        fieldName: 'Prénom',
      });

      input.dispatchEvent(new Event('blur'));

      const formGroup = input.closest('.don-form-group')!;
      expect(formGroup.classList.contains('valid')).toBe(true);
      expect(formGroup.classList.contains('invalid')).toBe(false);
      expect(mockSetFieldError).toHaveBeenCalledWith('test-field', '');
    });
  });

  describe('input validation (debounced, typing mode)', () => {
    it('clears error on valid input after debounce', () => {
      const input = createMockInput();
      input.value = 'Valid';

      validator(input, {
        validateFunctions: [(v: any) => (String(v).trim().length < 2 ? 'required' : '')],
        fieldName: 'Nom',
      });

      input.dispatchEvent(new Event('input'));
      vi.advanceTimersByTime(200);

      expect(mockSetFieldError).toHaveBeenCalledWith('test-field', '');
    });

    it('does NOT set error on invalid input while typing (only clears)', () => {
      const input = createMockInput();
      input.value = '';

      validator(input, {
        validateFunctions: [(v: any) => (String(v).trim().length < 2 ? 'required' : '')],
        fieldName: 'Nom',
      });

      input.dispatchEvent(new Event('input'));
      vi.advanceTimersByTime(200);

      // In typing mode, if there IS an error, setValidationState is NOT called
      // The function only updates when !message (valid)
      // So setFieldError should NOT have been called
      expect(mockSetFieldError).not.toHaveBeenCalled();
    });

    it('debounces input events', () => {
      const input = createMockInput();
      input.value = 'V';

      validator(input, {
        validateFunctions: [(v: any) => (String(v).trim().length < 2 ? 'required' : '')],
        fieldName: 'Nom',
      });

      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('input'));
      input.dispatchEvent(new Event('input'));
      input.value = 'Valid';
      input.dispatchEvent(new Event('input'));
      vi.advanceTimersByTime(200);

      // Only one call after debounce
      expect(mockSetFieldError).toHaveBeenCalledTimes(1);
    });
  });

  describe('triggerValidation subscription', () => {
    it('validates and marks touched when triggerValidation > 0', () => {
      const input = createMockInput();
      input.value = '';

      validator(input, {
        validateFunctions: [(v: any) => (String(v).trim().length < 2 ? 'required' : '')],
        fieldName: 'Prénom',
      });

      mockTriggerValidationCb!(1);

      const formGroup = input.closest('.don-form-group')!;
      expect(formGroup.classList.contains('touched')).toBe(true);
      expect(formGroup.classList.contains('invalid')).toBe(true);
    });

    it('does nothing when triggerValidation is 0', () => {
      const input = createMockInput();
      input.value = '';

      validator(input, {
        validateFunctions: [(v: any) => (String(v).trim().length < 2 ? 'required' : '')],
        fieldName: 'Prénom',
      });

      mockTriggerValidationCb!(0);

      const formGroup = input.closest('.don-form-group')!;
      expect(formGroup.classList.contains('touched')).toBe(false);
    });
  });

  describe('email event emission', () => {
    it('emits emailUpdated on valid email blur', () => {
      const input = createMockInput();
      input.value = 'test@example.com';

      validator(input, {
        validateFunctions: [
          (v: any) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : 'invalid'),
        ],
        fieldName: 'E-mail',
      });

      input.dispatchEvent(new Event('blur'));

      expect(mockEventBusEmit).toHaveBeenCalledWith(
        'KLUBR_SPONSORSHIP_FORM_emailUpdated',
        'test@example.com',
      );
    });

    it('does NOT emit emailUpdated when email is invalid', () => {
      const input = createMockInput();
      input.value = 'bad-email';

      validator(input, {
        validateFunctions: [
          (v: any) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()) ? '' : 'invalid'),
        ],
        fieldName: 'E-mail',
      });

      input.dispatchEvent(new Event('blur'));

      expect(mockEventBusEmit).not.toHaveBeenCalled();
    });
  });

  describe('dirty tracking', () => {
    it('sets FORM_CONFIG.dirty when myLast values differ from DEFAULT_VALUES', () => {
      mockFormConfig.myLast = { email: 'old@test.com' };
      mockFormConfig.dirty = false;
      mockDefaultValues.email = 'new@test.com';

      const input = createMockInput();
      input.value = 'new@test.com';

      validator(input, {
        validateFunctions: [(v: any) => (String(v).trim().length < 2 ? 'required' : '')],
        fieldName: 'E-mail',
      });

      input.dispatchEvent(new Event('blur'));

      expect(mockFormConfig.dirty).toBe(true);
    });
  });

  describe('checkbox validation', () => {
    it('validates checkbox checked state', () => {
      const formGroup = document.createElement('div');
      formGroup.classList.add('don-form-group');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = 'accept-conditions';
      input.checked = false;
      formGroup.appendChild(input);

      validator(input, {
        validateFunctions: [(v: any) => (v ? '' : 'required')],
        fieldName: 'Conditions',
      });

      input.dispatchEvent(new Event('blur'));

      expect(mockSetFieldError).toHaveBeenCalledWith('accept-conditions', 'required');
      expect(formGroup.classList.contains('invalid')).toBe(true);
    });

    it('validates checked checkbox as valid', () => {
      const formGroup = document.createElement('div');
      formGroup.classList.add('don-form-group');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.id = 'accept-conditions';
      input.checked = true;
      formGroup.appendChild(input);

      validator(input, {
        validateFunctions: [(v: any) => (v ? '' : 'required')],
        fieldName: 'Conditions',
      });

      input.dispatchEvent(new Event('blur'));

      expect(mockSetFieldError).toHaveBeenCalledWith('accept-conditions', '');
      expect(formGroup.classList.contains('valid')).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('escapes HTML special characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;',
      );
    });

    it('escapes single quotes', () => {
      expect(sanitizeInput("it's")).toBe('it&#x27;s');
    });

    it('returns plain text unchanged', () => {
      expect(sanitizeInput('Jean Dupont')).toBe('Jean Dupont');
    });
  });

  describe('multiple validate functions', () => {
    it('stops at first error', () => {
      const input = createMockInput();
      input.value = '';

      const fn1 = vi.fn((v: any) => (String(v).trim().length < 2 ? 'too short' : ''));
      const fn2 = vi.fn(() => 'second error');

      validator(input, {
        validateFunctions: [fn1, fn2],
        fieldName: 'Test',
      });

      input.dispatchEvent(new Event('blur'));

      expect(fn1).toHaveBeenCalled();
      expect(fn2).not.toHaveBeenCalled();
      expect(mockSetFieldError).toHaveBeenCalledWith('test-field', 'too short');
    });
  });
});
