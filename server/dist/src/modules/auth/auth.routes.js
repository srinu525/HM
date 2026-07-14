"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const router = (0, express_1.Router)();
router.post("/register-organization", auth_controller_1.registerOrganization);
router.post("/login", auth_controller_1.login);
exports.default = router;
