import { Router } from "express";
import { invoiceController } from "./controller";
import { authorizePermission } from "../permissions/middleware";

const router = Router();

router.get("/stats", authorizePermission("invoices.read"), invoiceController.getStats);
router.get("/payments/list", authorizePermission("invoices.read"), invoiceController.getPayments);
router.get("/", authorizePermission("invoices.read"), invoiceController.getAll);
router.get("/:id", authorizePermission("invoices.read"), invoiceController.getById);
router.get("/:id/pdf", authorizePermission("invoices.read"), invoiceController.downloadPdf);
router.post("/", authorizePermission("invoices.create"), invoiceController.create);
router.post("/payments", authorizePermission("invoices.create"), invoiceController.recordPayment);
router.put("/:id/status", authorizePermission("invoices.update"), invoiceController.updateStatus);
router.delete("/:id", authorizePermission("invoices.delete"), invoiceController.delete);

export default router;
