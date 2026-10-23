export var HttpStatus;
(function (HttpStatus) {
    HttpStatus[HttpStatus["OK"] = 200] = "OK";
    HttpStatus[HttpStatus["CREATED"] = 201] = "CREATED";
    HttpStatus[HttpStatus["NO_CONTENT"] = 204] = "NO_CONTENT";
    HttpStatus[HttpStatus["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    HttpStatus[HttpStatus["NOT_FOUND"] = 404] = "NOT_FOUND";
    HttpStatus[HttpStatus["CONFLICT"] = 409] = "CONFLICT";
    HttpStatus[HttpStatus["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
})(HttpStatus || (HttpStatus = {}));
export class AppError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
    }
    static badRequest(message) { return new AppError(HttpStatus.BAD_REQUEST, message); }
    static notFound(message) { return new AppError(HttpStatus.NOT_FOUND, message); }
    static conflict(message) { return new AppError(HttpStatus.CONFLICT, message); }
    static isAppError(error) { return error instanceof AppError; }
}
//# sourceMappingURL=AppError.js.map