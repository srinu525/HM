import { prisma } from "../../utils/prisma";

export class UserService {
  async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    return user;
  }

  async updateUser(id: string, data: { name?: string; phone?: string; role?: string; isActive?: boolean }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }

    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        role: data.role ? (data.role as any) : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async getDoctors() {
    return prisma.user.findMany({
      where: { role: "DOCTOR", isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
      orderBy: { name: "asc" },
    });
  }
}

export const userService = new UserService();
