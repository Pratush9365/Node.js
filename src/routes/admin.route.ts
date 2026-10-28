import { Router } from "express";
import { AdminController } from "../module/admin/admin.controller.js";

export class AdminRoute {
    public readonly router = Router();

    public constructor(private readonly controller = new AdminController()) {
        this.router.post("/teacher-classes", this.controller.addTeacherClass.bind(this.controller));
        this.router.post("/student-links", this.controller.linkStudent.bind(this.controller));
        this.router.patch("/users/:userId/role", this.controller.changeRole.bind(this.controller));
    }
}
