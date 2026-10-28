import type { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import type { AveragesFilter, StudentScope } from "../access/access.interface.js";
import { applyAveragesFilter, applyStudentScope } from "../access/student-scope.js";
import { Mark } from "./mark.entity.js";
import type { CreateMarkInput, IMarkRepository, MarkFilters, SubjectAverage, UpdateMarkInput } from "./mark.interface.js";

export class MarkRepository implements IMarkRepository {
    public constructor(private readonly repository: Repository<Mark> = AppDataSource.getRepository(Mark)) {}

    public create(input: CreateMarkInput): Promise<Mark> {
        return this.repository.save(this.repository.create(input));
    }

    public findAll(filters: MarkFilters, scope: StudentScope): Promise<Mark[]> {
        const query = this.repository
            .createQueryBuilder("mark")
            .innerJoin("mark.student", "student")
            .orderBy("mark.subject", "ASC")
            .addOrderBy("mark.id", "ASC");
        if (filters.studentId) query.andWhere("mark.studentId = :studentId", { studentId: filters.studentId });
        if (filters.subject) query.andWhere("mark.subject = :subject", { subject: filters.subject });
        return applyStudentScope(query, "student", scope).getMany();
    }

    public findById(id: string): Promise<Mark | null> {
        return this.repository.findOneBy({ id });
    }

    public async update(id: string, input: UpdateMarkInput): Promise<Mark | null> {
        const mark = await this.findById(id);
        if (!mark) return null;
        return this.repository.save(Object.assign(mark, input));
    }

    public async delete(id: string): Promise<boolean> {
        const result = await this.repository.delete({ id });
        return result.affected === 1;
    }

    public async findSubjectAverages(filter: AveragesFilter): Promise<SubjectAverage[]> {
        const query = this.repository
            .createQueryBuilder("mark")
            .innerJoin("mark.student", "student")
            .select("mark.subject", "subject")
            .addSelect("ROUND(AVG(mark.marks), 2)", "averageMarks")
            .addSelect("COUNT(*)", "totalRecords");
        const rows = await applyAveragesFilter(query, "student", filter)
            .groupBy("mark.subject")
            .orderBy("mark.subject", "ASC")
            .getRawMany<{ subject: string; averageMarks: string; totalRecords: string }>();

        return rows.map((row) => ({
            subject: row.subject,
            averageMarks: Number(row.averageMarks),
            totalRecords: Number(row.totalRecords),
        }));
    }
}
