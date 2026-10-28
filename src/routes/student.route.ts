import { Router } from "express";
import type { RequestHandler } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import { requirePermission } from "../middleware/authorize.js";
import { StudentController } from "../module/student/student.controller.js";

export interface StudentRouteGuards {
    authenticate: RequestHandler;
    /** Per-user limiter for POST /:studentId/marks; mounted after authenticate so it can key by user id. */
    marksRateLimiter: RequestHandler;
}

export class StudentRoute {
    public readonly router = Router();

    public constructor(private readonly controller: StudentController, guards: StudentRouteGuards) {
        const canReadStudents = requirePermission(
            PERMISSIONS.STUDENTS_READ_ANY,
            PERMISSIONS.STUDENTS_READ_CLASS,
            PERMISSIONS.STUDENTS_READ_OWN,
        );
        const canWriteStudents = requirePermission(PERMISSIONS.STUDENTS_WRITE_ANY);
        const canWriteMarks = requirePermission(PERMISSIONS.MARKS_WRITE_ANY, PERMISSIONS.MARKS_WRITE_CLASS);

        this.router.use(guards.authenticate);
        this.router.post("/", canWriteStudents, this.controller.create.bind(this.controller));
        this.router.get("/", canReadStudents, this.controller.getAll.bind(this.controller));
        this.router.get("/:studentId", canReadStudents, this.controller.getById.bind(this.controller));
        this.router.put("/:studentId", canWriteStudents, this.controller.update.bind(this.controller));
        this.router.patch("/:studentId", canWriteStudents, this.controller.update.bind(this.controller));
        this.router.delete("/:studentId", canWriteStudents, this.controller.delete.bind(this.controller));
        this.router.post("/:studentId/marks", guards.marksRateLimiter, canWriteMarks, this.controller.createMark.bind(this.controller));
    }
}
