export declare class PharmacyService {
    getAllMedicines(search: string | undefined, organizationId: string): Promise<{
        description: string | null;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
        stock: number;
        expiryDate: Date | null;
        batchNumber: string | null;
        reorderLevel: number;
    }[]>;
    createMedicine(data: {
        name: string;
        description?: string;
        price: number;
        stock: number;
        expiryDate?: string;
        batchNumber?: string;
        reorderLevel?: number;
    }, organizationId: string): Promise<{
        description: string | null;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
        stock: number;
        expiryDate: Date | null;
        batchNumber: string | null;
        reorderLevel: number;
    }>;
    updateStock(id: string, stock: number, organizationId: string): Promise<{
        description: string | null;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        isActive: boolean;
        price: number;
        stock: number;
        expiryDate: Date | null;
        batchNumber: string | null;
        reorderLevel: number;
    }>;
    updateMedicine(id: string, data: {
        name?: string;
        description?: string;
        price?: number;
        stock?: number;
        expiryDate?: string;
        batchNumber?: string;
        reorderLevel?: number;
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
        stock: number;
        expiryDate: Date | null;
        batchNumber: string | null;
        reorderLevel: number;
    }>;
    getInventoryAlerts(organizationId: string): Promise<{
        lowStock: {
            id: string;
            name: string;
            price: number;
            stock: number;
            expiryDate: Date | null;
            batchNumber: string | null;
            reorderLevel: number;
        }[];
        expiringSoon: {
            id: string;
            name: string;
            price: number;
            stock: number;
            expiryDate: Date | null;
            batchNumber: string | null;
            reorderLevel: number;
        }[];
        expired: {
            id: string;
            name: string;
            price: number;
            stock: number;
            expiryDate: Date | null;
            batchNumber: string | null;
            reorderLevel: number;
        }[];
    }>;
    createSale(data: {
        patientId: string;
        items: {
            medicineId: string;
            quantity: number;
        }[];
    }, organizationId: string): Promise<{
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
    }>;
    getSales(organizationId: string): Promise<({
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
    getPrescriptions(filters: {
        patientId?: string;
        doctorId?: string;
        startDate?: string;
        endDate?: string;
    }, organizationId: string): Promise<({
        patient: {
            id: string;
            patientId: string;
            name: string;
            phone: string | null;
        };
        consultation: {
            appointment: {
                token: number;
                date: Date;
            };
            doctor: {
                id: string;
                name: string;
            };
        } & {
            id: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
            doctorId: string;
            appointmentId: string;
            diagnosis: string | null;
        };
        items: ({
            medicine: {
                id: string;
                name: string;
                price: number;
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
    })[]>;
    createPrescription(data: {
        patientId: string;
        consultationId: string;
        notes?: string;
        items: {
            medicineId: string;
            dosage: string;
            duration: string;
            instructions?: string;
            quantity?: number;
        }[];
    }, organizationId: string): Promise<{
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
    }>;
}
export declare const pharmacyService: PharmacyService;
//# sourceMappingURL=service.d.ts.map