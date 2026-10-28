import express, { Router } from "express";
import type { RequestHandler } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import { requirePermission } from "../middleware/authorize.js";
import { noStore } from "../middleware/noStore.js";
import type { AdminController } from "../module/admin/admin.controller.js";
import type { AuthController } from "../module/auth/auth.controller.js";
import type { MarkController } from "../module/mark/mark.controller.js";
import type { StudentController } from "../module/student/student.controller.js";
import { AdminRoute } from "./admin.route.js";
import { AuthRoute } from "./auth.route.js";
import { MarkRoute } from "./mark.route.js";
import { StudentRoute } from "./student.route.js";

export interface ApiRouterDependencies {
    authController: AuthController;
    adminController: AdminController;
    studentController: StudentController;
    markController: MarkController;
    authenticate: RequestHandler;
    marksRateLimiter: RequestHandler;
}

/** Every route under /api. Order matters: no-store first, so even 401 / 403 / 404 / 429 responses carry it. */
export function createApiRouter(deps: ApiRouterDependencies): Router {
    const router = Router();

    // Personal data (and anything that handles credentials) must never sit in a browser or proxy cache.
    router.use(["/auth", "/students", "/marks", "/admin"], noStore);
    router.use(express.json({ limit: "100kb" }));

    router.use("/auth", new AuthRoute(deps.authController).router);
    router.use("/admin", deps.authenticate, requirePermission(PERMISSIONS.ADMIN_MANAGE), new AdminRoute(deps.adminController).router);
    router.use("/students", new StudentRoute(deps.studentController, {
        authenticate: deps.authenticate,
        marksRateLimiter: deps.marksRateLimiter,
    }).router);
    router.use("/marks", new MarkRoute(deps.markController, deps.authenticate).router);

    return router;
}
