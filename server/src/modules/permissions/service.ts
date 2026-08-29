import { Role } from "@prisma/client";
import { prisma } from "../../utils/prisma";
import { AppError } from "../../common/errors/AppError";

const DEFAULT_PERMISSIONS = [
  { module: "patients", action: "read" },
  { module: "patients", action: "create" },
  { module: "patients", action: "update" },
  { module: "patients", action: "delete" },
  { module: "appointments", action: "read" },
  { module: "appointments", action: "create" },
  { module: "appointments", action: "update" },
  { module: "appointments", action: "delete" },
  { module: "consultations", action: "read" },
  { module: "consultations", action: "create" },
  { module: "consultations", action: "update" },
  { module: "prescriptions", action: "read" },
  { module: "prescriptions", action: "create" },
  { module: "pharmacy", action: "read" },
  { module: "pharmacy", action: "create" },
  { module: "pharmacy", action: "update" },
  { module: "pharmacy", action: "delete" },
  { module: "lab", action: "read" },
  { module: "lab", action: "create" },
  { module: "lab", action: "update" },
  { module: "invoices", action: "read" },
  { module: "invoices", action: "create" },
  { module: "invoices", action: "update" },
  { module: "invoices", action: "delete" },
  { module: "users", action: "read" },
  { module: "users", action: "create" },
  { module: "users", action: "update" },
  { module: "users", action: "delete" },
  { module: "departments", action: "read" },
  { module: "departments", action: "create" },
  { module: "departments", action: "update" },
  { module: "departments", action: "delete" },
  { module: "settings", action: "read" },
  { module: "settings", action: "update" },
  { module: "audit-logs", action: "read" },
  { module: "reports", action: "read" },
  { module: "notifications", action: "read" },
  { module: "notifications", action: "create" },
];

export class PermissionService {
  async getAll() {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: "asc" }, { action: "asc" }],
    });

    const grouped: Record<string, typeof permissions> = {};
    for (const p of permissions) {
      if (!grouped[p.module]) grouped[p.module] = [];
      grouped[p.module].push(p);
    }
    return grouped;
  }

  async getRolePermissions(role: Role) {
    const rolePerms = await prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });
    return rolePerms.map((rp) => rp.permission);
  }

  async setRolePermissions(role: Role, permissionIds: string[]) {
    await prisma.rolePermission.deleteMany({ where: { role } });

    if (permissionIds.length === 0) return [];

    const permissions = await prisma.permission.findMany({
      where: { id: { in: permissionIds } },
    });
    if (permissions.length !== permissionIds.length) {
      throw AppError.badRequest("One or more permission IDs are invalid");
    }

    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({ role, permissionId })),
    });

    return this.getRolePermissions(role);
  }

  async getUserPermissions(userId: string) {
    const userPerms = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });
    return userPerms.map((up) => ({
      id: up.id,
      permissionId: up.permissionId,
      granted: up.granted,
      permission: up.permission,
    }));
  }

  async setUserPermissions(
    userId: string,
    permissions: { permissionId: string; granted: boolean }[]
  ) {
    await prisma.userPermission.deleteMany({ where: { userId } });

    if (permissions.length === 0) return [];

    const permIds = permissions.map((p) => p.permissionId);
    const existing = await prisma.permission.findMany({
      where: { id: { in: permIds } },
    });
    if (existing.length !== permIds.length) {
      throw AppError.badRequest("One or more permission IDs are invalid");
    }

    await prisma.userPermission.createMany({
      data: permissions.map((p) => ({
        userId,
        permissionId: p.permissionId,
        granted: p.granted,
      })),
    });

    return this.getUserPermissions(userId);
  }

  async seedPermissions() {
    const results: { created: number; skipped: number } = { created: 0, skipped: 0 };

    for (const def of DEFAULT_PERMISSIONS) {
      const name = `${def.module}.${def.action}`;
      const existing = await prisma.permission.findUnique({ where: { name } });
      if (existing) {
        results.skipped++;
        continue;
      }
      await prisma.permission.create({
        data: { name, module: def.module, action: def.action },
      });
      results.created++;
    }

    return results;
  }

  async getMyPermissions(userId: string, role: Role, organizationId: string): Promise<string[]> {
    if (role === "SUPER_ADMIN") {
      const all = await prisma.permission.findMany();
      return all.map((p) => p.name);
    }

    const rolePerms = await prisma.rolePermission.findMany({
      where: { role },
      select: { permissionId: true },
    });
    const rolePermIds = new Set(rolePerms.map((rp) => rp.permissionId));

    const userPerms = await prisma.userPermission.findMany({
      where: { userId },
      select: { permissionId: true, granted: true },
    });

    const allPermIds = new Set([...rolePermIds, ...userPerms.filter((up) => up.granted).map((up) => up.permissionId)]);
    const revokedIds = new Set(userPerms.filter((up) => !up.granted).map((up) => up.permissionId));

    const finalIds = [...allPermIds].filter((id) => !revokedIds.has(id));
    if (finalIds.length === 0) return [];

    const permissions = await prisma.permission.findMany({
      where: { id: { in: finalIds } },
      select: { name: true },
    });
    return permissions.map((p) => p.name);
  }

  async hasPermission(userId: string, role: Role, permissionName: string): Promise<boolean> {
    if (role === "SUPER_ADMIN") return true;

    const permission = await prisma.permission.findUnique({ where: { name: permissionName } });
    if (!permission) return false;

    const rolePerm = await prisma.rolePermission.findUnique({
      where: { role_permissionId: { role, permissionId: permission.id } },
    });
    if (rolePerm) return true;

    const userPerm = await prisma.userPermission.findUnique({
      where: { userId_permissionId: { userId, permissionId: permission.id } },
    });
    if (userPerm) return userPerm.granted;

    return false;
  }
}

export const permissionService = new PermissionService();
