export declare class AdminService {
    getPlatformStats(): Promise<{
        totalOrgs: number;
        activeOrgs: number;
        totalUsers: number;
        activeUsers: number;
        totalPatients: number;
        todayAppointments: number;
        todayRevenue: number;
        recentPatients: number;
        totalMedicines: number;
        recentUsers: number;
    }>;
    getAllOrganizations(): Promise<({
        _count: {
            medicines: number;
            users: number;
            patients: number;
        };
        subscriptions: ({
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
        })[];
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
    getOrganizationById(id: string): Promise<({
        _count: {
            notifications: number;
            medicines: number;
            users: number;
            patients: number;
        };
        subscriptions: ({
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
        })[];
        users: {
            role: import("@prisma/client").$Enums.Role;
            id: string;
            createdAt: Date;
            name: string;
            email: string;
            isActive: boolean;
        }[];
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
    }) | null>;
    createOrganization(data: {
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
    updateOrganization(id: string, data: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
        isActive?: boolean;
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
    getAllUsers(): Promise<{
        role: import("@prisma/client").$Enums.Role;
        organizationId: string | null;
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        email: string;
        organization: {
            id: string;
            name: string;
            slug: string;
        } | null;
        isActive: boolean;
    }[]>;
    updateUser(userId: string, data: {
        isActive?: boolean;
        role?: string;
    }): Promise<{
        role: import("@prisma/client").$Enums.Role;
        organizationId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        phone: string | null;
        email: string;
        password: string;
        isActive: boolean;
    }>;
    getRevenueByOrg(): Promise<{
        orgId: string;
        name: string;
        slug: string;
        totalRevenue: number;
        totalSales: number;
        totalPatients: number;
    }[]>;
    getFeatureFlags(organizationId: string): Promise<{
        description: string | null;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        isEnabled: boolean;
    }[]>;
    setFeatureFlag(organizationId: string, key: string, isEnabled: boolean): Promise<{
        description: string | null;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        key: string;
        isEnabled: boolean;
    }>;
    getPlatformSettings(): Promise<{
        id: string;
        updatedAt: Date;
        key: string;
        value: string;
        category: string;
    }[]>;
    setPlatformSetting(key: string, value: string, category?: string): Promise<{
        id: string;
        updatedAt: Date;
        key: string;
        value: string;
        category: string;
    }>;
}
export declare const adminService: AdminService;
//# sourceMappingURL=service.d.ts.map