export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    TOO_MANY_REQUESTS = 429,
    INTERNAL_SERVER_ERROR = 500,
}

export class AppError extends Error {
    public readonly statusCode: HttpStatus;

    public constructor(statusCode: HttpStatus, message: string) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
    }

    public static badRequest(message: string): AppError { return new AppError(HttpStatus.BAD_REQUEST, message); }
    public static unauthorized(message = "Authentication required"): AppError { return new AppError(HttpStatus.UNAUTHORIZED, message); }
    public static forbidden(message = "You do not have permission to perform this action"): AppError { return new AppError(HttpStatus.FORBIDDEN, message); }
    public static notFound(message: string): AppError { return new AppError(HttpStatus.NOT_FOUND, message); }
    public static conflict(message: string): AppError { return new AppError(HttpStatus.CONFLICT, message); }
    public static tooManyRequests(message = "Too many requests, please try again later"): AppError { return new AppError(HttpStatus.TOO_MANY_REQUESTS, message); }
    public static isAppError(error: unknown): error is AppError { return error instanceof AppError; }
}
