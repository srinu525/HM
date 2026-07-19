import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

export class SchedulingService {
  async getSchedule(userId: string) {
    let schedules = await prisma.staffSchedule.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
    });

    if (schedules.length === 0) {
      const defaults = [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        userId,
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable: true,
      }));
      await prisma.staffSchedule.createMany({ data: defaults });
      schedules = await prisma.staffSchedule.findMany({
        where: { userId },
        orderBy: { dayOfWeek: "asc" },
      });
    }

    return schedules;
  }

  async upsertSchedule(
    userId: string,
    schedules: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[]
  ) {
    const operations = schedules.map((s) =>
      prisma.staffSchedule.upsert({
        where: { userId_dayOfWeek: { userId, dayOfWeek: s.dayOfWeek } },
        update: { startTime: s.startTime, endTime: s.endTime, isAvailable: s.isAvailable },
        create: { userId, dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime, isAvailable: s.isAvailable },
      })
    );
    await prisma.$transaction(operations);
    return prisma.staffSchedule.findMany({
      where: { userId },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  async getDoctorSchedules(organizationId: string) {
    const doctors = await prisma.user.findMany({
      where: { role: "DOCTOR", isActive: true, organizationId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    const schedules = await prisma.staffSchedule.findMany({
      where: { userId: { in: doctors.map((d) => d.id) } },
      orderBy: { dayOfWeek: "asc" },
    });

    return doctors.map((doctor) => ({
      doctor: { id: doctor.id, name: doctor.name },
      schedules: schedules.filter((s) => s.userId === doctor.id),
    }));
  }

  async getLeaveRequests(organizationId: string, status?: string) {
    const leaves = await prisma.leaveRequest.findMany({
      where: {
        organizationId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    const userIds = [...new Set(leaves.map((l) => l.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));

    return leaves.map((l) => ({
      ...l,
      user: userMap.get(l.userId) || null,
    }));
  }

  async createLeaveRequest(
    userId: string,
    data: { startDate: Date; endDate: Date; reason?: string },
    organizationId: string
  ) {
    return prisma.leaveRequest.create({
      data: {
        userId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        organizationId,
      },
    });
  }

  async updateLeaveStatus(
    id: string,
    status: "APPROVED" | "REJECTED",
    approvedBy: string,
    organizationId: string
  ) {
    const leave = await prisma.leaveRequest.findFirst({
      where: { id, organizationId },
    });
    if (!leave) {
      throw AppError.notFound("Leave request not found");
    }
    if (leave.status !== "PENDING") {
      throw AppError.badRequest("Leave request has already been processed");
    }

    return prisma.leaveRequest.update({
      where: { id },
      data: { status, approvedBy },
    });
  }
}

export const schedulingService = new SchedulingService();
