import { AppError } from "../errors/AppError.js";
export class RejectDangerousPayloadMiddleware {
    static hasDangerousKey(value) {
        if (!value || typeof value !== "object")
            return false;
        return Object.entries(value).some(([key, child]) => key === "__proto__" || key === "constructor" || key === "prototype" || this.hasDangerousKey(child));
    }
    static handle = (req, _res, next) => {
        if (this.hasDangerousKey(req.body))
            return next(AppError.badRequest("body contains a dangerous property"));
        next();
    };
}
//# sourceMappingURL=rejectDangerousPayload.js.map