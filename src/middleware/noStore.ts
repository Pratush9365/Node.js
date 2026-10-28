import type { RequestHandler } from "express";

/**
 * Marks every response as non-cacheable. Mounted before the handlers, so error responses
 * (401, 403, 404, 429...) carry it too; browsers and proxies never keep personal data.
 */
export const noStore: RequestHandler = (_req, res, next) => {
    res.setHeader("Cache-Control", "no-store");
    next();
};
