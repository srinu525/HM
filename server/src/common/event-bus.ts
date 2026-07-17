import { EventEmitter } from "events";
import { logger } from "./logger";

export interface DomainEvent {
  type: string;
  payload: Record<string, unknown>;
  organizationId: string;
  userId?: string;
  timestamp: Date;
}

type EventHandler = (event: DomainEvent) => void | Promise<void>;

class EventBus extends EventEmitter {
  private handlers = new Map<string, EventHandler[]>();

  constructor() {
    super();
    this.setMaxListeners(50);
  }

  registerHandler(event: string, handler: EventHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);
  }

  async emitEvent(event: string, eventData: Omit<DomainEvent, "timestamp">) {
    const fullEvent: DomainEvent = { ...eventData, timestamp: new Date() };
    logger.debug({ eventType: event, organizationId: fullEvent.organizationId }, "Event emitted");

    const handlers = this.handlers.get(event) || [];
    await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(fullEvent);
        } catch (err) {
          logger.error({ err, eventType: event }, "Event handler error");
        }
      })
    );
  }
}

export const eventBus = new EventBus();
