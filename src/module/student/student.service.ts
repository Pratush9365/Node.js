import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import type { CreateStudentInput, UpdateStudentInput } from "./student.interface.js";
import { StudentRepository } from "./student.repository.js";

export class StudentService {
    public constructor(private readonly repository = new StudentRepository()) {}

    private isUniqueViolation(error: unknown): error is { code: string } {
        return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
    }

    public async create(input: CreateStudentInput) {
        try {
            return await this.repository.create(randomUUID(), input);
        } catch (error: unknown) {
            if (this.isUniqueViolation(error)) throw AppError.conflict("A student with this email already exists");
            throw error;
        }
    }

    public getAll() { return this.repository.findAll(); }

    public async getById(id: string) {
        const student = await this.repository.findById(id);
        if (!student) throw AppError.notFound("Student not found");
        return student;
    }

    public async update(id: string, input: UpdateStudentInput) {
        try {
            const student = await this.repository.update(id, input);
            if (!student) throw AppError.notFound("Student not found");
            return student;
        } catch (error: unknown) {
            if (this.isUniqueViolation(error)) throw AppError.conflict("A student with this email already exists");
            throw error;
        }
    }

    public async remove(id: string): Promise<void> {
        if (!await this.repository.delete(id)) throw AppError.notFound("Student not found");
    }
}
