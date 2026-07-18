export declare class ConsultationService {
    create(data: {
        appointmentId: string;
        doctorId: string;
        diagnosis?: string;
        notes?: string;
    }): Promise<{
        appointment: {
            patient: {
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
        };
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        appointmentId: string;
        diagnosis: string | null;
    }>;
    getByDoctor(doctorId: string): Promise<({
        appointment: {
            patient: {
                id: string;
                patientId: string;
                name: string;
                phone: string | null;
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
        };
        prescriptions: {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            consultationId: string;
        }[];
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        appointmentId: string;
        diagnosis: string | null;
    })[]>;
    getTodayCompletedByDoctor(doctorId: string): Promise<({
        appointment: {
            patient: {
                id: string;
                patientId: string;
                name: string;
                phone: string | null;
                gender: import("@prisma/client").$Enums.Gender;
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
        };
        prescriptions: ({
            items: ({
                medicine: {
                    id: string;
                    name: string;
                };
            } & {
                id: string;
                quantity: number;
                medicineId: string;
                dosage: string;
                duration: string;
                instructions: string | null;
                prescriptionId: string;
            })[];
        } & {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            consultationId: string;
        })[];
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        appointmentId: string;
        diagnosis: string | null;
    })[]>;
    getByPatient(patientId: string): Promise<({
        appointment: {
            token: number;
            date: Date;
        };
        doctor: {
            name: string;
        };
        prescriptions: ({
            items: ({
                medicine: {
                    name: string;
                };
            } & {
                id: string;
                quantity: number;
                medicineId: string;
                dosage: string;
                duration: string;
                instructions: string | null;
                prescriptionId: string;
            })[];
        } & {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            patientId: string;
            consultationId: string;
        })[];
    } & {
        id: string;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
        doctorId: string;
        appointmentId: string;
        diagnosis: string | null;
    })[]>;
}
export declare const consultationService: ConsultationService;
//# sourceMappingURL=service.d.ts.map