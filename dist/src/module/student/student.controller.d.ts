import type { Request, Response } from "express";
import { MarkService } from "../mark/mark.service.js";
import { StudentService } from "./student.service.js";
export declare class StudentController {
    private readonly service;
    private readonly markService;
    constructor(service?: StudentService, markService?: MarkService);
    private studentId;
    create(req: Request, res: Response): Promise<void>;
    getAll(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
    /** POST /api/students/:studentId/marks - the student comes from the URL, never from the body. */
    createMark(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=student.controller.d.ts.map