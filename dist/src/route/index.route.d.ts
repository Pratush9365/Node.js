import { Router } from "express";
import type { RequestHandler } from "express";
import type { AdminController } from "../module/admin/admin.controller.js";
import type { AuthController } from "../module/auth/auth.controller.js";
import type { MarkController } from "../module/mark/mark.controller.js";
import type { StudentController } from "../module/student/student.controller.js";
export interface ApiRouterDependencies {
    authController: AuthController;
    adminController: AdminController;
    studentController: StudentController;
    markController: MarkController;
    authenticate: RequestHandler;
    marksRateLimiter: RequestHandler;
}
/** Every route under /api. Order matters: no-store first, so even 401 / 403 / 404 / 429 responses carry it. */
export declare function createApiRouter(deps: ApiRouterDependencies): Router;
//# sourceMappingURL=index.route.d.ts.map