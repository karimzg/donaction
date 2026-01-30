import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

declare global {
  interface Window {
    plausible?: (eventName: string, options?: Record<string, unknown>) => void;
  }
}

vi.mock('../../components/sponsorshipForm/logic/useSponsorshipForm.svelte', () => ({
  SUBSCRIPTION: {
    klubr: { slug: 'test-klub', uuid: 'klub-uuid-123' },
    project: { slug: 'test-project', uuid: 'proj-uuid-456' },
  },
}));

describe('sendGaEvent (analytics enabled)', () => {
  let sendGaEvent: typeof import('../sendGaEvent').sendGaEvent;

  beforeEach(async () => {
    vi.resetModules();
    import.meta.env.VITE_ACTIVATE_ANALYTICS = 'true';
    const mod = await import('../sendGaEvent');
    sendGaEvent = mod.sendGaEvent;
    window.plausible = vi.fn();
  });

  afterEach(() => {
    delete window.plausible;
  });

  it('should call window.plausible with category as event name', () => {
    sendGaEvent({ category: 'form_submitted' });

    expect(window.plausible).toHaveBeenCalledWith('form_submitted', expect.any(Object));
  });

  it('should use custom_event when no category provided', () => {
    sendGaEvent({ label: 'test_label' });

    expect(window.plausible).toHaveBeenCalledWith('custom_event', expect.any(Object));
  });

  it('should include event_label with label', () => {
    sendGaEvent({ label: 'test_label' });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          event_label: 'test_label',
        }),
      }),
    );
  });

  it('should use category when label is not provided', () => {
    sendGaEvent({ category: 'test_category' });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          event_label: 'test_category',
        }),
      }),
    );
  });

  it('should include step in event_label when provided', () => {
    sendGaEvent({ label: 'step_completed', step: 2 });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          event_label: 'step_completed => step: 2',
        }),
      }),
    );
  });

  it('should not include step in event_label when not provided', () => {
    sendGaEvent({ label: 'no_step' });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          event_label: 'no_step',
        }),
      }),
    );
  });

  it('should pass klub_slug from SUBSCRIPTION', () => {
    sendGaEvent({ category: 'test' });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          klub_slug: 'test-klub',
        }),
      }),
    );
  });

  it('should pass project_slug from SUBSCRIPTION', () => {
    sendGaEvent({ category: 'test' });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          project_slug: 'test-project',
        }),
      }),
    );
  });

  it('should pass revenue when provided', () => {
    sendGaEvent({ category: 'donation', revenue: 100.5 });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          revenue: 100.5,
        }),
      }),
    );
  });

  it('should set from_sponsorship_form to true', () => {
    sendGaEvent({ category: 'test' });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          from_sponsorship_form: true,
        }),
      }),
    );
  });

  it('should handle all properties together', () => {
    sendGaEvent({
      category: 'donation_complete',
      label: 'stripe_payment',
      step: 3,
      revenue: 250,
    });

    expect(window.plausible).toHaveBeenCalledWith('donation_complete', {
      props: {
        event_label: 'stripe_payment => step: 3',
        klub_slug: 'test-klub',
        project_slug: 'test-project',
        revenue: 250,
        from_sponsorship_form: true,
      },
    });
  });

  it('should not include step 0 in event_label due to falsy check', () => {
    sendGaEvent({ label: 'form_started', step: 0 });

    expect(window.plausible).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        props: expect.objectContaining({
          event_label: 'form_started',
        }),
      }),
    );
  });
});

describe('sendGaEvent (analytics disabled)', () => {
  let sendGaEvent: typeof import('../sendGaEvent').sendGaEvent;

  beforeEach(async () => {
    vi.resetModules();
    import.meta.env.VITE_ACTIVATE_ANALYTICS = 'false';
    const mod = await import('../sendGaEvent');
    sendGaEvent = mod.sendGaEvent;
    window.plausible = vi.fn();
  });

  afterEach(() => {
    delete window.plausible;
  });

  it('should not call window.plausible when analytics is disabled', () => {
    sendGaEvent({ category: 'test_event' });

    expect(window.plausible).not.toHaveBeenCalled();
  });

  it('should not call window.plausible even with all properties', () => {
    sendGaEvent({
      category: 'donation',
      label: 'stripe',
      step: 2,
      revenue: 100,
    });

    expect(window.plausible).not.toHaveBeenCalled();
  });
});

describe('sendGaEvent (no plausible)', () => {
  let sendGaEvent: typeof import('../sendGaEvent').sendGaEvent;

  beforeEach(async () => {
    vi.resetModules();
    import.meta.env.VITE_ACTIVATE_ANALYTICS = 'true';
    const mod = await import('../sendGaEvent');
    sendGaEvent = mod.sendGaEvent;
    delete window.plausible;
  });

  it('should not throw when window.plausible is undefined', () => {
    expect(() => {
      sendGaEvent({ category: 'test_event' });
    }).not.toThrow();
  });

  it('should not throw when window.plausible is undefined with full data', () => {
    expect(() => {
      sendGaEvent({
        category: 'donation',
        label: 'payment',
        step: 3,
        revenue: 500,
      });
    }).not.toThrow();
  });
});
