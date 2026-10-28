import { HttpStatus } from "../../errors/AppError.js";
import { requireActor } from "../../middleware/authenticate.js";
import { Validators } from "../../utils/validators.js";
import { MarkDto } from "./mark.dto.js";
import { MarkService } from "./mark.service.js";
export class MarkController {
    service;
    constructor(service = new MarkService()) {
        this.service = service;
    }
    markId(req) {
        return Validators.uuidParam(req.params.markId, "markId");
    }
    async create(req, res) {
        const mark = await this.service.create(requireActor(req), MarkDto.create(req.body));
        res.status(HttpStatus.CREATED).json(mark);
    }
    async getAll(req, res) {
        const { studentId, subject } = req.query;
        const filters = {};
        if (typeof studentId === "string" && studentId)
            filters.studentId = Validators.uuidParam(studentId, "studentId");
        if (typeof subject === "string" && subject)
            filters.subject = subject;
        res.status(HttpStatus.OK).json(await this.service.getAll(requireActor(req), filters));
    }
    async getById(req, res) {
        const mark = await this.service.getById(requireActor(req), this.markId(req));
        res.status(HttpStatus.OK).json(mark);
    }
    async update(req, res) {
        const mark = await this.service.update(requireActor(req), this.markId(req), MarkDto.update(req.body));
        res.status(HttpStatus.OK).json(mark);
    }
    async delete(req, res) {
        await this.service.remove(requireActor(req), this.markId(req));
        res.status(HttpStatus.NO_CONTENT).send();
    }
    async getSubjectAverages(req, res) {
        const data = await this.service.getSubjectAverages(requireActor(req), MarkDto.averagesQuery(req.query));
        res.status(HttpStatus.OK).json({ data });
    }
}
//# sourceMappingURL=mark.controller.js.map