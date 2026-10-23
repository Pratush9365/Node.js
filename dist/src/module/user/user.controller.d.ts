import type { Request, Response } from "express";
import { UserService } from "./user.service.js";
export declare class UserController {
    private readonly service;
    constructor(service?: UserService);
    getAll(_req: Request, res: Response): Promise<void>;
    create(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=user.controller.d.ts.map