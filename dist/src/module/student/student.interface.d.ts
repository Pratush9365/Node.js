import type { Student } from "./student.entity.js";
import type { StudentScope } from "../access/access.interface.js";
export interface CreateStudentInput {
    name: string;
    email: string;
    className: string;
    section: string;
}
export type UpdateStudentInput = CreateStudentInput;
/** Persistence contract used by the services, so tests can swap in an in-memory fake. */
export interface IStudentRepository {
    create(input: CreateStudentInput): Promise<Student>;
    /** Returns only the students inside `scope`; the service decides the scope, never the SQL. */
    findAll(scope: StudentScope): Promise<Student[]>;
    findById(id: string): Promise<Student | null>;
    update(id: string, input: UpdateStudentInput): Promise<Student | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=student.interface.d.ts.map