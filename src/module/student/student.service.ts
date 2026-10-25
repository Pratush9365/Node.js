
import { AppError } from "../../errors/AppError.js";
import {
    getDatabaseErrorCode,
    PgErrorCode,
} from "../../errors/databaseError.js";
import { Student } from "./student.entity.js";
import type {
    CreateStudentInput,
    UpdateStudentInput,
} from "./student.interface.js";
import { StudentRepository } from "./student.repository.js";

export class StudentService {
    public constructor(
        private readonly repository = new StudentRepository()
    ) {}

    private rethrowKnownDatabaseError(error: unknown): never {
        if (
            getDatabaseErrorCode(error) ===
            PgErrorCode.UNIQUE_VIOLATION
        ) {
            throw AppError.conflict(
                "A student with this email already exists"
            );
        }

        throw error;
    }

    public async create(
        input: CreateStudentInput
    ): Promise<Student> {
        try {
            return await this.repository.create(input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }
    }

    public async getAll(): Promise<Student[]> {
        return this.repository.findAll();
    }

    public async getById(id: string): Promise<Student> {
        const student = await this.repository.findById(id);

        if (!student) {
            throw AppError.notFound("Student not found");
        }

        return student;
    }

    public async update(
        id: string,
        input: UpdateStudentInput
    ): Promise<Student> {
        let student: Student | null;

        try {
            student = await this.repository.update(id, input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }

        if (!student) {
            throw AppError.notFound("Student not found");
        }

        return student;
    }

    public async remove(id: string): Promise<void> {
        const deleted = await this.repository.delete(id);

        if (!deleted) {
            throw AppError.notFound("Student not found");
        }
    }
}
