import { EventEmitter } from "events";
import { logger } from "./logger";
class EventBus extends EventEmitter {
    handlers = new Map();
    constructor() {
        super();
        this.setMaxListeners(50);
    }
    registerHandler(event, handler) {
        if (!this.handlers.has(event)) {
            this.handlers.set(event, []);
        }
        this.handlers.get(event).push(handler);
    }
    async emitEvent(event, eventData) {
        const fullEvent = { ...eventData, timestamp: new Date() };
        logger.debug({ eventType: event, organizationId: fullEvent.organizationId }, "Event emitted");
        const handlers = this.handlers.get(event) || [];
        await Promise.allSettled(handlers.map(async (handler) => {
            try {
                await handler(fullEvent);
            }
            catch (err) {
                logger.error({ err, eventType: event }, "Event handler error");
            }
        }));
    }
}
export const eventBus = new EventBus();
//# sourceMappingURL=event-bus.js.map