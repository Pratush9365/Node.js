
import { Router } from "express";
import { MarkController } from "../module/mark/mark.controller.js";

export class MarkRoute {
    public readonly router = Router();

    public constructor(
        private readonly controller: MarkController
    ) {
        this.router.get(
            "/averages/subjects",
            this.controller.getSubjectAverages.bind(this.controller)
        );

        this.router.post(
            "/",
            this.controller.create.bind(this.controller)
        );

        this.router.get(
            "/",
            this.controller.getAll.bind(this.controller)
        );

        this.router.get(
            "/:markId",
            this.controller.getById.bind(this.controller)
        );

        this.router.put(
            "/:markId",
            this.controller.update.bind(this.controller)
        );

        this.router.delete(
            "/:markId",
            this.controller.delete.bind(this.controller)
        );
    }
}
