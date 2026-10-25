import type { Repository } from "typeorm";
import type { CreateStudentInput, UpdateStudentInput } from "./student.interface.js";
import { Student } from "./student.entity.js";
export declare class StudentRepository {
    private readonly repository;
    constructor(repository?: Repository<Student>);
    create(input: CreateStudentInput): Promise<Student>;
    findAll(): Promise<Student[]>;
    findById(id: string): Promise<Student | null>;
    update(id: string, input: UpdateStudentInput): Promise<Student | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=student.repository.d.ts.map