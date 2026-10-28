import { AppError } from "../../errors/AppError.js";
import { getDatabaseErrorCode, PgErrorCode } from "../../errors/databaseError.js";
import { AccessPolicy, STUDENT_NOT_FOUND } from "../access/access.policy.js";
import type { Actor } from "../access/access.interface.js";
import { Student } from "./student.entity.js";
import type { CreateStudentInput, IStudentRepository, UpdateStudentInput } from "./student.interface.js";
import { StudentRepository } from "./student.repository.js";

export class StudentService {
    public constructor(
        private readonly repository: IStudentRepository = new StudentRepository(),
        private readonly policy = new AccessPolicy(),
    ) {}

    private rethrowKnownDatabaseError(error: unknown): never {
        if (getDatabaseErrorCode(error) === PgErrorCode.UNIQUE_VIOLATION) {
            throw AppError.conflict("A student with this email already exists");
        }
        throw error;
    }

    /** Loads a student and applies the scope check; "not yours" and "not there" are the same 404. */
    private async loadAccessible(actor: Actor, id: string, action: "read" | "write"): Promise<Student> {
        const student = await this.repository.findById(id);
        if (!student) throw AppError.notFound(STUDENT_NOT_FOUND);
        await this.policy.requireStudentAccess(actor, student, action, "students");
        return student;
    }

    public async create(actor: Actor, input: CreateStudentInput): Promise<Student> {
        // The student does not exist yet, so there is no id to scope on: only a ":any" write permission passes.
        await this.policy.requireStudentAccess(actor, { id: "", ...input }, "write", "students");
        try {
            return await this.repository.create(input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }
    }

    public async getAll(actor: Actor): Promise<Student[]> {
        const scope = await this.policy.scopeFor(actor, "read", "students");
        return this.repository.findAll(scope);
    }

    public getById(actor: Actor, id: string): Promise<Student> {
        return this.loadAccessible(actor, id, "read");
    }

    public async update(actor: Actor, id: string, input: UpdateStudentInput): Promise<Student> {
        await this.loadAccessible(actor, id, "write");
        // A student may also be moved to another class; that needs write access to the destination too.
        await this.policy.requireStudentAccess(actor, { id, ...input }, "write", "students");
        let student: Student | null;
        try {
            student = await this.repository.update(id, input);
        } catch (error: unknown) {
            return this.rethrowKnownDatabaseError(error);
        }
        if (!student) throw AppError.notFound(STUDENT_NOT_FOUND);
        return student;
    }

    public async remove(actor: Actor, id: string): Promise<void> {
        await this.loadAccessible(actor, id, "write");
        if (!(await this.repository.delete(id))) throw AppError.notFound(STUDENT_NOT_FOUND);
    }
}
