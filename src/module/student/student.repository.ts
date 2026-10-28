import type { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import type { StudentScope } from "../access/access.interface.js";
import { applyStudentScope } from "../access/student-scope.js";
import type { CreateStudentInput, IStudentRepository, UpdateStudentInput } from "./student.interface.js";
import { Student } from "./student.entity.js";

export class StudentRepository implements IStudentRepository {
    public constructor(private readonly repository: Repository<Student> = AppDataSource.getRepository(Student)) {}

    public create(input: CreateStudentInput): Promise<Student> {
        return this.repository.save(this.repository.create(input));
    }

    public findAll(scope: StudentScope): Promise<Student[]> {
        const query = this.repository
            .createQueryBuilder("student")
            .orderBy("student.name", "ASC")
            .addOrderBy("student.id", "ASC");
        return applyStudentScope(query, "student", scope).getMany();
    }

    public findById(id: string): Promise<Student | null> {
        return this.repository.findOneBy({ id });
    }

    public async update(id: string, input: UpdateStudentInput): Promise<Student | null> {
        const student = await this.findById(id);
        if (!student) return null;
        return this.repository.save(Object.assign(student, input));
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete({ id });
        return result.affected === 1;
    }
}
