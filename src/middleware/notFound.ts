import type { RequestHandler } from "express";
import { HttpStatus } from "../errors/AppError.js";

export class NotFoundMiddleware {
    public static readonly handle: RequestHandler = (req, res) => {
        res.status(HttpStatus.NOT_FOUND).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
    };
}
