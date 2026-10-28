import { Router } from "express";
import { UserController } from "../module/user/user.controller.js";
export class UserRoute {
    controller;
    router = Router();
    constructor(controller = new UserController()) {
        this.controller = controller;
        this.router.get("/get-api", this.controller.getAll.bind(this.controller));
        this.router.post("/post-api", this.controller.create.bind(this.controller));
    }
}
//# sourceMappingURL=user.route.js.map