import { AppDataSource } from "../../config/data-source.js";
import { applyAveragesFilter, applyStudentScope } from "../access/student-scope.js";
import { Mark } from "./mark.entity.js";
export class MarkRepository {
    repository;
    constructor(repository = AppDataSource.getRepository(Mark)) {
        this.repository = repository;
    }
    create(input) {
        return this.repository.save(this.repository.create(input));
    }
    findAll(filters, scope) {
        const query = this.repository
            .createQueryBuilder("mark")
            .innerJoin("mark.student", "student")
            .orderBy("mark.subject", "ASC")
            .addOrderBy("mark.id", "ASC");
        if (filters.studentId)
            query.andWhere("mark.studentId = :studentId", { studentId: filters.studentId });
        if (filters.subject)
            query.andWhere("mark.subject = :subject", { subject: filters.subject });
        return applyStudentScope(query, "student", scope).getMany();
    }
    findById(id) {
        return this.repository.findOneBy({ id });
    }
    async update(id, input) {
        const mark = await this.findById(id);
        if (!mark)
            return null;
        return this.repository.save(Object.assign(mark, input));
    }
    async delete(id) {
        const result = await this.repository.delete({ id });
        return result.affected === 1;
    }
    async findSubjectAverages(filter) {
        const query = this.repository
            .createQueryBuilder("mark")
            .innerJoin("mark.student", "student")
            .select("mark.subject", "subject")
            .addSelect("ROUND(AVG(mark.marks), 2)", "averageMarks")
            .addSelect("COUNT(*)", "totalRecords");
        const rows = await applyAveragesFilter(query, "student", filter)
            .groupBy("mark.subject")
            .orderBy("mark.subject", "ASC")
            .getRawMany();
        return rows.map((row) => ({
            subject: row.subject,
            averageMarks: Number(row.averageMarks),
            totalRecords: Number(row.totalRecords),
        }));
    }
}
//# sourceMappingURL=mark.repository.js.map