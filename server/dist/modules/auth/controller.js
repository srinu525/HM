import { authService } from "./service";
import { sendSuccess, sendCreated } from "../../common/response";
export class AuthController {
    async register(req, res, next) {
        try {
            const { name, email, password, role, organizationId, phone } = req.body;
            const result = await authService.register(name, email, password, role, organizationId, phone);
            sendCreated(res, result, "User registered successfully");
        }
        catch (error) {
            next(error);
        }
    }
    async login(req, res, next) {
        try {
            const { email, password, organizationSlug } = req.body;
            const result = await authService.login(email, password, organizationSlug);
            sendSuccess(res, result, "Login successful");
        }
        catch (error) {
            next(error);
        }
    }
    async loginSuperAdmin(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.loginSuperAdmin(email, password);
            sendSuccess(res, result, "Login successful");
        }
        catch (error) {
            next(error);
        }
    }
    async getProfile(req, res, next) {
        try {
            const user = await authService.getProfile(req.user.id);
            sendSuccess(res, user, "Profile fetched");
        }
        catch (error) {
            next(error);
        }
    }
}
export const authController = new AuthController();
//# sourceMappingURL=controller.js.map