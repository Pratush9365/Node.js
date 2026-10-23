import type { Request, Response } from "express";
import { AppError, HttpStatus } from "../../errors/AppError.js";
import { StudentDto } from "./student.dto.js";
import { StudentService } from "./student.service.js";

export class StudentController {
    public constructor(private readonly service = new StudentService()) {}

    private studentId(req: Request): string {
        const { studentId } = req.params;
        if (typeof studentId !== "string" || !studentId) throw AppError.badRequest("studentId is required");
        return studentId;
    }

    public async create(req: Request, res: Response): Promise<void> {
        const student = await this.service.create(StudentDto.create(req.body));
        res.status(HttpStatus.CREATED).json(student);
    }

    public async getAll(_req: Request, res: Response): Promise<void> { res.status(HttpStatus.OK).json(await this.service.getAll()); }

    public async getById(req: Request, res: Response): Promise<void> { res.status(HttpStatus.OK).json(await this.service.getById(this.studentId(req))); }

    public async update(req: Request, res: Response): Promise<void> { res.status(HttpStatus.OK).json(await this.service.update(this.studentId(req), StudentDto.update(req.body))); }

    public async delete(req: Request, res: Response): Promise<void> {
        await this.service.remove(this.studentId(req));
        res.status(HttpStatus.NO_CONTENT).send();
    }
}
