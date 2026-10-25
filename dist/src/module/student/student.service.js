import { AppError } from "../../errors/AppError.js";
import { getDatabaseErrorCode, PgErrorCode } from "../../errors/databaseError.js";
import { Student } from "./student.entity.js";
import { StudentRepository } from "./student.repository.js";
export class StudentService {
    repository;
    constructor(repository = new StudentRepository()) {
        this.repository = repository;
    }
    rethrowKnownDatabaseError(error) {
        if (getDatabaseErrorCode(error) === PgErrorCode.UNIQUE_VIOLATION) {
            throw AppError.conflict("A student with this email already exists");
        }
        throw error;
    }
    async create(input) {
        try {
            return await this.repository.create(input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
    }
    getAll() {
        return this.repository.findAll();
    }
    async getById(id) {
        const student = await this.repository.findById(id);
        if (!student)
            throw AppError.notFound("Student not found");
        return student;
    }
    async update(id, input) {
        let student;
        try {
            student = await this.repository.update(id, input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
        if (!student)
            throw AppError.notFound("Student not found");
        return student;
    }
    async remove(id) {
        if (!(await this.repository.delete(id)))
            throw AppError.notFound("Student not found");
    }
}
//# sourceMappingURL=student.service.js.map