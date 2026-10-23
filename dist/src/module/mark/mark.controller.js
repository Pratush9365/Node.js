import { AppError, HttpStatus } from "../../errors/AppError.js";
import { MarkDto } from "./mark.dto.js";
import { MarkService } from "./mark.service.js";
export class MarkController {
    service;
    constructor(service = new MarkService()) {
        this.service = service;
    }
    markId(req) {
        const { markId } = req.params;
        if (typeof markId !== "string" || !markId)
            throw AppError.badRequest("markId is required");
        return markId;
    }
    async create(req, res) { res.status(HttpStatus.CREATED).json(await this.service.create(MarkDto.create(req.body))); }
    async getAll(req, res) {
        const studentId = typeof req.query.studentId === "string" ? req.query.studentId : undefined;
        const subject = typeof req.query.subject === "string" ? req.query.subject : undefined;
        const filters = {};
        if (studentId)
            filters.studentId = studentId;
        if (subject)
            filters.subject = subject;
        res.status(HttpStatus.OK).json(await this.service.getAll(filters));
    }
    async getById(req, res) { res.status(HttpStatus.OK).json(await this.service.getById(this.markId(req))); }
    async update(req, res) { res.status(HttpStatus.OK).json(await this.service.update(this.markId(req), MarkDto.update(req.body))); }
    async delete(req, res) {
        await this.service.remove(this.markId(req));
        res.status(HttpStatus.NO_CONTENT).send();
    }
    async getSubjectAverages(_req, res) { res.status(HttpStatus.OK).json({ data: await this.service.getSubjectAverages() }); }
}
//# sourceMappingURL=mark.controller.js.map