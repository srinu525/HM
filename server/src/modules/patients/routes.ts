import { Router } from "express";
import { patientController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

/**
 * @swagger
 * /patients:
 *   get:
 *     tags: [Patients]
 *     summary: Get all patients with search and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name, phone, email, or patientId
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Paginated patient list
 */
router.get("/", authorize("RECEPTIONIST", "DOCTOR"), patientController.getAll);

/**
 * @swagger
 * /patients/{id}:
 *   get:
 *     tags: [Patients]
 *     summary: Get patient by ID
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
 *         description: Patient details
 *       404:
 *         description: Patient not found
 */
router.get("/:id", authorize("RECEPTIONIST", "DOCTOR"), patientController.getById);

/**
 * @swagger
 * /patients:
 *   post:
 *     tags: [Patients]
 *     summary: Register a new patient
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, gender]
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [MALE, FEMALE, OTHER]
 *               dob:
 *                 type: string
 *                 format: date-time
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Patient registered
 */
router.post("/", authorize("RECEPTIONIST"), patientController.create);

/**
 * @swagger
 * /patients/{id}:
 *   put:
 *     tags: [Patients]
 *     summary: Update patient details
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
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               gender:
 *                 type: string
 *               dob:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Patient updated
 *       404:
 *         description: Patient not found
 */
router.put("/:id", authorize("RECEPTIONIST"), patientController.update);

export default router;
