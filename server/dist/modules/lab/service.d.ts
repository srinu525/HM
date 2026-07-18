export declare class LabService {
    getTests(organizationId: string): Promise<({
        _count: {
            results: number;
        };
    } & {
        description: string | null;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
    })[]>;
    createTest(data: {
        name: string;
        description?: string;
        price?: number;
    }, organizationId: string): Promise<{
        description: string | null;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
    }>;
    updateTest(id: string, data: {
        name?: string;
        description?: string;
        price?: number;
        isActive?: boolean;
    }, organizationId: string): Promise<{
        description: string | null;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
    }>;
    getResults(organizationId: string, filters: {
        patientId?: string;
        doctorId?: string;
        labTestId?: string;
        status?: string;
    }): Promise<({
        patient: {
            id: string;
            patientId: string;
            name: string;
            phone: string | null;
        };
        doctor: {
            id: string;
            name: string;
        };
        labTest: {
            id: string;
            name: string;
            price: number;
        };
    } & {
        status: string;
        organizationId: string;
        result: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        labTestId: string;
    })[]>;
    createResult(data: {
        labTestId: string;
        patientId: string;
        doctorId: string;
        result: Record<string, unknown>;
        notes?: string;
        status?: string;
    }, organizationId: string): Promise<{
        patient: {
            id: string;
            patientId: string;
            name: string;
        };
        doctor: {
            id: string;
            name: string;
        };
        labTest: {
            id: string;
            name: string;
        };
    } & {
        status: string;
        organizationId: string;
        result: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        labTestId: string;
    }>;
    updateResult(id: string, data: {
        result?: Record<string, unknown>;
        notes?: string;
        status?: string;
    }, organizationId: string): Promise<{
        status: string;
        organizationId: string;
        result: import("@prisma/client/runtime/client").JsonValue;
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        doctorId: string;
        labTestId: string;
    }>;
}
export declare const labService: LabService;
//# sourceMappingURL=service.d.ts.map