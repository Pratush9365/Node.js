import type { AveragesFilter, StudentScope } from "../access/access.interface.js";
import type { Mark } from "./mark.entity.js";
export interface CreateMarkInput {
    studentId: string;
    subject: string;
    marks: number;
}
export type UpdateMarkInput = CreateMarkInput;
export interface MarkFilters {
    studentId?: string;
    subject?: string;
}
export interface SubjectAverage {
    subject: string;
    averageMarks: number;
    totalRecords: number;
}
/** Optional ?className=&section= narrowing for the averages endpoint. */
export interface AveragesQuery {
    className?: string;
    section?: string;
}
/** Persistence contract used by the services, so tests can swap in an in-memory fake. */
export interface IMarkRepository {
    create(input: CreateMarkInput): Promise<Mark>;
    /** Returns only marks of students inside `scope`. */
    findAll(filters: MarkFilters, scope: StudentScope): Promise<Mark[]>;
    findById(id: string): Promise<Mark | null>;
    update(id: string, input: UpdateMarkInput): Promise<Mark | null>;
    delete(id: string): Promise<boolean>;
    findSubjectAverages(filter: AveragesFilter): Promise<SubjectAverage[]>;
}
//# sourceMappingURL=mark.interface.d.ts.map