export declare class StatsService {
    getBasicStats(organizationId: string): Promise<{
        totalPatients: number;
        todayAppointments: number;
        todayRevenue: number;
    }>;
    getSystemStats(): Promise<{
        totalOrgs: number;
        activeOrgs: number;
        totalUsers: number;
        activeUsers: number;
        totalPatients: number;
        todayAppointments: number;
        todayRevenue: number;
        recentPatients: number;
        totalMedicines: number;
    }>;
    getSystemAnalytics(): Promise<{
        date: string;
        appointments: number;
        patients: number;
        revenue: number;
    }[]>;
    getAnalytics(organizationId: string): Promise<{
        weeklyStats: {
            date: string;
            appointments: number;
            patients: number;
            revenue: number;
        }[];
        monthlyStats: {
            date: string;
            appointments: number;
            patients: number;
            revenue: number;
        }[];
        totalPatients: number;
        todayAppointments: number;
        todayRevenue: number;
    }>;
    private getDailyStats;
    getAppointmentHistory(filters: any, organizationId: string): Promise<({
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
        consultation: ({
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
        }) | null;
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
    getSalesHistory(filters: any, organizationId: string): Promise<({
        patient: {
            id: string;
            patientId: string;
            name: string;
        };
        items: ({
            medicine: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            total: number;
            quantity: number;
            unitPrice: number;
            medicineId: string;
            saleId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        patientId: string;
        total: number;
    })[]>;
}
export declare const statsService: StatsService;
//# sourceMappingURL=service.d.ts.map