import { AppError, HttpStatus } from "../../errors/AppError.js";
import { StudentDto } from "./student.dto.js";
import { StudentService } from "./student.service.js";
export class StudentController {
    studentService;
    constructor(studentService) {
        this.studentService = studentService;
    }
    studentId(req) {
        const { studentId } = req.params;
        if (typeof studentId !== "string" || !studentId) {
            throw AppError.badRequest("studentId is required");
        }
        return studentId;
    }
    async create(req, res) {
        const student = await this.studentService.create(StudentDto.create(req.body));
        res.status(HttpStatus.CREATED).json(student);
    }
    async getAll(_req, res) {
        res.status(HttpStatus.OK).json(await this.studentService.getAll());
    }
    async getById(req, res) {
        const student = await this.studentService.getById(this.studentId(req));
        res.status(HttpStatus.OK).json(student);
    }
    async update(req, res) {
        const student = await this.studentService.update(this.studentId(req), StudentDto.update(req.body));
        res.status(HttpStatus.OK).json(student);
    }
    async delete(req, res) {
        await this.studentService.remove(this.studentId(req));
        res.status(HttpStatus.NO_CONTENT).send();
    }
}
//# sourceMappingURL=student.controller.js.map