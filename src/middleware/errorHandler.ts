import type { ErrorRequestHandler } from "express";
import { AppError, HttpStatus } from "../errors/AppError.js";

export class ErrorHandler {
    public static readonly handle: ErrorRequestHandler = (error, _req, res, _next) => {
    if (AppError.isAppError(error)) {
        res.status(error.statusCode).json({ message: error.message });
        return;
    }

    console.error("Unhandled request error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    };
}
