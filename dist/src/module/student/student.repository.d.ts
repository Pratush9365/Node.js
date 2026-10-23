import type { Pool } from "pg";
import type { CreateStudentInput, Student, UpdateStudentInput } from "./student.interface.js";
export declare class StudentRepository {
    private readonly database;
    private schemaPromise;
    constructor(database?: Pool);
    private ensureSchema;
    create(id: string, input: CreateStudentInput): Promise<Student>;
    findAll(): Promise<Student[]>;
    findById(id: string): Promise<Student | null>;
    update(id: string, input: UpdateStudentInput): Promise<Student | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=student.repository.d.ts.map