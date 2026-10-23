import type { Pool } from "pg";
import pool from "../../middleware/db.js";
import type { CreateMarkInput, Mark, SubjectAverage, UpdateMarkInput } from "./mark.interface.js";

export class MarkRepository {
    private schemaPromise: Promise<void> | undefined;
    public constructor(private readonly database: Pool = pool) {}

    private async ensureSchema(): Promise<void> {
        this.schemaPromise ??= this.database.query(`
            CREATE TABLE IF NOT EXISTS student_marks (
                id UUID PRIMARY KEY,
                student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
                subject VARCHAR(255) NOT NULL CHECK (length(trim(subject)) > 0),
                marks NUMERIC(5, 2) NOT NULL CHECK (marks >= 0 AND marks <= 100),
                UNIQUE (student_id, subject)
            )
        `).then(() => undefined);
        return this.schemaPromise;
    }

    public async create(id: string, input: CreateMarkInput): Promise<Mark> {
        await this.ensureSchema();
        const result = await this.database.query<Mark>(
            `INSERT INTO student_marks (id, student_id, subject, marks)
             VALUES ($1, $2, $3, $4)
             RETURNING id, student_id AS "studentId", subject, marks`,
            [id, input.studentId, input.subject, input.marks],
        );
        return result.rows[0]!;
    }

    public async findAll(filters: { studentId?: string; subject?: string }): Promise<Mark[]> {
        await this.ensureSchema();
        const values: string[] = [];
        const predicates: string[] = [];
        if (filters.studentId) { values.push(filters.studentId); predicates.push(`student_id = $${values.length}`); }
        if (filters.subject) { values.push(filters.subject); predicates.push(`subject = $${values.length}`); }
        const where = predicates.length ? ` WHERE ${predicates.join(" AND ")}` : "";
        const result = await this.database.query<Mark>(
            `SELECT id, student_id AS "studentId", subject, marks FROM student_marks${where} ORDER BY subject, id`,
            values,
        );
        return result.rows.map((mark) => ({ ...mark, marks: Number(mark.marks) }));
    }

    public async findById(id: string): Promise<Mark | null> {
        await this.ensureSchema();
        const result = await this.database.query<Mark>(
            `SELECT id, student_id AS "studentId", subject, marks FROM student_marks WHERE id = $1`, [id],
        );
        const mark = result.rows[0];
        return mark ? { ...mark, marks: Number(mark.marks) } : null;
    }

    public async update(id: string, input: UpdateMarkInput): Promise<Mark | null> {
        await this.ensureSchema();
        const result = await this.database.query<Mark>(
            `UPDATE student_marks SET student_id = $2, subject = $3, marks = $4 WHERE id = $1
             RETURNING id, student_id AS "studentId", subject, marks`,
            [id, input.studentId, input.subject, input.marks],
        );
        const mark = result.rows[0];
        return mark ? { ...mark, marks: Number(mark.marks) } : null;
    }

    public async delete(id: string): Promise<boolean> {
        await this.ensureSchema();
        const result = await this.database.query("DELETE FROM student_marks WHERE id = $1", [id]);
        return result.rowCount === 1;
    }

    public async findSubjectAverages(): Promise<SubjectAverage[]> {
        await this.ensureSchema();
        const result = await this.database.query<{ subject: string; averageMarks: string; totalRecords: string }>(
            `SELECT subject, ROUND(AVG(marks), 2) AS "averageMarks", COUNT(*) AS "totalRecords"
             FROM student_marks GROUP BY subject ORDER BY subject`,
        );
        return result.rows.map((row) => ({
            subject: row.subject,
            averageMarks: Number(row.averageMarks),
            totalRecords: Number(row.totalRecords),
        }));
    }
}
