import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileController } from "./controller";
import { authorize } from "../../middleware/auth";

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve("uploads"));
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("File type not allowed"));
    }
  },
});

const router = Router();

router.post("/upload", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), upload.single("file"), fileController.upload);
router.get("/", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), fileController.getByEntity);
router.get("/:id/download", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), fileController.download);
router.delete("/:id", authorize("ADMIN", "RECEPTIONIST", "DOCTOR", "PHARMACIST", "SUPER_ADMIN"), fileController.remove);

export default router;
