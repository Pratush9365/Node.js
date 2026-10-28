import type { Request, RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";

export interface RateLimiterOptions {
    windowMs: number;
    max: number;
    /** What to count by. For authenticated routes use the user id: a whole school shares one IP. */
    keyGenerator: (req: Request) => string;
    message?: string;
    /** Injectable clock, for tests. */
    now?: () => number;
}

interface Bucket {
    count: number;
    resetAt: number;
}

/** Fixed-window, in-memory limiter. Per process: put a shared store behind it if you run several instances. */
export function createRateLimiter(options: RateLimiterOptions): RequestHandler {
    const { windowMs, max, keyGenerator, message, now = Date.now } = options;
    const buckets = new Map<string, Bucket>();
    let lastSweep = now();

    function sweep(current: number): void {
        if (current - lastSweep < windowMs) return;
        lastSweep = current;
        for (const [key, bucket] of buckets) if (bucket.resetAt <= current) buckets.delete(key);
    }

    return (req, res, next) => {
        const current = now();
        sweep(current);

        const key = keyGenerator(req);
        let bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= current) {
            bucket = { count: 0, resetAt: current + windowMs };
            buckets.set(key, bucket);
        }
        bucket.count += 1;

        const secondsLeft = Math.max(1, Math.ceil((bucket.resetAt - current) / 1000));
        res.setHeader("RateLimit-Limit", String(max));
        res.setHeader("RateLimit-Remaining", String(Math.max(0, max - bucket.count)));
        res.setHeader("RateLimit-Reset", String(secondsLeft));

        if (bucket.count > max) {
            res.setHeader("Retry-After", String(secondsLeft));
            throw AppError.tooManyRequests(message);
        }
        next();
    };
}
