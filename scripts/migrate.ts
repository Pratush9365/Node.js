import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const DEFAULT_DB_PORT = 5432;

function requireEnv(name: string): string {
    const value = process.env[name];
    if (value === undefined || value === "") throw new Error(`Missing required environment variable: ${name}`);
    return value;
}

/** Applies db/schema.sql (run from the project root). The file is idempotent, so running it twice is fine. */
async function migrate(): Promise<void> {
    const sql = await readFile(path.resolve(process.cwd(), "db", "schema.sql"), "utf8");
    const client = new pg.Client({
        host: requireEnv("DB_HOST"),
        port: Number(process.env.DB_PORT || DEFAULT_DB_PORT),
        user: requireEnv("DB_USER"),
        password: process.env.DB_PASSWORD ?? "",
        database: requireEnv("DB_NAME"),
    });
    await client.connect();
    try {
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        console.log("Database schema is up to date");
    } catch (error: unknown) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        await client.end();
    }
}

migrate().catch((error: unknown) => {
    console.error("Migration failed:", error);
    process.exit(1);
});
