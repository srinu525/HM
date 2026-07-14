import { Router } from "express";
import { pharmacyController } from "./controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/medicines", pharmacyController.getAllMedicines);
router.post("/medicines", authorize("ADMIN", "PHARMACIST"), pharmacyController.createMedicine);
router.put("/medicines/:id/stock", authorize("ADMIN", "PHARMACIST"), pharmacyController.updateStock);
router.post("/sales", authorize("PHARMACIST"), pharmacyController.createSale);
router.get("/sales", pharmacyController.getSales);
router.post("/prescriptions", authorize("DOCTOR"), pharmacyController.createPrescription);

export default router;
