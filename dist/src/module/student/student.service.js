import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import { StudentRepository } from "./student.repository.js";
export class StudentService {
    repository;
    constructor(repository = new StudentRepository()) {
        this.repository = repository;
    }
    isUniqueViolation(error) {
        return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
    }
    async create(input) {
        try {
            return await this.repository.create(randomUUID(), input);
        }
        catch (error) {
            if (this.isUniqueViolation(error))
                throw AppError.conflict("A student with this email already exists");
            throw error;
        }
    }
    getAll() { return this.repository.findAll(); }
    async getById(id) {
        const student = await this.repository.findById(id);
        if (!student)
            throw AppError.notFound("Student not found");
        return student;
    }
    async update(id, input) {
        try {
            const student = await this.repository.update(id, input);
            if (!student)
                throw AppError.notFound("Student not found");
            return student;
        }
        catch (error) {
            if (this.isUniqueViolation(error))
                throw AppError.conflict("A student with this email already exists");
            throw error;
        }
    }
    async remove(id) {
        if (!await this.repository.delete(id))
            throw AppError.notFound("Student not found");
    }
}
//# sourceMappingURL=student.service.js.map