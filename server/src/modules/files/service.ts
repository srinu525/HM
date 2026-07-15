import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";
import path from "path";
import fs from "fs";

const UPLOAD_DIR = path.resolve("uploads");

export class FileService {
  async upload(file: Express.Multer.File, entity: string, entityId: string, organizationId: string, uploadedById?: string) {
    const record = await prisma.fileAttachment.create({
      data: {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
        entity,
        entityId,
        organizationId,
        uploadedById,
      },
    });
    return record;
  }

  async getByEntity(entity: string, entityId: string, organizationId: string) {
    return prisma.fileAttachment.findMany({
      where: { entity, entityId, organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async delete(id: string, organizationId: string) {
    const file = await prisma.fileAttachment.findFirst({
      where: { id, organizationId },
    });
    if (!file) throw AppError.notFound("File not found");

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    await prisma.fileAttachment.delete({ where: { id } });
    return { deleted: true };
  }

  async getFilePath(id: string, organizationId: string) {
    const file = await prisma.fileAttachment.findFirst({
      where: { id, organizationId },
    });
    if (!file) throw AppError.notFound("File not found");
    return { path: file.path, mimeType: file.mimeType, originalName: file.originalName };
  }
}

export const fileService = new FileService();
