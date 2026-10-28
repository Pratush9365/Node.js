import { Router } from "express";
import { AuthController } from "../module/auth/auth.controller.js";

export class AuthRoute {
    public readonly router = Router();

    public constructor(private readonly controller: AuthController) {
        this.router.post("/register", this.controller.register.bind(this.controller));
        this.router.post("/login", this.controller.login.bind(this.controller));
    }
}
