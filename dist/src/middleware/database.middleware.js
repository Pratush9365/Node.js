import pool from "./db.js";
export class DatabaseMiddleware {
    static attach = (_req, res, next) => {
        res.locals.db = pool;
        next();
    };
}
//# sourceMappingURL=database.middleware.js.map