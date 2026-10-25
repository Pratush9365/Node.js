
import { AppError } from "../../errors/AppError.js";
import {
    getDatabaseErrorCode,
    PgErrorCode,
} from "../../errors/databaseError.js";
import { StudentRepository } from "../student/student.repository.js";
import type { Mark } from "./mark.entity.js";
import type {
    CreateMarkInput,
    MarkFilters,
    SubjectAverage,
    UpdateMarkInput,
} from "./mark.interface.js";
import { MarkRepository } from "./mark.repository.js";

export class MarkService {
    public constructor(
        private readonly repository: MarkRepository,
        private readonly studentRepository: StudentRepository,
    ) {}

    private async requireStudent(studentId: string): Promise<void> {
        const student = await this.studentRepository.findById(studentId);

        if (!student) {
            throw AppError.notFound("Student not found");
        }
    }

    private rethrowKnownDatabaseError(error: unknown): never {
        switch (getDatabaseErrorCode(error)) {
            case PgErrorCode.UNIQUE_VIOLATION:
                throw AppError.conflict(
                    "A mark for this student and subject already exists"
                );

            case PgErrorCode.FOREIGN_KEY_VIOLATION:
                throw AppError.notFound("Student not found");

            default:
                throw error;
        }
    }

    public async create(input: CreateMarkInput): Promise<Mark> {
        await this.requireStudent(input.studentId);

        try {
            return await this.repository.create(input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }
    }

    public getAll(filters: MarkFilters): Promise<Mark[]> {
        return this.repository.findAll(filters);
    }

    public async getById(id: string): Promise<Mark> {
        const mark = await this.repository.findById(id);

        if (!mark) {
            throw AppError.notFound("Mark not found");
        }

        return mark;
    }

    public async update(
        id: string,
        input: UpdateMarkInput
    ): Promise<Mark> {
        await this.requireStudent(input.studentId);

        let mark: Mark | null;

        try {
            mark = await this.repository.update(id, input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }

        if (!mark) {
            throw AppError.notFound("Mark not found");
        }

        return mark;
    }

    public async remove(id: string): Promise<void> {
        const deleted = await this.repository.delete(id);

        if (!deleted) {
            throw AppError.notFound("Mark not found");
        }
    }

    public getSubjectAverages(): Promise<SubjectAverage[]> {
        return this.repository.findSubjectAverages();
    }
}
