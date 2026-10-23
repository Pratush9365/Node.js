import type { Pool } from "pg";
import type { CreateMarkInput, Mark, SubjectAverage, UpdateMarkInput } from "./mark.interface.js";
export declare class MarkRepository {
    private readonly database;
    private schemaPromise;
    constructor(database?: Pool);
    private ensureSchema;
    create(id: string, input: CreateMarkInput): Promise<Mark>;
    findAll(filters: {
        studentId?: string;
        subject?: string;
    }): Promise<Mark[]>;
    findById(id: string): Promise<Mark | null>;
    update(id: string, input: UpdateMarkInput): Promise<Mark | null>;
    delete(id: string): Promise<boolean>;
    findSubjectAverages(): Promise<SubjectAverage[]>;
}
//# sourceMappingURL=mark.repository.d.ts.map