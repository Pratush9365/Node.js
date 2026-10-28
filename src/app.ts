import cors from "cors";
import express from "express";
import type { Express, Router } from "express";
import type { Env } from "./config/env.js";
import { createAuthenticate, requireActor } from "./middleware/authenticate.js";
import { ErrorHandler } from "./middleware/errorHandler.js";
import { NotFoundMiddleware } from "./middleware/notFound.js";
import { createRateLimiter } from "./middleware/rateLimit.js";
import { AccessPolicy } from "./module/access/access.policy.js";
import type { IAccessRepository } from "./module/access/access.interface.js";
import { AdminController } from "./module/admin/admin.controller.js";
import { AdminService } from "./module/admin/admin.service.js";
import { AuthController } from "./module/auth/auth.controller.js";
import { AuthService } from "./module/auth/auth.service.js";
import { TokenService } from "./module/auth/token.service.js";
import type { IMarkRepository } from "./module/mark/mark.interface.js";
import { MarkController } from "./module/mark/mark.controller.js";
import { MarkService } from "./module/mark/mark.service.js";
import type { IStudentRepository } from "./module/student/student.interface.js";
import { StudentController } from "./module/student/student.controller.js";
import { StudentService } from "./module/student/student.service.js";
import type { IUserRepository } from "./module/user/interface/user.interface.js";
import { createApiRouter } from "./routes/index.route.js";

/** POST /api/students/:id/marks: at most MARKS_RATE_LIMIT_MAX requests per user in this window. */
export const MARKS_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

const CORS_PREFLIGHT_MAX_AGE_SECONDS = 600;

export interface Repositories {
    users: IUserRepository;
    students: IStudentRepository;
    marks: IMarkRepository;
    access: IAccessRepository;
}

export type AppConfig = Pick<Env, "JWT_SECRET" | "CORS_ORIGINS" | "MARKS_RATE_LIMIT_MAX">;

export interface AppOptions {
    /** The pre-existing unauthenticated /user routes, mounted only by the real server. */
    legacyUserRoute?: Router;
}

/** Builds the whole Express app from its repositories, so tests can run it against in-memory fakes. */
export function createApp(repositories: Repositories, config: AppConfig, options: AppOptions = {}): Express {
    const policy = new AccessPolicy(repositories.access);
    const tokens = new TokenService(config.JWT_SECRET);

    const studentService = new StudentService(repositories.students, policy);
    const markService = new MarkService(repositories.marks, repositories.students, policy);

    const app = express();
    app.disable("x-powered-by");
    app.use(cors({
        origin: config.CORS_ORIGINS,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
        maxAge: CORS_PREFLIGHT_MAX_AGE_SECONDS,
    }));

    app.use("/api", createApiRouter({
        authController: new AuthController(new AuthService(tokens, repositories.users)),
        adminController: new AdminController(new AdminService(repositories.users, repositories.students, repositories.access)),
        studentController: new StudentController(studentService, markService),
        markController: new MarkController(markService),
        authenticate: createAuthenticate(tokens, repositories.users),
        // Keyed by user id, not IP: a whole school shares one address. Only ever mounted after `authenticate`.
        marksRateLimiter: createRateLimiter({
            windowMs: MARKS_RATE_LIMIT_WINDOW_MS,
            max: config.MARKS_RATE_LIMIT_MAX,
            keyGenerator: (req) => requireActor(req).id,
        }),
    }));

    if (options.legacyUserRoute) app.use("/user", express.json(), options.legacyUserRoute);

    app.use(NotFoundMiddleware.handle);
    app.use(ErrorHandler.handle);
    return app;
}
