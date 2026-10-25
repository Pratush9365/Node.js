
import type { Request, Response } from "express";
import { AppError, HttpStatus } from "../../errors/AppError.js";
import { MarkDto } from "./mark.dto.js";
import type { MarkFilters } from "./mark.interface.js";
import { MarkService } from "./mark.service.js";

export class MarkController {
    public constructor(
        private readonly service: MarkService
    ) {}

    private markId(req: Request): string {
        const { markId } = req.params;

        if (typeof markId !== "string" || !markId) {
            throw AppError.badRequest("markId is required");
        }

        return markId;
    }

    public async create(req: Request, res: Response): Promise<void> {
        const mark = await this.service.create(
            MarkDto.create(req.body)
        );

        res.status(HttpStatus.CREATED).json(mark);
    }

    public async getAll(req: Request, res: Response): Promise<void> {
        const { studentId, subject } = req.query;
        const filters: MarkFilters = {};

        if (typeof studentId === "string" && studentId) {
            filters.studentId = studentId;
        }

        if (typeof subject === "string" && subject) {
            filters.subject = subject;
        }

        res.status(HttpStatus.OK).json(
            await this.service.getAll(filters)
        );
    }

    public async getById(req: Request, res: Response): Promise<void> {
        const mark = await this.service.getById(
            this.markId(req)
        );

        res.status(HttpStatus.OK).json(mark);
    }

    public async update(req: Request, res: Response): Promise<void> {
        const mark = await this.service.update(
            this.markId(req),
            MarkDto.update(req.body)
        );

        res.status(HttpStatus.OK).json(mark);
    }

    public async delete(req: Request, res: Response): Promise<void> {
        await this.service.remove(this.markId(req));

        res.status(HttpStatus.NO_CONTENT).send();
    }

    public async getSubjectAverages(
        _req: Request,
        res: Response
    ): Promise<void> {
        const averages = await this.service.getSubjectAverages();

        res.status(HttpStatus.OK).json({ data: averages });
    }
}
