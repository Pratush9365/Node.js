import type { Request, Response } from "express";
import { HttpStatus } from "../../errors/AppError.js";
import { requireActor } from "../../middleware/authenticate.js";
import { Validators } from "../../utils/validators.js";
import { MarkDto } from "./mark.dto.js";
import type { MarkFilters } from "./mark.interface.js";
import { MarkService } from "./mark.service.js";

export class MarkController {
    public constructor(private readonly service = new MarkService()) {}

    private markId(req: Request): string {
        return Validators.uuidParam(req.params.markId, "markId");
    }

    public async create(req: Request, res: Response): Promise<void> {
        const mark = await this.service.create(requireActor(req), MarkDto.create(req.body));
        res.status(HttpStatus.CREATED).json(mark);
    }

    public async getAll(req: Request, res: Response): Promise<void> {
        const { studentId, subject } = req.query;
        const filters: MarkFilters = {};
        if (typeof studentId === "string" && studentId) filters.studentId = Validators.uuidParam(studentId, "studentId");
        if (typeof subject === "string" && subject) filters.subject = subject;
        res.status(HttpStatus.OK).json(await this.service.getAll(requireActor(req), filters));
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const mark = await this.service.getById(requireActor(req), this.markId(req));
        res.status(HttpStatus.OK).json(mark);
    }

    public async update(req: Request, res: Response): Promise<void> {
        const mark = await this.service.update(requireActor(req), this.markId(req), MarkDto.update(req.body));
        res.status(HttpStatus.OK).json(mark);
    }

    public async delete(req: Request, res: Response): Promise<void> {
        await this.service.remove(requireActor(req), this.markId(req));
        res.status(HttpStatus.NO_CONTENT).send();
    }

    public async getSubjectAverages(req: Request, res: Response): Promise<void> {
        const data = await this.service.getSubjectAverages(requireActor(req), MarkDto.averagesQuery(req.query));
        res.status(HttpStatus.OK).json({ data });
    }
}
