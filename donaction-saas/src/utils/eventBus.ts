const eventBus = {
  events: new Map(),

  on(event, listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(listener);
  },

  off(event, listenerToRemove) {
    if (!this.events.has(event)) return;
    const listeners = this.events.get(event).filter((listener) => listener !== listenerToRemove);
    this.events.set(event, listeners);
  },

  emit(event, data) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach((listener) => listener(data));
  }
};

export default eventBus;
