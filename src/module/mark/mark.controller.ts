import type { Request, Response } from "express";
import { AppError, HttpStatus } from "../../errors/AppError.js";
import { MarkDto } from "./mark.dto.js";
import { MarkService } from "./mark.service.js";

export class MarkController {
    public constructor(private readonly service = new MarkService()) {}
    private markId(req: Request): string {
        const { markId } = req.params;
        if (typeof markId !== "string" || !markId) throw AppError.badRequest("markId is required");
        return markId;
    }

    public async create(req: Request, res: Response): Promise<void> { res.status(HttpStatus.CREATED).json(await this.service.create(MarkDto.create(req.body))); }

    public async getAll(req: Request, res: Response): Promise<void> {
        const studentId = typeof req.query.studentId === "string" ? req.query.studentId : undefined;
        const subject = typeof req.query.subject === "string" ? req.query.subject : undefined;
        const filters: { studentId?: string; subject?: string } = {};
        if (studentId) filters.studentId = studentId;
        if (subject) filters.subject = subject;
        res.status(HttpStatus.OK).json(await this.service.getAll(filters));
    }

    public async getById(req: Request, res: Response): Promise<void> { res.status(HttpStatus.OK).json(await this.service.getById(this.markId(req))); }

    public async update(req: Request, res: Response): Promise<void> { res.status(HttpStatus.OK).json(await this.service.update(this.markId(req), MarkDto.update(req.body))); }

    public async delete(req: Request, res: Response): Promise<void> {
        await this.service.remove(this.markId(req));
        res.status(HttpStatus.NO_CONTENT).send();
    }

    public async getSubjectAverages(_req: Request, res: Response): Promise<void> { res.status(HttpStatus.OK).json({ data: await this.service.getSubjectAverages() }); }
}
