import { StudentRepository } from "../student/student.repository.js";
import type { CreateMarkInput, UpdateMarkInput } from "./mark.interface.js";
import { MarkRepository } from "./mark.repository.js";
export declare class MarkService {
    private readonly repository;
    private readonly studentRepository;
    constructor(repository?: MarkRepository, studentRepository?: StudentRepository);
    private requireStudent;
    private rethrowKnownDatabaseError;
    create(input: CreateMarkInput): Promise<import("./mark.interface.js").Mark>;
    getAll(filters: {
        studentId?: string;
        subject?: string;
    }): Promise<import("./mark.interface.js").Mark[]>;
    getById(id: string): Promise<import("./mark.interface.js").Mark>;
    update(id: string, input: UpdateMarkInput): Promise<import("./mark.interface.js").Mark>;
    remove(id: string): Promise<void>;
    getSubjectAverages(): Promise<import("./mark.interface.js").SubjectAverage[]>;
}
//# sourceMappingURL=mark.service.d.ts.map