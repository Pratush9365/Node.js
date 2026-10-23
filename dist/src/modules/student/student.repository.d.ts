import type { Student, StudentChanges, StudentRow, StudentWritableColumns } from "./student.interface.js";
export declare class StudentRepository {
    static toDomain(row: StudentRow): Student;
    static toPersistence(changes: StudentChanges): StudentWritableColumns;
    static findById(id: number): Promise<Student | null>;
    static insert(changes: StudentChanges): Promise<Student>;
}
//# sourceMappingURL=student.repository.d.ts.map