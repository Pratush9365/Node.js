import { AppDataSource } from "../../config/data-source.js";
import { Mark } from "./mark.entity.js";
export class MarkRepository {
    repository;
    constructor(repository = AppDataSource.getRepository(Mark)) {
        this.repository = repository;
    }
    create(input) {
        return this.repository.save(this.repository.create(input));
    }
    findAll(filters) {
        const where = {};
        if (filters.studentId)
            where.studentId = filters.studentId;
        if (filters.subject)
            where.subject = filters.subject;
        return this.repository.find({ where, order: { subject: "ASC", id: "ASC" } });
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
    async findSubjectAverages() {
        const rows = await this.repository
            .createQueryBuilder("mark")
            .select("mark.subject", "subject")
            .addSelect("ROUND(AVG(mark.marks), 2)", "averageMarks")
            .addSelect("COUNT(*)", "totalRecords")
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