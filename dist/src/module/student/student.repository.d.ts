import type { Repository } from "typeorm";
import type { StudentScope } from "../access/access.interface.js";
import type { CreateStudentInput, IStudentRepository, UpdateStudentInput } from "./student.interface.js";
import { Student } from "./student.entity.js";
export declare class StudentRepository implements IStudentRepository {
    private readonly repository;
    constructor(repository?: Repository<Student>);
    create(input: CreateStudentInput): Promise<Student>;
    findAll(scope: StudentScope): Promise<Student[]>;
    findById(id: string): Promise<Student | null>;
    update(id: string, input: UpdateStudentInput): Promise<Student | null>;
    delete(id: string): Promise<boolean>;
}
//# sourceMappingURL=student.repository.d.ts.map