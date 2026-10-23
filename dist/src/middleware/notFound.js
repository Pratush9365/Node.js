import { HttpStatus } from "../errors/AppError.js";
export class NotFoundMiddleware {
    static handle = (req, res) => {
        res.status(HttpStatus.NOT_FOUND).json({ message: `Route ${req.method} ${req.originalUrl} not found` });
    };
}
//# sourceMappingURL=notFound.js.map