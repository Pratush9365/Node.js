import { AppError } from "../../errors/AppError.js";
import { getDatabaseErrorCode, PgErrorCode } from "../../errors/databaseError.js";
import { AccessPolicy, STUDENT_NOT_FOUND } from "../access/access.policy.js";
import { Student } from "./student.entity.js";
import { StudentRepository } from "./student.repository.js";
export class StudentService {
    repository;
    policy;
    constructor(repository = new StudentRepository(), policy = new AccessPolicy()) {
        this.repository = repository;
        this.policy = policy;
    }
    rethrowKnownDatabaseError(error) {
        if (getDatabaseErrorCode(error) === PgErrorCode.UNIQUE_VIOLATION) {
            throw AppError.conflict("A student with this email already exists");
        }
        throw error;
    }
    /** Loads a student and applies the scope check; "not yours" and "not there" are the same 404. */
    async loadAccessible(actor, id, action) {
        const student = await this.repository.findById(id);
        if (!student)
            throw AppError.notFound(STUDENT_NOT_FOUND);
        await this.policy.requireStudentAccess(actor, student, action, "students");
        return student;
    }
    async create(actor, input) {
        // The student does not exist yet, so there is no id to scope on: only a ":any" write permission passes.
        await this.policy.requireStudentAccess(actor, { id: "", ...input }, "write", "students");
        try {
            return await this.repository.create(input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
    }
    async getAll(actor) {
        const scope = await this.policy.scopeFor(actor, "read", "students");
        return this.repository.findAll(scope);
    }
    getById(actor, id) {
        return this.loadAccessible(actor, id, "read");
    }
    async update(actor, id, input) {
        await this.loadAccessible(actor, id, "write");
        // A student may also be moved to another class; that needs write access to the destination too.
        await this.policy.requireStudentAccess(actor, { id, ...input }, "write", "students");
        let student;
        try {
            student = await this.repository.update(id, input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
        if (!student)
            throw AppError.notFound(STUDENT_NOT_FOUND);
        return student;
    }
    async remove(actor, id) {
        await this.loadAccessible(actor, id, "write");
        if (!(await this.repository.delete(id)))
            throw AppError.notFound(STUDENT_NOT_FOUND);
    }
}
//# sourceMappingURL=student.service.js.map