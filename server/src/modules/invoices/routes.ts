import { Router } from "express";
import { invoiceController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/stats", invoiceController.getStats);
router.get("/", invoiceController.getAll);
router.get("/:id", invoiceController.getById);
router.post("/", authorize("ADMIN", "RECEPTIONIST"), invoiceController.create);
router.put("/:id/status", authorize("ADMIN"), invoiceController.updateStatus);
router.delete("/:id", authorize("ADMIN"), invoiceController.delete);
router.get("/:id/pdf", invoiceController.downloadPdf);

router.post("/payments", authorize("ADMIN", "RECEPTIONIST"), invoiceController.recordPayment);
router.get("/payments/list", invoiceController.getPayments);

export default router;
