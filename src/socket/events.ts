// Fallback definition for OrderEvent when ./order.events is not available.
// Use a string type so it can be used as Record keys. Replace or remove
// this definition if a concrete OrderEvent enum/type exists elsewhere.
export type OrderEvent = string;

type EventPayloads = {
  [key in OrderEvent]: any;
};

class EventBus {
  private listeners: Partial<Record<OrderEvent, Function[]>> = {};

  emit<T extends OrderEvent>(event: T, data: any) {
    this.listeners[event]?.forEach((cb) => cb(data));
  }

  on<T extends OrderEvent>(event: T, cb: (data: any) => void) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(cb);
  }
}

export const eventBus = new EventBus();