export declare class PatientService {
    create(data: {
        name: string;
        phone: string;
        email?: string;
        gender: string;
        age: number;
        dob?: string;
        address: string;
    }, organizationId: string): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        name: string;
        phone: string | null;
        email: string | null;
        gender: import("@prisma/client").$Enums.Gender;
        age: number;
        dob: Date | null;
        address: string | null;
    }>;
    getAll(search: string | undefined, organizationId: string, page?: number, limit?: number): Promise<{
        patients: {
            organizationId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            name: string;
            phone: string | null;
            email: string | null;
            gender: import("@prisma/client").$Enums.Gender;
            age: number;
            dob: Date | null;
            address: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string, organizationId: string): Promise<{
        appointments: {
            status: import("@prisma/client").$Enums.AppointmentStatus;
            id: string;
            token: number;
            date: Date;
            validUntil: Date | null;
            notes: string | null;
            consultationFee: number;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            doctorId: string;
        }[];
        prescriptions: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            consultationId: string;
        }[];
    } & {
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        name: string;
        phone: string | null;
        email: string | null;
        gender: import("@prisma/client").$Enums.Gender;
        age: number;
        dob: Date | null;
        address: string | null;
    }>;
    update(id: string, data: {
        name?: string;
        phone?: string;
        email?: string;
        age?: number;
        dob?: string;
        address?: string;
    }, organizationId: string): Promise<{
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string;
        name: string;
        phone: string | null;
        email: string | null;
        gender: import("@prisma/client").$Enums.Gender;
        age: number;
        dob: Date | null;
        address: string | null;
    }>;
}
export declare const patientService: PatientService;
//# sourceMappingURL=service.d.ts.map