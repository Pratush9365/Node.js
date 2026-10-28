import { Router } from "express";
import { UserController } from "../module/user/user.controller.js";

export class UserRoute {
    public readonly router = Router();
    public constructor(private readonly controller = new UserController()) {
        this.router.get("/get-api", this.controller.getAll.bind(this.controller));
        this.router.post("/post-api", this.controller.create.bind(this.controller));
    }
}
