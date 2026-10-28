import type { RequestHandler } from "express";
import { StudentController } from "../module/student/student.controller.js";
export interface StudentRouteGuards {
    authenticate: RequestHandler;
    /** Per-user limiter for POST /:studentId/marks; mounted after authenticate so it can key by user id. */
    marksRateLimiter: RequestHandler;
}
export declare class StudentRoute {
    private readonly controller;
    readonly router: import("express-serve-static-core").Router;
    constructor(controller: StudentController, guards: StudentRouteGuards);
}
//# sourceMappingURL=student.route.d.ts.map