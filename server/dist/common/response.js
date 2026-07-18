export function sendSuccess(res, data, message = "Success", statusCode = 200) {
    const response = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
}
export function sendCreated(res, data, message = "Created successfully") {
    return sendSuccess(res, data, message, 201);
}
export function sendError(res, message = "Internal Server Error", statusCode = 500) {
    const response = {
        success: false,
        message,
    };
    return res.status(statusCode).json(response);
}
export function sendPaginated(res, data, total, page, limit, message = "Success") {
    const response = {
        success: true,
        message,
        data,
        meta: { page, limit, total },
    };
    return res.status(200).json(response);
}
//# sourceMappingURL=response.js.map