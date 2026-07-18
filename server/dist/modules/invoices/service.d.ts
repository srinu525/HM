export declare class InvoiceService {
    getAll(organizationId: string, filters: {
        status?: string;
        patientId?: string;
    }): Promise<({
        patient: {
            id: string;
            patientId: string;
            name: string;
            phone: string | null;
        } | null;
        payments: {
            method: string;
            status: string;
            organizationId: string;
            id: string;
            notes: string | null;
            createdAt: Date;
            patientId: string | null;
            amount: number;
            invoiceId: string | null;
            reference: string | null;
        }[];
        subscription: ({
            plan: {
                name: string;
                price: number;
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
        }) | null;
        items: {
            description: string;
            id: string;
            total: number;
            quantity: number;
            unitPrice: number;
            invoiceId: string;
        }[];
    } & {
        description: string | null;
        status: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string | null;
        subscriptionId: string | null;
        total: number;
        invoiceNumber: string;
        amount: number;
        tax: number;
        dueDate: Date | null;
        paidAt: Date | null;
    })[]>;
    getById(id: string, organizationId: string): Promise<{
        patient: {
            id: string;
            patientId: string;
            name: string;
            phone: string | null;
            email: string | null;
            address: string | null;
        } | null;
        organization: {
            name: string;
            phone: string | null;
            email: string | null;
            address: string | null;
        };
        payments: {
            method: string;
            status: string;
            organizationId: string;
            id: string;
            notes: string | null;
            createdAt: Date;
            patientId: string | null;
            amount: number;
            invoiceId: string | null;
            reference: string | null;
        }[];
        subscription: ({
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
        }) | null;
        items: {
            description: string;
            id: string;
            total: number;
            quantity: number;
            unitPrice: number;
            invoiceId: string;
        }[];
    } & {
        description: string | null;
        status: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string | null;
        subscriptionId: string | null;
        total: number;
        invoiceNumber: string;
        amount: number;
        tax: number;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    create(data: {
        description?: string;
        patientId?: string;
        subscriptionId?: string;
        tax?: number;
        dueDate?: string;
        items: {
            description: string;
            quantity: number;
            unitPrice: number;
        }[];
    }, organizationId: string): Promise<{
        patient: {
            id: string;
            patientId: string;
            name: string;
        } | null;
        items: {
            description: string;
            id: string;
            total: number;
            quantity: number;
            unitPrice: number;
            invoiceId: string;
        }[];
    } & {
        description: string | null;
        status: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string | null;
        subscriptionId: string | null;
        total: number;
        invoiceNumber: string;
        amount: number;
        tax: number;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    updateStatus(id: string, status: string, organizationId: string): Promise<{
        description: string | null;
        status: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string | null;
        subscriptionId: string | null;
        total: number;
        invoiceNumber: string;
        amount: number;
        tax: number;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    delete(id: string, organizationId: string): Promise<{
        description: string | null;
        status: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        patientId: string | null;
        subscriptionId: string | null;
        total: number;
        invoiceNumber: string;
        amount: number;
        tax: number;
        dueDate: Date | null;
        paidAt: Date | null;
    }>;
    recordPayment(data: {
        invoiceId?: string;
        patientId?: string;
        amount: number;
        method?: string;
        reference?: string;
        notes?: string;
    }, organizationId: string): Promise<{
        patient: {
            id: string;
            patientId: string;
            name: string;
        } | null;
    } & {
        method: string;
        status: string;
        organizationId: string;
        id: string;
        notes: string | null;
        createdAt: Date;
        patientId: string | null;
        amount: number;
        invoiceId: string | null;
        reference: string | null;
    }>;
    getPayments(organizationId: string, filters: {
        patientId?: string;
        method?: string;
    }): Promise<({
        patient: {
            id: string;
            patientId: string;
            name: string;
        } | null;
        invoice: {
            id: string;
            total: number;
            invoiceNumber: string;
        } | null;
    } & {
        method: string;
        status: string;
        organizationId: string;
        id: string;
        notes: string | null;
        createdAt: Date;
        patientId: string | null;
        amount: number;
        invoiceId: string | null;
        reference: string | null;
    })[]>;
    getStats(organizationId: string): Promise<{
        totalInvoices: number;
        pendingInvoices: number;
        totalRevenue: number;
        last30DaysRevenue: number;
    }>;
}
export declare const invoiceService: InvoiceService;
//# sourceMappingURL=service.d.ts.map