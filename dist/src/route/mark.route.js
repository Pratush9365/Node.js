import { Router } from "express";
import { PERMISSIONS } from "../config/permissions.js";
import { requirePermission } from "../middleware/authorize.js";
import { MarkController } from "../module/mark/mark.controller.js";
export class MarkRoute {
    controller;
    router = Router();
    constructor(controller, authenticate) {
        this.controller = controller;
        const canReadMarks = requirePermission(PERMISSIONS.MARKS_READ_ANY, PERMISSIONS.MARKS_READ_CLASS, PERMISSIONS.MARKS_READ_OWN);
        const canWriteMarks = requirePermission(PERMISSIONS.MARKS_WRITE_ANY, PERMISSIONS.MARKS_WRITE_CLASS);
        const canSeeAverages = requirePermission(PERMISSIONS.MARKS_AVERAGES_ANY, PERMISSIONS.MARKS_AVERAGES_CLASS);
        const averages = this.controller.getSubjectAverages.bind(this.controller);
        this.router.use(authenticate);
        // Averages first: "/averages" must not be read as a :markId.
        this.router.get("/averages", canSeeAverages, averages);
        this.router.get("/averages/subjects", canSeeAverages, averages);
        this.router.post("/", canWriteMarks, this.controller.create.bind(this.controller));
        this.router.get("/", canReadMarks, this.controller.getAll.bind(this.controller));
        this.router.get("/:markId", canReadMarks, this.controller.getById.bind(this.controller));
        this.router.put("/:markId", canWriteMarks, this.controller.update.bind(this.controller));
        this.router.patch("/:markId", canWriteMarks, this.controller.update.bind(this.controller));
        this.router.delete("/:markId", canWriteMarks, this.controller.delete.bind(this.controller));
    }
}
//# sourceMappingURL=mark.route.js.map