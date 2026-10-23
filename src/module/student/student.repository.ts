import type { Pool } from "pg";
import pool from "../../middleware/db.js";
import type { CreateStudentInput, Student, UpdateStudentInput } from "./student.interface.js";

export class StudentRepository {
    private schemaPromise: Promise<void> | undefined;

    public constructor(private readonly database: Pool = pool) {}

    private async ensureSchema(): Promise<void> {
        this.schemaPromise ??= this.database.query(`
            CREATE TABLE IF NOT EXISTS students (
                id UUID PRIMARY KEY,
                name VARCHAR(255) NOT NULL CHECK (length(trim(name)) > 0),
                email VARCHAR(255) NOT NULL UNIQUE
            )
        `).then(() => undefined);
        return this.schemaPromise;
    }

    public async create(id: string, input: CreateStudentInput): Promise<Student> {
        await this.ensureSchema();
        const result = await this.database.query<Student>(
            "INSERT INTO students (id, name, email) VALUES ($1, $2, $3) RETURNING id, name, email",
            [id, input.name, input.email],
        );
        return result.rows[0]!;
    }

    public async findAll(): Promise<Student[]> {
        await this.ensureSchema();
        const result = await this.database.query<Student>("SELECT id, name, email FROM students ORDER BY name, id");
        return result.rows;
    }

    public async findById(id: string): Promise<Student | null> {
        await this.ensureSchema();
        const result = await this.database.query<Student>("SELECT id, name, email FROM students WHERE id = $1", [id]);
        return result.rows[0] ?? null;
    }

    public async update(id: string, input: UpdateStudentInput): Promise<Student | null> {
        await this.ensureSchema();
        const result = await this.database.query<Student>(
            "UPDATE students SET name = $2, email = $3 WHERE id = $1 RETURNING id, name, email",
            [id, input.name, input.email],
        );
        return result.rows[0] ?? null;
    }

    public async delete(id: string): Promise<boolean> {
        await this.ensureSchema();
        const result = await this.database.query("DELETE FROM students WHERE id = $1", [id]);
        return result.rowCount === 1;
    }
}
