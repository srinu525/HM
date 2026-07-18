import { userService } from "./service";
import { sendSuccess } from "../../common/response";
export class UserController {
    async getAllUsers(req, res, next) {
        try {
            const users = await userService.getAllUsers(req.user.organizationId);
            sendSuccess(res, users, "Users fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async getUserById(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id, req.user.organizationId);
            sendSuccess(res, user, "User fetched");
        }
        catch (error) {
            next(error);
        }
    }
    async updateUser(req, res, next) {
        try {
            const user = await userService.updateUser(req.params.id, req.body, req.user.organizationId);
            sendSuccess(res, user, "User updated");
        }
        catch (error) {
            next(error);
        }
    }
    async getDoctors(req, res, next) {
        try {
            const doctors = await userService.getDoctors(req.user.organizationId);
            sendSuccess(res, doctors, "Doctors fetched");
        }
        catch (error) {
            next(error);
        }
    }
}
export const userController = new UserController();
//# sourceMappingURL=controller.js.map