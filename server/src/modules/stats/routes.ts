import { Router } from "express";
import { prisma } from "../../utils/prisma";
import { authenticate } from "../../middleware/auth";

const router = Router();
router.use(authenticate);

router.get("/", async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalPatients, todayAppointments, todayRevenue] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({
        where: { date: { gte: today, lt: tomorrow } },
      }),
      prisma.sale.aggregate({
        where: { createdAt: { gte: today, lt: tomorrow } },
        _sum: { total: true },
      }),
    ]);

    res.json({
      totalPatients,
      todayAppointments,
      todayRevenue: todayRevenue._sum.total || 0,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
