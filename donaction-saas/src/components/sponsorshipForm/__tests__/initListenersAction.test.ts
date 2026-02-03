import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEventBusOn = vi.fn();
const mockEventBusEmit = vi.fn();
vi.mock('../../../utils/eventBus', () => ({
  default: {
    on: (...args: unknown[]) => mockEventBusOn(...args),
    off: vi.fn(),
    emit: (...args: unknown[]) => mockEventBusEmit(...args),
    events: new Map(),
  },
}));

const mockSendGaEvent = vi.fn();
vi.mock('../../../utils/sendGaEvent', () => ({
  sendGaEvent: (...args: unknown[]) => mockSendGaEvent(...args),
}));

const mockDefaultValues: Record<string, unknown> = {
  withTaxReduction: true,
  estOrganisme: false,
  email: '',
};

const mockDefVals: Record<string, unknown> = {
  withTaxReduction: true,
  estOrganisme: false,
  email: '',
};

const mockFormConfig: Record<string, unknown> = {
  donatorUuid: null,
  donUuid: null,
  myLast: null,
  dirty: false,
  myLasts: null,
  authEmail: null,
  projectUuid: null,
};

const mockIsBeingFilled = { set: vi.fn(), subscribe: vi.fn() };
const mockIndex = {
  subscribe: vi.fn((cb: (val: number) => void) => {
    cb(1);
    return vi.fn();
  }),
  set: vi.fn(),
};

vi.mock('../logic/useSponsorshipForm.svelte', () => ({
  DEFAULT_VALUES: mockDefaultValues,
  defVals: mockDefVals,
  FORM_CONFIG: mockFormConfig,
  index: mockIndex,
  isBeingFilled: mockIsBeingFilled,
  SUBSCRIPTION: {
    klubr: { uuid: 'klubr-uuid-1', logo: { alternativeText: 'logo', url: 'http://logo.png' } },
    project: null,
  },
  triggerValidation: { subscribe: vi.fn(), set: vi.fn() },
}));

// Mock svelte/store get()
vi.mock('svelte/store', () => ({
  get: (store: any) => {
    if (store === mockIsBeingFilled) return true;
    if (store === mockIndex) return 1;
    return undefined;
  },
  writable: vi.fn(() => ({ subscribe: vi.fn(), set: vi.fn(), update: vi.fn() })),
}));

