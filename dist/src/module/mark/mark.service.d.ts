import { StudentRepository } from "../student/student.repository.js";
import type { Mark } from "./mark.entity.js";
import type { CreateMarkInput, MarkFilters, SubjectAverage, UpdateMarkInput } from "./mark.interface.js";
import { MarkRepository } from "./mark.repository.js";
export declare class MarkService {
    private readonly repository;
    private readonly studentRepository;
    constructor(repository: MarkRepository, studentRepository: StudentRepository);
    private requireStudent;
    private rethrowKnownDatabaseError;
    create(input: CreateMarkInput): Promise<Mark>;
    getAll(filters: MarkFilters): Promise<Mark[]>;
    getById(id: string): Promise<Mark>;
    update(id: string, input: UpdateMarkInput): Promise<Mark>;
    remove(id: string): Promise<void>;
    getSubjectAverages(): Promise<SubjectAverage[]>;
}
//# sourceMappingURL=mark.service.d.ts.map