import { EventEmitter } from "events";
export interface DomainEvent {
    type: string;
    payload: Record<string, unknown>;
    organizationId: string;
    userId?: string;
    timestamp: Date;
}
type EventHandler = (event: DomainEvent) => void | Promise<void>;
declare class EventBus extends EventEmitter {
    private handlers;
    constructor();
    registerHandler(event: string, handler: EventHandler): void;
    emitEvent(event: string, eventData: Omit<DomainEvent, "timestamp">): Promise<void>;
}
export declare const eventBus: EventBus;
export {};
//# sourceMappingURL=event-bus.d.ts.map