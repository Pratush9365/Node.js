import type { CreateStudentInput, UpdateStudentInput } from "./student.interface.js";
import { StudentRepository } from "./student.repository.js";
export declare class StudentService {
    private readonly repository;
    constructor(repository?: StudentRepository);
    private isUniqueViolation;
    create(input: CreateStudentInput): Promise<import("./student.interface.js").Student>;
    getAll(): Promise<import("./student.interface.js").Student[]>;
    getById(id: string): Promise<import("./student.interface.js").Student>;
    update(id: string, input: UpdateStudentInput): Promise<import("./student.interface.js").Student>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=student.service.d.ts.map