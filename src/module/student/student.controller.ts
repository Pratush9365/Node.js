import type { Request, Response } from "express";
import { HttpStatus } from "../../errors/AppError.js";
import { requireActor } from "../../middleware/authenticate.js";
import { Validators } from "../../utils/validators.js";
import { MarkDto } from "../mark/mark.dto.js";
import { MarkService } from "../mark/mark.service.js";
import { StudentDto } from "./student.dto.js";
import { StudentService } from "./student.service.js";

export class StudentController {
    public constructor(
        private readonly service = new StudentService(),
        private readonly markService = new MarkService(),
    ) {}

    private studentId(req: Request): string {
        return Validators.uuidParam(req.params.studentId, "studentId");
    }

    public async create(req: Request, res: Response): Promise<void> {
        const student = await this.service.create(requireActor(req), StudentDto.create(req.body));
        res.status(HttpStatus.CREATED).json(student);
    }

    public async getAll(req: Request, res: Response): Promise<void> {
        res.status(HttpStatus.OK).json(await this.service.getAll(requireActor(req)));
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const student = await this.service.getById(requireActor(req), this.studentId(req));
        res.status(HttpStatus.OK).json(student);
    }

    public async update(req: Request, res: Response): Promise<void> {
        const student = await this.service.update(requireActor(req), this.studentId(req), StudentDto.update(req.body));
        res.status(HttpStatus.OK).json(student);
    }

    public async delete(req: Request, res: Response): Promise<void> {
        await this.service.remove(requireActor(req), this.studentId(req));
        res.status(HttpStatus.NO_CONTENT).send();
    }

    /** POST /api/students/:studentId/marks - the student comes from the URL, never from the body. */
    public async createMark(req: Request, res: Response): Promise<void> {
        const mark = await this.markService.create(requireActor(req), MarkDto.createForStudent(this.studentId(req), req.body));
        res.status(HttpStatus.CREATED).json(mark);
    }
}
