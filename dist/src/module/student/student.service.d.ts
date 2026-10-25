import { Student } from "./student.entity.js";
import type { CreateStudentInput, UpdateStudentInput } from "./student.interface.js";
import { StudentRepository } from "./student.repository.js";
export declare class StudentService {
    private readonly repository;
    constructor(repository?: StudentRepository);
    private rethrowKnownDatabaseError;
    create(input: CreateStudentInput): Promise<Student>;
    getAll(): Promise<Student[]>;
    getById(id: string): Promise<Student>;
    update(id: string, input: UpdateStudentInput): Promise<Student>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=student.service.d.ts.map