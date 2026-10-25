import type { Repository } from "typeorm";
import { Mark } from "./mark.entity.js";
import type { CreateMarkInput, MarkFilters, SubjectAverage, UpdateMarkInput } from "./mark.interface.js";
export declare class MarkRepository {
    private readonly repository;
    constructor(repository?: Repository<Mark>);
    create(input: CreateMarkInput): Promise<Mark>;
    findAll(filters: MarkFilters): Promise<Mark[]>;
    findById(id: string): Promise<Mark | null>;
    update(id: string, input: UpdateMarkInput): Promise<Mark | null>;
    delete(id: string): Promise<boolean>;
    findSubjectAverages(): Promise<SubjectAverage[]>;
}
//# sourceMappingURL=mark.repository.d.ts.map