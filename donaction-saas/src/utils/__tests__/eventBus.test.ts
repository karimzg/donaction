import { describe, it, expect, vi, beforeEach } from 'vitest';
import eventBus from '../eventBus';

describe('eventBus', () => {
  beforeEach(() => {
    eventBus.events.clear();
  });

  describe('on', () => {
    it('should register a listener for an event', () => {
      const listener = vi.fn();
      eventBus.on('test', listener);
      eventBus.emit('test', 'data');
      expect(listener).toHaveBeenCalledWith('data');
    });

    it('should support multiple listeners for the same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      eventBus.on('test', listener1);
      eventBus.on('test', listener2);
      eventBus.emit('test', 'data');
      expect(listener1).toHaveBeenCalledWith('data');
      expect(listener2).toHaveBeenCalledWith('data');
    });

    it('should support different events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      eventBus.on('event1', listener1);
      eventBus.on('event2', listener2);
      eventBus.emit('event1', 'a');
      expect(listener1).toHaveBeenCalledWith('a');
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe('off', () => {
    it('should remove a specific listener', () => {
      const listener = vi.fn();
      eventBus.on('test', listener);
      eventBus.off('test', listener);
      eventBus.emit('test', 'data');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should only remove the specified listener', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      eventBus.on('test', listener1);
      eventBus.on('test', listener2);
      eventBus.off('test', listener1);
      eventBus.emit('test', 'data');
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith('data');
    });

    it('should do nothing for unknown event', () => {
      expect(() => eventBus.off('unknown', vi.fn())).not.toThrow();
    });

    it('should do nothing for unknown listener', () => {
      const listener = vi.fn();
      eventBus.on('test', listener);
      eventBus.off('test', vi.fn());
      eventBus.emit('test', 'data');
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('emit', () => {
    it('should pass data to listeners', () => {
      const listener = vi.fn();
      eventBus.on('test', listener);
      eventBus.emit('test', { key: 'value' });
      expect(listener).toHaveBeenCalledWith({ key: 'value' });
    });

    it('should do nothing for unknown event', () => {
      expect(() => eventBus.emit('unknown', 'data')).not.toThrow();
    });

    it('should call listeners in registration order', () => {
      const order: number[] = [];
      eventBus.on('test', () => order.push(1));
      eventBus.on('test', () => order.push(2));
      eventBus.on('test', () => order.push(3));
      eventBus.emit('test', null);
      expect(order).toEqual([1, 2, 3]);
    });

    it('should emit undefined when no data provided', () => {
      const listener = vi.fn();
      eventBus.on('test', listener);
      eventBus.emit('test', undefined);
      expect(listener).toHaveBeenCalledWith(undefined);
    });
  });
});
