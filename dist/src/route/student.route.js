import { Router } from "express";
import { StudentController } from "../module/student/student.controller.js";
export class StudentRoute {
    controller;
    router = Router();
    constructor(controller = new StudentController()) {
        this.controller = controller;
        this.router.post("/", this.controller.create.bind(this.controller));
        this.router.get("/", this.controller.getAll.bind(this.controller));
        this.router.get("/:studentId", this.controller.getById.bind(this.controller));
        this.router.put("/:studentId", this.controller.update.bind(this.controller));
        this.router.delete("/:studentId", this.controller.delete.bind(this.controller));
    }
}
export const studentRoute = new StudentRoute().router;
//# sourceMappingURL=student.route.js.map