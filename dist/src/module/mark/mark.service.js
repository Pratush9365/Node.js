import { AppError } from "../../errors/AppError.js";
import { getDatabaseErrorCode, PgErrorCode, } from "../../errors/databaseError.js";
import { StudentRepository } from "../student/student.repository.js";
import { MarkRepository } from "./mark.repository.js";
export class MarkService {
    repository;
    studentRepository;
    constructor(repository, studentRepository) {
        this.repository = repository;
        this.studentRepository = studentRepository;
    }
    async requireStudent(studentId) {
        const student = await this.studentRepository.findById(studentId);
        if (!student) {
            throw AppError.notFound("Student not found");
        }
    }
    rethrowKnownDatabaseError(error) {
        switch (getDatabaseErrorCode(error)) {
            case PgErrorCode.UNIQUE_VIOLATION:
                throw AppError.conflict("A mark for this student and subject already exists");
            case PgErrorCode.FOREIGN_KEY_VIOLATION:
                throw AppError.notFound("Student not found");
            default:
                throw error;
        }
    }
    async create(input) {
        await this.requireStudent(input.studentId);
        try {
            return await this.repository.create(input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
    }
    getAll(filters) {
        return this.repository.findAll(filters);
    }
    async getById(id) {
        const mark = await this.repository.findById(id);
        if (!mark) {
            throw AppError.notFound("Mark not found");
        }
        return mark;
    }
    async update(id, input) {
        await this.requireStudent(input.studentId);
        let mark;
        try {
            mark = await this.repository.update(id, input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
        if (!mark) {
            throw AppError.notFound("Mark not found");
        }
        return mark;
    }
    async remove(id) {
        const deleted = await this.repository.delete(id);
        if (!deleted) {
            throw AppError.notFound("Mark not found");
        }
    }
    getSubjectAverages() {
        return this.repository.findSubjectAverages();
    }
}
//# sourceMappingURL=mark.service.js.map