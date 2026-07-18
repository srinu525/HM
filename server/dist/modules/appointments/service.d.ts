export declare class AppointmentService {
    create(data: {
        patientId: string;
        doctorId: string;
        notes?: string;
        consultationFee?: number;
        validUntil?: string;
    }, organizationId: string): Promise<{
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
    } & {
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
    }>;
    getByDoctor(doctorId: string, organizationId: string): Promise<({
        patient: {
            id: string;
            patientId: string;
            name: string;
            phone: string | null;
            gender: import("@prisma/client").$Enums.Gender;
        };
    } & {
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
    })[]>;
    updateStatus(id: string, status: string, organizationId: string): Promise<{
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
    }>;
    getQueue(doctorId: string, organizationId: string): Promise<({
        patient: {
            id: string;
            patientId: string;
            name: string;
            phone: string | null;
            gender: import("@prisma/client").$Enums.Gender;
            age: number;
            dob: Date | null;
        };
    } & {
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
    })[]>;
    getTodayAll(organizationId: string): Promise<({
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
    } & {
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
    })[]>;
}
export declare const appointmentService: AppointmentService;
//# sourceMappingURL=service.d.ts.map