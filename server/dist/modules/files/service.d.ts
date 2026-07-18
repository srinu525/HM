export declare class FileService {
    upload(file: Express.Multer.File, entity: string, entityId: string, organizationId: string, uploadedById?: string): Promise<{
        path: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        size: number;
        entity: string;
        entityId: string;
        filename: string;
        originalName: string;
        mimeType: string;
        uploadedById: string | null;
    }>;
    getByEntity(entity: string, entityId: string, organizationId: string): Promise<{
        path: string;
        organizationId: string;
        id: string;
        createdAt: Date;
        size: number;
        entity: string;
        entityId: string;
        filename: string;
        originalName: string;
        mimeType: string;
        uploadedById: string | null;
    }[]>;
    delete(id: string, organizationId: string): Promise<{
        deleted: boolean;
    }>;
    getFilePath(id: string, organizationId: string): Promise<{
        path: string;
        mimeType: string;
        originalName: string;
    }>;
}
export declare const fileService: FileService;
//# sourceMappingURL=service.d.ts.map