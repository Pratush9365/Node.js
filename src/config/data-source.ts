import "dotenv/config";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { TeacherClass } from "../module/access/teacher-class.entity.js";
import { Mark } from "../module/mark/mark.entity.js";
import { Student } from "../module/student/student.entity.js";
import { Customer } from "../module/user/customer.entity.js";
import { User } from "../module/user/user.entity.js";

const DEFAULT_DB_PORT = 5432;
const MAX_CONNECTIONS = 10;

function requireEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined || value === "") throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

export const AppDataSource = new DataSource({
    type: "postgres",
    host: requireEnv("DB_HOST"),
    port: Number(process.env.DB_PORT || DEFAULT_DB_PORT),
    username: requireEnv("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    database: requireEnv("DB_NAME"),
    entities: [Student, Mark, Customer, User, TeacherClass],
    // Uses the built-in gen_random_uuid() for generated UUID primary keys.
    uuidExtension: "pgcrypto",
    // Creates/updates tables from the entities (replaces the old CREATE TABLE IF NOT EXISTS calls).
    // Disable in production and use migrations (npm run db:migrate) instead.
    synchronize: process.env.NODE_ENV !== "production",
    extra: { max: MAX_CONNECTIONS },
});