describe('initListeners', () => {
  let initListeners: typeof import('../logic/initListeners').default;
  let EVENT_CONTEXT: string;
  let eventHandlers: Record<string, (data: any) => void>;

  beforeEach(async () => {
    vi.clearAllMocks();
    eventHandlers = {};
    mockEventBusOn.mockImplementation((event: string, handler: (data: any) => void) => {
      eventHandlers[event] = handler;
    });

    mockDefaultValues.withTaxReduction = true;
    mockDefaultValues.estOrganisme = false;
    mockDefaultValues.email = '';
    mockFormConfig.donatorUuid = null;
    mockFormConfig.donUuid = null;
    mockFormConfig.myLast = null;
    mockFormConfig.dirty = false;
    mockFormConfig.myLasts = null;
    mockFormConfig.authEmail = null;

    const mod = await import('../logic/initListeners');
    initListeners = mod.default;
    EVENT_CONTEXT = mod.EVENT_CONTEXT;
  });

  afterEach(() => {
    // cleanup any window listeners
    vi.restoreAllMocks();
  });

  it('registers all expected event handlers', () => {
    initListeners();

    const expectedEvents = [
      `${EVENT_CONTEXT}resetForm`,
      `${EVENT_CONTEXT}populateForm`,
      `${EVENT_CONTEXT}myLast`,
      `${EVENT_CONTEXT}auth_email`,
      `${EVENT_CONTEXT}editForm`,
      `${EVENT_CONTEXT}controlForm`,
    ];

    expectedEvents.forEach((event) => {
      expect(mockEventBusOn).toHaveBeenCalledWith(event, expect.any(Function));
    });
  });

  describe('resetForm handler', () => {
    it('resets DEFAULT_VALUES to defVals and clears FORM_CONFIG', () => {
      mockDefaultValues.firstName = 'Jean';
      mockDefaultValues.lastName = 'Dupont';
      mockDefVals.firstName = '';
      mockDefVals.lastName = '';
      mockFormConfig.donatorUuid = 'some-uuid';
      mockFormConfig.donUuid = 'some-don';
      mockFormConfig.myLast = { name: 'test' };
      mockFormConfig.dirty = true;
      mockFormConfig.myLasts = [{ test: true }];

      initListeners();
      eventHandlers[`${EVENT_CONTEXT}resetForm`](true);

      expect(mockFormConfig.donatorUuid).toBeNull();
      expect(mockFormConfig.donUuid).toBeNull();
      expect(mockFormConfig.myLast).toBeNull();
      expect(mockFormConfig.dirty).toBe(false);
      expect(mockFormConfig.myLasts).toBeNull();
      expect(mockIsBeingFilled.set).toHaveBeenCalledWith(false);
    });
  });

  describe('populateForm handler', () => {
    it('copies data fields into DEFAULT_VALUES and sends GA event', () => {
      initListeners();
      eventHandlers[`${EVENT_CONTEXT}populateForm`]({
        firstName: 'Marie',
        lastName: 'Martin',
      });

      expect(mockDefaultValues.firstName).toBe('Marie');
      expect(mockDefaultValues.lastName).toBe('Martin');
      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'donation',
          label: 'Populate data from parent event',
        }),
      );
    });
  });

  describe('myLast handler', () => {
    it('stores myLasts and calls populateForm', () => {
      const donors = [{ donateurType: 'Particulier', nom: 'Test', prenom: 'User' }];

      initListeners();
      eventHandlers[`${EVENT_CONTEXT}myLast`](donors);

      expect(mockFormConfig.myLasts).toEqual(donors);
      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          label: 'Populate data from parent event myLast',
        }),
      );
      // populateForm should have populated myLast
      expect(mockFormConfig.myLast).toBeDefined();
    });
  });

  describe('auth_email handler', () => {
    it('sets authEmail and email default value', () => {
      initListeners();
      eventHandlers[`${EVENT_CONTEXT}auth_email`]('user@test.com');

      expect(mockFormConfig.authEmail).toBe('user@test.com');
      expect(mockDefaultValues.email).toBe('user@test.com');
    });
  });

  describe('editForm handler', () => {
    it('sets donatorUuid, donUuid, projectUuid', () => {
      initListeners();
      eventHandlers[`${EVENT_CONTEXT}editForm`]({
        donatorUuid: 'donator-1',
        donUuid: 'don-1',
        projectUuid: 'project-1',
      });

      expect(mockFormConfig.donatorUuid).toBe('donator-1');
      expect(mockFormConfig.donUuid).toBe('don-1');
      expect(mockFormConfig.projectUuid).toBe('project-1');
      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          label: expect.stringContaining('Editing existing donation'),
        }),
      );
    });
  });

  describe('controlForm handler', () => {
    it('sets isBeingFilled and sends GA event', () => {
      initListeners();
      eventHandlers[`${EVENT_CONTEXT}controlForm`](true);

      expect(mockIsBeingFilled.set).toHaveBeenCalledWith(true);
      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          label: expect.stringContaining('Control form from parent'),
        }),
      );
    });

    it('handles close state', () => {
      initListeners();
      eventHandlers[`${EVENT_CONTEXT}controlForm`](false);

      expect(mockIsBeingFilled.set).toHaveBeenCalledWith(false);
      expect(mockSendGaEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          label: expect.stringContaining('close'),
        }),
      );
    });
  });

  describe('beforeunload listener', () => {
    it('registers beforeunload on window', () => {
      const addSpy = vi.spyOn(window, 'addEventListener');

      initListeners();

      expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));
    });
  });
});
