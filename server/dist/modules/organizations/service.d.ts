export declare class OrganizationService {
    getAll(): Promise<({
        _count: {
            users: number;
            patients: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        isActive: boolean;
        slug: string;
    })[]>;
    getById(id: string): Promise<{
        _count: {
            users: number;
            patients: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        isActive: boolean;
        slug: string;
    }>;
    create(data: {
        name: string;
        slug: string;
        email?: string;
        phone?: string;
        address?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        isActive: boolean;
        slug: string;
    }>;
    update(id: string, data: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        isActive?: boolean;
    }): Promise<{
        _count: {
            users: number;
            patients: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        isActive: boolean;
        slug: string;
    }>;
    getStats(id: string): Promise<{
        _count: {
            notifications: number;
            medicines: number;
            users: number;
            patients: number;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        email: string | null;
        address: string | null;
        isActive: boolean;
        slug: string;
    }>;
}
export declare const organizationService: OrganizationService;
//# sourceMappingURL=service.d.ts.map