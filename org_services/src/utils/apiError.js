class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }

    static error(message) {
        return new ApiError(statusCode, message);
    }

}
export default ApiError;