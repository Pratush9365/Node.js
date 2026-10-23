import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import { StudentRepository } from "../student/student.repository.js";
import { MarkRepository } from "./mark.repository.js";
export class MarkService {
    repository;
    studentRepository;
    constructor(repository = new MarkRepository(), studentRepository = new StudentRepository()) {
        this.repository = repository;
        this.studentRepository = studentRepository;
    }
    async requireStudent(studentId) {
        if (!await this.studentRepository.findById(studentId))
            throw AppError.notFound("Student not found");
    }
    rethrowKnownDatabaseError(error) {
        if (typeof error === "object" && error !== null && "code" in error) {
            if (error.code === "23505")
                throw AppError.conflict("A mark for this student and subject already exists");
            if (error.code === "23503")
                throw AppError.notFound("Student not found");
        }
        throw error;
    }
    async create(input) {
        await this.requireStudent(input.studentId);
        try {
            return await this.repository.create(randomUUID(), input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
    }
    getAll(filters) { return this.repository.findAll(filters); }
    async getById(id) {
        const mark = await this.repository.findById(id);
        if (!mark)
            throw AppError.notFound("Mark not found");
        return mark;
    }
    async update(id, input) {
        await this.requireStudent(input.studentId);
        try {
            const mark = await this.repository.update(id, input);
            if (!mark)
                throw AppError.notFound("Mark not found");
            return mark;
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
    }
    async remove(id) { if (!await this.repository.delete(id))
        throw AppError.notFound("Mark not found"); }
    getSubjectAverages() { return this.repository.findSubjectAverages(); }
}
//# sourceMappingURL=mark.service.js.map