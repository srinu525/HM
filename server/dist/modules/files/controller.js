import { fileService } from "./service";
import { sendSuccess, sendCreated } from "../../common/response";
import fs from "fs";
export class FileController {
    async upload(req, res, next) {
        try {
            if (!req.file)
                return next(new Error("No file uploaded"));
            const { entity, entityId } = req.body;
            const record = await fileService.upload(req.file, entity, entityId, req.user.organizationId, req.user.id);
            sendCreated(res, record, "File uploaded");
        }
        catch (error) {
            next(error);
        }
    }
    async getByEntity(req, res, next) {
        try {
            const { entity, entityId } = req.query;
            const files = await fileService.getByEntity(entity, entityId, req.user.organizationId);
            sendSuccess(res, files, "Files fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async download(req, res, next) {
        try {
            const fileInfo = await fileService.getFilePath(req.params.id, req.user.organizationId);
            if (!fs.existsSync(fileInfo.path)) {
                return next(new Error("File not found on disk"));
            }
            res.setHeader("Content-Type", fileInfo.mimeType);
            res.setHeader("Content-Disposition", `attachment; filename="${fileInfo.originalName}"`);
            fs.createReadStream(fileInfo.path).pipe(res);
        }
        catch (error) {
            next(error);
        }
    }
    async remove(req, res, next) {
        try {
            await fileService.delete(req.params.id, req.user.organizationId);
            sendSuccess(res, { deleted: true }, "File deleted");
        }
        catch (error) {
            next(error);
        }
    }
}
export const fileController = new FileController();
//# sourceMappingURL=controller.js.map