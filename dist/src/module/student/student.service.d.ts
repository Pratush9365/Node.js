import { AccessPolicy } from "../access/access.policy.js";
import type { Actor } from "../access/access.interface.js";
import { Student } from "./student.entity.js";
import type { CreateStudentInput, IStudentRepository, UpdateStudentInput } from "./student.interface.js";
export declare class StudentService {
    private readonly repository;
    private readonly policy;
    constructor(repository?: IStudentRepository, policy?: AccessPolicy);
    private rethrowKnownDatabaseError;
    /** Loads a student and applies the scope check; "not yours" and "not there" are the same 404. */
    private loadAccessible;
    create(actor: Actor, input: CreateStudentInput): Promise<Student>;
    getAll(actor: Actor): Promise<Student[]>;
    getById(actor: Actor, id: string): Promise<Student>;
    update(actor: Actor, id: string, input: UpdateStudentInput): Promise<Student>;
    remove(actor: Actor, id: string): Promise<void>;
}
//# sourceMappingURL=student.service.d.ts.map