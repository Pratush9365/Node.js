import type { Request, RequestHandler } from "express";
import { AppError } from "../errors/AppError.js";
import type { Actor } from "../module/access/access.interface.js";
import type { TokenService } from "../module/auth/token.service.js";
import type { IUserRepository } from "../module/user/interface/user.interface.js";

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        interface Request {
            /** Set by `authenticate`; the role is re-read from the database on every request. */
            user?: Actor;
        }
    }
}

const BEARER_PREFIX = "Bearer ";

/** Controllers and rate limiters use this instead of `req.user!`; a missing user means authenticate was not mounted. */
export function requireActor(req: Request): Actor {
    if (!req.user) throw AppError.unauthorized();
    return req.user;
}

/**
 * Bearer JWT -> req.user. The role comes from the database, never from the token, so demoting or
 * deleting an account locks it out of privileged actions at once (not after the token expires).
 */
export function createAuthenticate(tokens: TokenService, users: Pick<IUserRepository, "findById">): RequestHandler {
    return async (req, _res, next) => {
        const header = req.headers.authorization;
        if (typeof header !== "string" || !header.startsWith(BEARER_PREFIX)) throw AppError.unauthorized();

        const userId = tokens.verify(header.slice(BEARER_PREFIX.length).trim());
        const user = await users.findById(userId);
        if (!user) throw AppError.unauthorized("Invalid or expired access token");

        req.user = { id: user.id, role: user.role };
        next();
    };
}
