import { randomUUID } from "node:crypto";
import { AppError } from "../../errors/AppError.js";
import { StudentRepository } from "../student/student.repository.js";
import type { CreateMarkInput, UpdateMarkInput } from "./mark.interface.js";
import { MarkRepository } from "./mark.repository.js";

export class MarkService {
    public constructor(
        private readonly repository = new MarkRepository(),
        private readonly studentRepository = new StudentRepository(),
    ) {}

    private async requireStudent(studentId: string): Promise<void> {
        if (!await this.studentRepository.findById(studentId)) throw AppError.notFound("Student not found");
    }

    private rethrowKnownDatabaseError(error: unknown): never {
        if (typeof error === "object" && error !== null && "code" in error) {
            if (error.code === "23505") throw AppError.conflict("A mark for this student and subject already exists");
            if (error.code === "23503") throw AppError.notFound("Student not found");
        }
        throw error;
    }

    public async create(input: CreateMarkInput) {
        await this.requireStudent(input.studentId);
        try {
            return await this.repository.create(randomUUID(), input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }
    }

    public getAll(filters: { studentId?: string; subject?: string }) { return this.repository.findAll(filters); }

    public async getById(id: string) {
        const mark = await this.repository.findById(id);
        if (!mark) throw AppError.notFound("Mark not found");
        return mark;
    }

    public async update(id: string, input: UpdateMarkInput) {
        await this.requireStudent(input.studentId);
        try {
            const mark = await this.repository.update(id, input);
            if (!mark) throw AppError.notFound("Mark not found");
            return mark;
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }
    }

    public async remove(id: string): Promise<void> { if (!await this.repository.delete(id)) throw AppError.notFound("Mark not found"); }

    public getSubjectAverages() { return this.repository.findSubjectAverages(); }
}
