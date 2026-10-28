import type { ErrorRequestHandler } from "express";
import { AppError, HttpStatus } from "../errors/AppError.js";

const BAD_REQUEST_MESSAGES: Readonly<Record<number, string>> = {
    [HttpStatus.BAD_REQUEST]: "Request body is not valid JSON",
    413: "Request body is too large",
};

/** Client errors raised by Express / body-parser carry a numeric 4xx `status`. */
function clientErrorStatus(error: unknown): number | undefined {
    if (typeof error !== "object" || error === null || !("status" in error)) return undefined;
    const { status } = error;
    return typeof status === "number" && status >= 400 && status < 500 ? status : undefined;
}

export class ErrorHandler {
    public static readonly handle: ErrorRequestHandler = (error, _req, res, _next) => {
        if (AppError.isAppError(error)) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }

        const clientStatus = clientErrorStatus(error);
        if (clientStatus !== undefined) {
            res.status(clientStatus).json({ message: BAD_REQUEST_MESSAGES[clientStatus] ?? "Bad request" });
            return;
        }

        console.error("Unhandled request error:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    };
}
