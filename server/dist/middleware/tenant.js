export const tenantScope = (req, _res, next) => {
    if (req.user?.role === "SUPER_ADMIN") {
        return next();
    }
    if (!req.user?.organizationId) {
        return next(new Error("No organization context"));
    }
    next();
};
//# sourceMappingURL=tenant.js.map