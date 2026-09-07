import { Router } from "express";
import { pharmacyController } from "./controller";
import { authorizePermission } from "../permissions/middleware";

const router = Router();

// Medicines — any role with pharmacy.read can view
router.get("/medicines", authorizePermission("pharmacy.read"), pharmacyController.getAllMedicines);
router.post("/medicines", authorizePermission("pharmacy.create"), pharmacyController.createMedicine);
router.put("/medicines/:id", authorizePermission("pharmacy.update"), pharmacyController.updateMedicine);
router.put("/medicines/:id/stock", authorizePermission("pharmacy.update"), pharmacyController.updateStock);

// Inventory alerts
router.get("/inventory/alerts", authorizePermission("pharmacy.read"), pharmacyController.getInventoryAlerts);

// Sales
router.get("/sales", authorizePermission("pharmacy.read"), pharmacyController.getSales);
router.post("/sales", authorizePermission("pharmacy.create"), pharmacyController.createSale);

// Prescriptions
router.get("/prescriptions", authorizePermission("prescriptions.read"), pharmacyController.getPrescriptions);
router.get("/prescriptions/:id/pdf", authorizePermission("prescriptions.read"), pharmacyController.downloadPrescriptionPdf);
router.post("/prescriptions", authorizePermission("prescriptions.create"), pharmacyController.createPrescription);

export default router;
