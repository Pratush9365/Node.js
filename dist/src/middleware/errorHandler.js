import { AppError, HttpStatus } from "../errors/AppError.js";
export class ErrorHandler {
    static handle = (error, _req, res, _next) => {
        if (AppError.isAppError(error)) {
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
        console.error("Unhandled request error:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    };
}
//# sourceMappingURL=errorHandler.js.map