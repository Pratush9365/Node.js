import { AppError } from "../../errors/AppError.js";
import { getDatabaseErrorCode, PgErrorCode } from "../../errors/databaseError.js";
import { AccessPolicy, STUDENT_NOT_FOUND } from "../access/access.policy.js";
import { StudentRepository } from "../student/student.repository.js";
import { MarkRepository } from "./mark.repository.js";
const MARK_NOT_FOUND = "Mark not found";
export class MarkService {
    repository;
    studentRepository;
    policy;
    constructor(repository = new MarkRepository(), studentRepository = new StudentRepository(), policy = new AccessPolicy()) {
        this.repository = repository;
        this.studentRepository = studentRepository;
        this.policy = policy;
    }
    async requireStudent(studentId) {
        const student = await this.studentRepository.findById(studentId);
        if (!student)
            throw AppError.notFound(STUDENT_NOT_FOUND);
        return student;
    }
    /** Loads a mark whose student the actor may read / write; "not yours" and "not there" are the same 404. */
    async loadAccessible(actor, id, action) {
        const mark = await this.repository.findById(id);
        if (!mark)
            throw AppError.notFound(MARK_NOT_FOUND);
        const student = await this.studentRepository.findById(mark.studentId);
        if (!student)
            throw AppError.notFound(MARK_NOT_FOUND);
        await this.policy.requireStudentAccess(actor, student, action, "marks", MARK_NOT_FOUND);
        return mark;
    }
    rethrowKnownDatabaseError(error) {
        switch (getDatabaseErrorCode(error)) {
            case PgErrorCode.UNIQUE_VIOLATION:
                throw AppError.conflict("A mark for this student and subject already exists");
            case PgErrorCode.FOREIGN_KEY_VIOLATION:
                throw AppError.notFound(STUDENT_NOT_FOUND);
            default:
                throw error;
        }
    }
    async create(actor, input) {
        const student = await this.requireStudent(input.studentId);
        await this.policy.requireStudentAccess(actor, student, "write", "marks");
        try {
            return await this.repository.create(input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
    }
    async getAll(actor, filters) {
        const scope = await this.policy.scopeFor(actor, "read", "marks");
        return this.repository.findAll(filters, scope);
    }
    getById(actor, id) {
        return this.loadAccessible(actor, id, "read");
    }
    async update(actor, id, input) {
        const current = await this.loadAccessible(actor, id, "write");
        // Moving a mark to another student needs write access to the destination too.
        if (input.studentId !== current.studentId) {
            const target = await this.requireStudent(input.studentId);
            await this.policy.requireStudentAccess(actor, target, "write", "marks");
        }
        let mark;
        try {
            mark = await this.repository.update(id, input);
        }
        catch (error) {
            return this.rethrowKnownDatabaseError(error);
        }
        if (!mark)
            throw AppError.notFound(MARK_NOT_FOUND);
        return mark;
    }
    async remove(actor, id) {
        await this.loadAccessible(actor, id, "write");
        if (!(await this.repository.delete(id)))
            throw AppError.notFound(MARK_NOT_FOUND);
    }
    async getSubjectAverages(actor, query) {
        const filter = await this.policy.averagesFilter(actor, query);
        return this.repository.findSubjectAverages(filter);
    }
}
//# sourceMappingURL=mark.service.js.map