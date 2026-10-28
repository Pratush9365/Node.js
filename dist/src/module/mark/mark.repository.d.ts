import type { Repository } from "typeorm";
import type { AveragesFilter, StudentScope } from "../access/access.interface.js";
import { Mark } from "./mark.entity.js";
import type { CreateMarkInput, IMarkRepository, MarkFilters, SubjectAverage, UpdateMarkInput } from "./mark.interface.js";
export declare class MarkRepository implements IMarkRepository {
    private readonly repository;
    constructor(repository?: Repository<Mark>);
    create(input: CreateMarkInput): Promise<Mark>;
    findAll(filters: MarkFilters, scope: StudentScope): Promise<Mark[]>;
    findById(id: string): Promise<Mark | null>;
    update(id: string, input: UpdateMarkInput): Promise<Mark | null>;
    delete(id: string): Promise<boolean>;
    findSubjectAverages(filter: AveragesFilter): Promise<SubjectAverage[]>;
}
//# sourceMappingURL=mark.repository.d.ts.map