import type { RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

export class RejectDangerousPayloadMiddleware {
    private static hasDangerousKey(value: unknown): boolean {
        if (!value || typeof value !== "object") return false;
        return Object.entries(value).some(([key, child]) => key === "__proto__" || key === "constructor" || key === "prototype" || this.hasDangerousKey(child));
    }

    public static readonly handle: RequestHandler = (req, _res, next) => {
        if (this.hasDangerousKey(req.body)) return next(AppError.badRequest("body contains a dangerous property"));
        next();
    };
}
