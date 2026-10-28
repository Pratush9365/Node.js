import { AppDataSource } from "../../config/data-source.js";
import { applyStudentScope } from "../access/student-scope.js";
import { Student } from "./student.entity.js";
export class StudentRepository {
    repository;
    constructor(repository = AppDataSource.getRepository(Student)) {
        this.repository = repository;
    }
    create(input) {
        return this.repository.save(this.repository.create(input));
    }
    findAll(scope) {
        const query = this.repository
            .createQueryBuilder("student")
            .orderBy("student.name", "ASC")
            .addOrderBy("student.id", "ASC");
        return applyStudentScope(query, "student", scope).getMany();
    }
    findById(id) {
        return this.repository.findOneBy({ id });
    }
    async update(id, input) {
        const student = await this.findById(id);
        if (!student)
            return null;
        return this.repository.save(Object.assign(student, input));
    }
    async delete(id) {
        const result = await this.repository.delete({ id });
        return result.affected === 1;
    }
}
//# sourceMappingURL=student.repository.js.map