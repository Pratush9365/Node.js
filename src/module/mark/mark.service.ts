import { AppError } from "../../errors/AppError.js";
import { getDatabaseErrorCode, PgErrorCode } from "../../errors/databaseError.js";
import { AccessPolicy, STUDENT_NOT_FOUND } from "../access/access.policy.js";
import type { Actor } from "../access/access.interface.js";
import type { IStudentRepository } from "../student/student.interface.js";
import { StudentRepository } from "../student/student.repository.js";
import type { Student } from "../student/student.entity.js";
import type { Mark } from "./mark.entity.js";
import type {
    AveragesQuery,
    CreateMarkInput,
    IMarkRepository,
    MarkFilters,
    SubjectAverage,
    UpdateMarkInput,
} from "./mark.interface.js";
import { MarkRepository } from "./mark.repository.js";

const MARK_NOT_FOUND = "Mark not found";

export class MarkService {
    public constructor(
        private readonly repository: IMarkRepository = new MarkRepository(),
        private readonly studentRepository: IStudentRepository = new StudentRepository(),
        private readonly policy = new AccessPolicy(),
    ) {}

    private async requireStudent(studentId: string): Promise<Student> {
        const student = await this.studentRepository.findById(studentId);
        if (!student) throw AppError.notFound(STUDENT_NOT_FOUND);
        return student;
    }

    /** Loads a mark whose student the actor may read / write; "not yours" and "not there" are the same 404. */
    private async loadAccessible(actor: Actor, id: string, action: "read" | "write"): Promise<Mark> {
        const mark = await this.repository.findById(id);
        if (!mark) throw AppError.notFound(MARK_NOT_FOUND);
        const student = await this.studentRepository.findById(mark.studentId);
        if (!student) throw AppError.notFound(MARK_NOT_FOUND);
        await this.policy.requireStudentAccess(actor, student, action, "marks", MARK_NOT_FOUND);
        return mark;
    }

    private rethrowKnownDatabaseError(error: unknown): never {
        switch (getDatabaseErrorCode(error)) {
            case PgErrorCode.UNIQUE_VIOLATION:
                throw AppError.conflict("A mark for this student and subject already exists");
            case PgErrorCode.FOREIGN_KEY_VIOLATION:
                throw AppError.notFound(STUDENT_NOT_FOUND);
            default:
                throw error;
        }
    }

    public async create(actor: Actor, input: CreateMarkInput): Promise<Mark> {
        const student = await this.requireStudent(input.studentId);
        await this.policy.requireStudentAccess(actor, student, "write", "marks");
        try {
            return await this.repository.create(input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }
    }

    public async getAll(actor: Actor, filters: MarkFilters): Promise<Mark[]> {
        const scope = await this.policy.scopeFor(actor, "read", "marks");
        return this.repository.findAll(filters, scope);
    }

    public getById(actor: Actor, id: string): Promise<Mark> {
        return this.loadAccessible(actor, id, "read");
    }

    public async update(actor: Actor, id: string, input: UpdateMarkInput): Promise<Mark> {
        const current = await this.loadAccessible(actor, id, "write");
        // Moving a mark to another student needs write access to the destination too.
        if (input.studentId !== current.studentId) {
            const target = await this.requireStudent(input.studentId);
            await this.policy.requireStudentAccess(actor, target, "write", "marks");
        }
        let mark: Mark | null;
        try {
            mark = await this.repository.update(id, input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }
        if (!mark) throw AppError.notFound(MARK_NOT_FOUND);
        return mark;
    }

    public async remove(actor: Actor, id: string): Promise<void> {
        await this.loadAccessible(actor, id, "write");
        if (!(await this.repository.delete(id))) throw AppError.notFound(MARK_NOT_FOUND);
    }

    public async getSubjectAverages(actor: Actor, query: AveragesQuery): Promise<SubjectAverage[]> {
        const filter = await this.policy.averagesFilter(actor, query);
        return this.repository.findSubjectAverages(filter);
    }
}
