import { HttpStatus } from "../../errors/AppError.js";
import { requireActor } from "../../middleware/authenticate.js";
import { Validators } from "../../utils/validators.js";
import { MarkDto } from "../mark/mark.dto.js";
import { MarkService } from "../mark/mark.service.js";
import { StudentDto } from "./student.dto.js";
import { StudentService } from "./student.service.js";
export class StudentController {
    service;
    markService;
    constructor(service = new StudentService(), markService = new MarkService()) {
        this.service = service;
        this.markService = markService;
    }
    studentId(req) {
        return Validators.uuidParam(req.params.studentId, "studentId");
    }
    async create(req, res) {
        const student = await this.service.create(requireActor(req), StudentDto.create(req.body));
        res.status(HttpStatus.CREATED).json(student);
    }
    async getAll(req, res) {
        res.status(HttpStatus.OK).json(await this.service.getAll(requireActor(req)));
    }
    async getById(req, res) {
        const student = await this.service.getById(requireActor(req), this.studentId(req));
        res.status(HttpStatus.OK).json(student);
    }
    async update(req, res) {
        const student = await this.service.update(requireActor(req), this.studentId(req), StudentDto.update(req.body));
        res.status(HttpStatus.OK).json(student);
    }
    async delete(req, res) {
        await this.service.remove(requireActor(req), this.studentId(req));
        res.status(HttpStatus.NO_CONTENT).send();
    }
    /** POST /api/students/:studentId/marks - the student comes from the URL, never from the body. */
    async createMark(req, res) {
        const mark = await this.markService.create(requireActor(req), MarkDto.createForStudent(this.studentId(req), req.body));
        res.status(HttpStatus.CREATED).json(mark);
    }
}
//# sourceMappingURL=student.controller.js.map