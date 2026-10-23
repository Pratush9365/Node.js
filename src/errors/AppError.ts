export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    CONFLICT = 409,
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
    public static notFound(message: string): AppError { return new AppError(HttpStatus.NOT_FOUND, message); }
    public static conflict(message: string): AppError { return new AppError(HttpStatus.CONFLICT, message); }
    public static isAppError(error: unknown): error is AppError { return error instanceof AppError; }
}
