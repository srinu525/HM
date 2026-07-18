export declare class UserService {
    getAllUsers(organizationId: string): Promise<{
        role: import("@prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        email: string;
        isActive: boolean;
    }[]>;
    getUserById(id: string, organizationId: string): Promise<{
        role: import("@prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        email: string;
        isActive: boolean;
    }>;
    updateUser(id: string, data: {
        name?: string;
        phone?: string;
        role?: string;
        isActive?: boolean;
    }, organizationId: string): Promise<{
        role: import("@prisma/client").$Enums.Role;
        id: string;
        createdAt: Date;
        name: string;
        phone: string | null;
        email: string;
        isActive: boolean;
    }>;
    getDoctors(organizationId: string): Promise<{
        id: string;
        name: string;
        phone: string | null;
        email: string;
    }[]>;
}
export declare const userService: UserService;
//# sourceMappingURL=service.d.ts.map