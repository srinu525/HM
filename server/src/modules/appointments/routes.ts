import { Router } from "express";
import { appointmentController } from "./controller";
import { authorize } from "../../middleware/auth";

const router = Router();

/**
 * @swagger
 * /appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Book a new appointment
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [patientId, doctorId]
 *             properties:
 *               patientId:
 *                 type: string
 *               doctorId:
 *                 type: string
 *               notes:
 *                 type: string
 *               consultationFee:
 *                 type: number
 *     responses:
 *       201:
 *         description: Appointment booked
 */
router.post("/", authorize("ADMIN", "RECEPTIONIST"), appointmentController.create);

/**
 * @swagger
 * /appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Get today's appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of today's appointments
 */
router.get("/", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), appointmentController.getTodayAll);

/**
 * @swagger
 * /appointments/doctor/{doctorId}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get appointments for a specific doctor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor's appointments
 */
router.get("/doctor/:doctorId", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), appointmentController.getByDoctor);

/**
 * @swagger
 * /appointments/queue/{doctorId}:
 *   get:
 *     tags: [Appointments]
 *     summary: Get queue for a specific doctor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Doctor's queue
 */
router.get("/queue/:doctorId", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), appointmentController.getQueue);

/**
 * @swagger
 * /appointments/{id}/status:
 *   put:
 *     tags: [Appointments]
 *     summary: Update appointment status
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put("/:id/status", authorize("ADMIN", "RECEPTIONIST", "DOCTOR"), appointmentController.updateStatus);

export default router;
