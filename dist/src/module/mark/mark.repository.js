import pool from "../../middleware/db.js";
export class MarkRepository {
    database;
    schemaPromise;
    constructor(database = pool) {
        this.database = database;
    }
    async ensureSchema() {
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
    async create(id, input) {
        await this.ensureSchema();
        const result = await this.database.query(`INSERT INTO student_marks (id, student_id, subject, marks)
             VALUES ($1, $2, $3, $4)
             RETURNING id, student_id AS "studentId", subject, marks`, [id, input.studentId, input.subject, input.marks]);
        return result.rows[0];
    }
    async findAll(filters) {
        await this.ensureSchema();
        const values = [];
        const predicates = [];
        if (filters.studentId) {
            values.push(filters.studentId);
            predicates.push(`student_id = $${values.length}`);
        }
        if (filters.subject) {
            values.push(filters.subject);
            predicates.push(`subject = $${values.length}`);
        }
        const where = predicates.length ? ` WHERE ${predicates.join(" AND ")}` : "";
        const result = await this.database.query(`SELECT id, student_id AS "studentId", subject, marks FROM student_marks${where} ORDER BY subject, id`, values);
        return result.rows.map((mark) => ({ ...mark, marks: Number(mark.marks) }));
    }
    async findById(id) {
        await this.ensureSchema();
        const result = await this.database.query(`SELECT id, student_id AS "studentId", subject, marks FROM student_marks WHERE id = $1`, [id]);
        const mark = result.rows[0];
        return mark ? { ...mark, marks: Number(mark.marks) } : null;
    }
    async update(id, input) {
        await this.ensureSchema();
        const result = await this.database.query(`UPDATE student_marks SET student_id = $2, subject = $3, marks = $4 WHERE id = $1
             RETURNING id, student_id AS "studentId", subject, marks`, [id, input.studentId, input.subject, input.marks]);
        const mark = result.rows[0];
        return mark ? { ...mark, marks: Number(mark.marks) } : null;
    }
    async delete(id) {
        await this.ensureSchema();
        const result = await this.database.query("DELETE FROM student_marks WHERE id = $1", [id]);
        return result.rowCount === 1;
    }
    async findSubjectAverages() {
        await this.ensureSchema();
        const result = await this.database.query(`SELECT subject, ROUND(AVG(marks), 2) AS "averageMarks", COUNT(*) AS "totalRecords"
             FROM student_marks GROUP BY subject ORDER BY subject`);
        return result.rows.map((row) => ({
            subject: row.subject,
            averageMarks: Number(row.averageMarks),
            totalRecords: Number(row.totalRecords),
        }));
    }
}
//# sourceMappingURL=mark.repository.js.map