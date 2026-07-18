export declare class PlanService {
    getAll(): Promise<({
        _count: {
            subscriptions: number;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
        maxUsers: number;
        maxPatients: number;
        features: string[];
    })[]>;
    getById(id: string): Promise<{
        _count: {
            subscriptions: number;
        };
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
        maxUsers: number;
        maxPatients: number;
        features: string[];
    }>;
    create(data: {
        name: string;
        description?: string;
        price: number;
        maxUsers: number;
        maxPatients: number;
        features: string[];
    }): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
        maxUsers: number;
        maxPatients: number;
        features: string[];
    }>;
    update(id: string, data: {
        name?: string;
        description?: string;
        price?: number;
        maxUsers?: number;
        maxPatients?: number;
        features?: string[];
        isActive?: boolean;
    }): Promise<{
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
        maxUsers: number;
        maxPatients: number;
        features: string[];
    }>;
    subscribe(organizationId: string, planId: string, months?: number): Promise<{
        plan: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            price: number;
            maxUsers: number;
            maxPatients: number;
            features: string[];
        };
    } & {
        status: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        planId: string;
    }>;
    getOrgSubscription(organizationId: string): Promise<({
        plan: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            price: number;
            maxUsers: number;
            maxPatients: number;
            features: string[];
        };
    } & {
        status: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        planId: string;
    }) | null>;
    cancel(subscriptionId: string, organizationId: string): Promise<{
        plan: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            isActive: boolean;
            price: number;
            maxUsers: number;
            maxPatients: number;
            features: string[];
        };
    } & {
        status: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        startDate: Date;
        endDate: Date | null;
        planId: string;
    }>;
}
export declare const planService: PlanService;
//# sourceMappingURL=service.d.ts.map