import { Router } from "express";
import { pharmacyController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/medicines", authorize("ADMIN", "PHARMACIST", "DOCTOR"), pharmacyController.getAllMedicines);
router.post("/medicines", authorize("ADMIN", "PHARMACIST"), pharmacyController.createMedicine);
router.put("/medicines/:id", authorize("ADMIN", "PHARMACIST"), pharmacyController.updateMedicine);
router.put("/medicines/:id/stock", authorize("ADMIN", "PHARMACIST"), pharmacyController.updateStock);
router.get("/inventory/alerts", authorize("ADMIN", "PHARMACIST"), pharmacyController.getInventoryAlerts);
router.get("/sales", authorize("ADMIN", "PHARMACIST"), pharmacyController.getSales);
router.post("/sales", authorize("PHARMACIST"), pharmacyController.createSale);
router.get("/prescriptions", authorize("ADMIN", "PHARMACIST", "DOCTOR"), pharmacyController.getPrescriptions);
router.get("/prescriptions/:id/pdf", authorize("ADMIN", "PHARMACIST", "DOCTOR"), pharmacyController.downloadPrescriptionPdf);
router.post("/prescriptions", authorize("DOCTOR"), pharmacyController.createPrescription);

export default router;
