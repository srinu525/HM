import { Response, NextFunction } from "express";
import { departmentService } from "./service";
import { AuthRequest } from "../../middleware/auth";
import { sendSuccess, sendCreated } from "../../common/response";

export class DepartmentController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const departments = await departmentService.getAll(req.user!.organizationId as string);
      sendSuccess(res, departments, "Departments fetched");
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const department = await departmentService.getById(req.params.id as string, req.user!.organizationId as string);
      sendSuccess(res, department, "Department fetched");
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const department = await departmentService.create(req.body, req.user!.organizationId as string);
      sendCreated(res, department, "Department created");
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const department = await departmentService.update(req.params.id as string, req.body, req.user!.organizationId as string);
      sendSuccess(res, department, "Department updated");
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const department = await departmentService.toggleActive(req.params.id as string, req.user!.organizationId as string);
      sendSuccess(res, department, `Department ${department.isActive ? "activated" : "deactivated"}`);
    } catch (error) {
      next(error);
    }
  }
}

export const departmentController = new DepartmentController();
