export declare enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500
}
export declare class AppError extends Error {
    readonly statusCode: HttpStatus;
    constructor(statusCode: HttpStatus, message: string);
    static badRequest(message: string): AppError;
    static unauthorized(message?: string): AppError;
    static forbidden(message?: string): AppError;
    static notFound(message: string): AppError;
    static conflict(message: string): AppError;
    static tooManyRequests(message?: string): AppError;
    static isAppError(error: unknown): error is AppError;
}
//# sourceMappingURL=AppError.d.ts.map