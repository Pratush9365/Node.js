import { AccessPolicy } from "../access/access.policy.js";
import type { Actor } from "../access/access.interface.js";
import type { IStudentRepository } from "../student/student.interface.js";
import type { Mark } from "./mark.entity.js";
import type { AveragesQuery, CreateMarkInput, IMarkRepository, MarkFilters, SubjectAverage, UpdateMarkInput } from "./mark.interface.js";
export declare class MarkService {
    private readonly repository;
    private readonly studentRepository;
    private readonly policy;
    constructor(repository?: IMarkRepository, studentRepository?: IStudentRepository, policy?: AccessPolicy);
    private requireStudent;
    /** Loads a mark whose student the actor may read / write; "not yours" and "not there" are the same 404. */
    private loadAccessible;
    private rethrowKnownDatabaseError;
    create(actor: Actor, input: CreateMarkInput): Promise<Mark>;
    getAll(actor: Actor, filters: MarkFilters): Promise<Mark[]>;
    getById(actor: Actor, id: string): Promise<Mark>;
    update(actor: Actor, id: string, input: UpdateMarkInput): Promise<Mark>;
    remove(actor: Actor, id: string): Promise<void>;
    getSubjectAverages(actor: Actor, query: AveragesQuery): Promise<SubjectAverage[]>;
}
//# sourceMappingURL=mark.service.d.ts.map