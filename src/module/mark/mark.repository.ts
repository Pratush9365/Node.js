import type { FindOptionsWhere, Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import { Mark } from "./mark.entity.js";
import type { CreateMarkInput, MarkFilters, SubjectAverage, UpdateMarkInput } from "./mark.interface.js";

export class MarkRepository {
    public constructor(private readonly repository: Repository<Mark> = AppDataSource.getRepository(Mark)) {}

    public create(input: CreateMarkInput): Promise<Mark> {
        return this.repository.save(this.repository.create(input));
    }

    public findAll(filters: MarkFilters): Promise<Mark[]> {
        const where: FindOptionsWhere<Mark> = {};
        if (filters.studentId) where.studentId = filters.studentId;
        if (filters.subject) where.subject = filters.subject;
        return this.repository.find({ where, order: { subject: "ASC", id: "ASC" } });
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

    public async findSubjectAverages(): Promise<SubjectAverage[]> {
        const rows = await this.repository
            .createQueryBuilder("mark")
            .select("mark.subject", "subject")
            .addSelect("ROUND(AVG(mark.marks), 2)", "averageMarks")
            .addSelect("COUNT(*)", "totalRecords")
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
