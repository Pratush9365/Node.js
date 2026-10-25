import pool from "../../middleware/db.js";
export class StudentRepository {
    database;
    schemaPromise;
    constructor(database = pool) {
        this.database = database;
    }
    async ensureSchema() {
        this.schemaPromise ??= this.database.query(`
            CREATE TABLE IF NOT EXISTS students (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL CHECK (length(trim(name)) > 0),
                email VARCHAR(255) NOT NULL UNIQUE
            )
        `).then(() => undefined);
        return this.schemaPromise;
    }
    async create(id, input) {
        await this.ensureSchema();
        const result = await this.database.query("INSERT INTO students (id, name, email) VALUES ($1, $2, $3) RETURNING id, name, email", [id, input.name, input.email]);
        return result.rows[0];
    }
    async findAll() {
        await this.ensureSchema();
        const result = await this.database.query("SELECT id, name, email FROM students ORDER BY name, id");
        return result.rows;
    }
    async findById(id) {
        await this.ensureSchema();
        const result = await this.database.query("SELECT id, name, email FROM students WHERE id = $1", [id]);
        return result.rows[0] ?? null;
    }
    async update(id, input) {
        await this.ensureSchema();
        const result = await this.database.query("UPDATE students SET name = $2, email = $3 WHERE id = $1 RETURNING id, name, email", [id, input.name, input.email]);
        return result.rows[0] ?? null;
    }
    async delete(id) {
        await this.ensureSchema();
        const result = await this.database.query("DELETE FROM students WHERE id = $1", [id]);
        return result.rowCount === 1;
    }
}
//# sourceMappingURL=student.repository.js.map