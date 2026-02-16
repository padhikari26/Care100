function createResponse(res, statusCode, message, additionalData = {}) {
    return res.status(statusCode).json({
        status: statusCode,
        message,
        ...additionalData,
    });
}

export default createResponse;