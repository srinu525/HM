"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.registerOrganization = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
const authService = new auth_service_1.AuthService();
const registerOrganization = async (req, res) => {
    try {
        const parsed = auth_validation_1.registerOrganizationSchema.parse(req.body);
        const result = await authService.registerOrganization(parsed);
        res.status(201).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Registration failed";
        res.status(400).json({ message });
    }
};
exports.registerOrganization = registerOrganization;
const login = async (req, res) => {
    try {
        const parsed = auth_validation_1.loginSchema.parse(req.body);
        const result = await authService.login(parsed);
        res.status(200).json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        res.status(401).json({ message });
    }
};
exports.login = login;
