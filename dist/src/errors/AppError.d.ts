export declare enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500
}
export declare class AppError extends Error {
    readonly statusCode: HttpStatus;
    constructor(statusCode: HttpStatus, message: string);
    static badRequest(message: string): AppError;
    static notFound(message: string): AppError;
    static conflict(message: string): AppError;
    static isAppError(error: unknown): error is AppError;
}
//# sourceMappingURL=AppError.d.ts.map