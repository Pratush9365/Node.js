import type { Request, Response } from "express";
import { StudentService } from "./student.service.js";
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    private studentId;
    create(req: Request, res: Response): Promise<void>;
    getAll(_req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=student.controller.d.ts.map