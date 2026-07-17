import { Response, NextFunction } from "express";
import { fileService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";
import fs from "fs";

export class FileController {
  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) return next(new Error("No file uploaded"));
      const { entity, entityId } = req.body;
      const record = await fileService.upload(req.file, entity, entityId, req.user!.organizationId as string, req.user!.id);
      sendCreated(res, record, "File uploaded");
    } catch (error) {
      next(error);
    }
  }

  async getByEntity(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { entity, entityId } = req.query;
      const files = await fileService.getByEntity(entity as string, entityId as string, req.user!.organizationId as string);
      sendSuccess(res, files, "Files fetched");
    } catch (error) {
      next(error);
    }
  }

  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const fileInfo = await fileService.getFilePath(req.params.id as string, req.user!.organizationId as string);
      if (!fs.existsSync(fileInfo.path)) {
        return next(new Error("File not found on disk"));
      }
      res.setHeader("Content-Type", fileInfo.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${fileInfo.originalName}"`);
      fs.createReadStream(fileInfo.path).pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async remove(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await fileService.delete(req.params.id as string, req.user!.organizationId as string);
      sendSuccess(res, { deleted: true }, "File deleted");
    } catch (error) {
      next(error);
    }
  }
}

export const fileController = new FileController();
