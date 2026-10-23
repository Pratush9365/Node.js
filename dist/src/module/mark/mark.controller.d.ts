import type { Request, Response } from "express";
import { MarkService } from "./mark.service.js";
export declare class MarkController {
    private readonly service;
    constructor(service?: MarkService);
    private markId;
    create(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    getSubjectAverages(_req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=mark.controller.d.ts.map