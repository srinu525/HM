import { Router } from "express";
import { patientPortalController } from "./controller";
import { patientAuthenticate } from "./middleware";

const router = Router();

/**
 * @swagger
 * /patient/auth/login:
 *   post:
 *     summary: Patient login
 *     tags: [Patient Portal]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, organizationSlug]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               organizationSlug:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post("/auth/login", patientPortalController.login);

/**
 * @swagger
 * /patient/profile:
 *   get:
 *     summary: Get patient profile
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 */
router.get("/profile", patientAuthenticate, patientPortalController.getProfile);

/**
 * @swagger
 * /patient/profile:
 *   put:
 *     summary: Update patient profile
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put("/profile", patientAuthenticate, patientPortalController.updateProfile);

/**
 * @swagger
 * /patient/appointments:
 *   get:
 *     summary: Get my appointments
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments fetched
 */
router.get("/appointments", patientAuthenticate, patientPortalController.getAppointments);

/**
 * @swagger
 * /patient/appointments:
 *   post:
 *     summary: Book an appointment
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId]
 *             properties:
 *               doctorId:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Appointment booked
 */
router.post("/appointments", patientAuthenticate, patientPortalController.bookAppointment);

/**
 * @swagger
 * /patient/appointments/{id}/cancel:
 *   put:
 *     summary: Cancel an appointment
 *     tags: [Patient Portal]
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
 *         description: Appointment cancelled
 */
router.put("/appointments/:id/cancel", patientAuthenticate, patientPortalController.cancelAppointment);

/**
 * @swagger
 * /patient/doctors:
 *   get:
 *     summary: Get available doctors
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctors fetched
 */
router.get("/doctors", patientAuthenticate, patientPortalController.getDoctors);

/**
 * @swagger
 * /patient/prescriptions:
 *   get:
 *     summary: Get my prescriptions
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Prescriptions fetched
 */
router.get("/prescriptions", patientAuthenticate, patientPortalController.getPrescriptions);

/**
 * @swagger
 * /patient/lab-results:
 *   get:
 *     summary: Get my lab results
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lab results fetched
 */
router.get("/lab-results", patientAuthenticate, patientPortalController.getLabResults);

/**
 * @swagger
 * /patient/invoices:
 *   get:
 *     summary: Get my invoices
 *     tags: [Patient Portal]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices fetched
 */
router.get("/invoices", patientAuthenticate, patientPortalController.getInvoices);

/**
 * @swagger
 * /patient/invoices/{id}/pay:
 *   post:
 *     summary: Pay an invoice
 *     tags: [Patient Portal]
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
 *         description: Payment successful
 */
router.post("/invoices/:id/pay", patientAuthenticate, patientPortalController.payInvoice);

/**
 * @swagger
 * /patient/invoices/{id}/pdf:
 *   get:
 *     summary: Download invoice PDF
 *     tags: [Patient Portal]
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
router.get("/invoices/:id/pdf", patientAuthenticate, patientPortalController.downloadInvoicePdf);

export default router;
