export declare class AuthService {
    register(name: string, email: string, password: string, role: string, organizationId: string, phone?: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            organizationId: string | null;
            organization: {
                id: string;
                name: string;
                slug: string;
            } | null;
        };
        token: string;
    }>;
    login(email: string, password: string, organizationSlug: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            organizationId: string | null;
            organization: {
                id: string;
                name: string;
                slug: string;
            } | null;
        };
        token: string;
    }>;
    loginSuperAdmin(email: string, password: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
            organizationId: null;
            organization: null;
        };
        token: string;
    }>;
    getProfile(userId: string): Promise<{
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
    }>;
    private generateToken;
}
export declare const authService: AuthService;
//# sourceMappingURL=service.d.ts.map