import { Router } from "express";
import { invoiceController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

router.get("/stats", authorize("ADMIN", "RECEPTIONIST"), invoiceController.getStats);
router.get("/", authorize("ADMIN", "RECEPTIONIST"), invoiceController.getAll);
router.get("/:id", authorize("ADMIN", "RECEPTIONIST"), invoiceController.getById);
router.post("/", authorize("ADMIN", "RECEPTIONIST"), invoiceController.create);
router.put("/:id/status", authorize("ADMIN"), invoiceController.updateStatus);
router.delete("/:id", authorize("ADMIN"), invoiceController.delete);
router.get("/:id/pdf", authorize("ADMIN", "RECEPTIONIST"), invoiceController.downloadPdf);

router.post("/payments", authorize("ADMIN", "RECEPTIONIST"), invoiceController.recordPayment);
router.get("/payments/list", authorize("ADMIN", "RECEPTIONIST"), invoiceController.getPayments);

export default router;
