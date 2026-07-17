import { Router } from "express";
import { pharmacyController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

/**
 * @swagger
 * /pharmacy/medicines:
 *   get:
 *     tags: [Pharmacy]
 *     summary: Get all medicines
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of medicines
 */
router.get("/medicines", authorize("ADMIN", "PHARMACIST", "DOCTOR"), pharmacyController.getAllMedicines);

/**
 * @swagger
 * /pharmacy/medicines:
 *   post:
 *     tags: [Pharmacy]
 *     summary: Add a new medicine
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, stock]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               batchNumber:
 *                 type: string
 *               reorderLevel:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Medicine created
 */
router.post("/medicines", authorize("ADMIN", "PHARMACIST"), pharmacyController.createMedicine);

/**
 * @swagger
 * /pharmacy/medicines/{id}:
 *   put:
 *     tags: [Pharmacy]
 *     summary: Update a medicine
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicine updated
 */
router.put("/medicines/:id", authorize("ADMIN", "PHARMACIST"), pharmacyController.updateMedicine);

/**
 * @swagger
 * /pharmacy/medicines/{id}/stock:
 *   put:
 *     tags: [Pharmacy]
 *     summary: Update medicine stock level
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [stock]
 *             properties:
 *               stock:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Stock updated
 */
router.put("/medicines/:id/stock", authorize("ADMIN", "PHARMACIST"), pharmacyController.updateStock);

/**
 * @swagger
 * /pharmacy/inventory/alerts:
 *   get:
 *     tags: [Pharmacy]
 *     summary: Get inventory alerts (low stock, expiring, expired)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory alerts
 */
router.get("/inventory/alerts", authorize("ADMIN", "PHARMACIST"), pharmacyController.getInventoryAlerts);

/**
 * @swagger
 * /pharmacy/sales:
 *   get:
 *     tags: [Pharmacy]
 *     summary: Get sales history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sales
 */
router.get("/sales", authorize("ADMIN", "PHARMACIST"), pharmacyController.getSales);

/**
 * @swagger
 * /pharmacy/sales:
 *   post:
 *     tags: [Pharmacy]
 *     summary: Create a new sale
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, items]
 *             properties:
 *               patientId:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [medicineId, quantity]
 *                   properties:
 *                     medicineId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Sale created
 */
router.post("/sales", authorize("PHARMACIST"), pharmacyController.createSale);

/**
 * @swagger
 * /pharmacy/prescriptions:
 *   get:
 *     tags: [Pharmacy]
 *     summary: Get prescriptions with filters
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of prescriptions
 */
router.get("/prescriptions", authorize("ADMIN", "PHARMACIST", "DOCTOR"), pharmacyController.getPrescriptions);

/**
 * @swagger
 * /pharmacy/prescriptions/{id}/pdf:
 *   get:
 *     tags: [Pharmacy]
 *     summary: Download prescription PDF
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: PDF file
 */
router.get("/prescriptions/:id/pdf", authorize("ADMIN", "PHARMACIST", "DOCTOR"), pharmacyController.downloadPrescriptionPdf);

/**
 * @swagger
 * /pharmacy/prescriptions:
 *   post:
 *     tags: [Pharmacy]
 *     summary: Create a new prescription
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, consultationId, items]
 *             properties:
 *               patientId:
 *                 type: string
 *               consultationId:
 *                 type: string
 *               notes:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [medicineId, dosage, duration]
 *                   properties:
 *                     medicineId:
 *                       type: string
 *                     dosage:
 *                       type: string
 *                     duration:
 *                       type: string
 *                     instructions:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Prescription created
 */
router.post("/prescriptions", authorize("DOCTOR"), pharmacyController.createPrescription);

export default router;
