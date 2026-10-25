/** PostgreSQL error codes this application knows how to translate. */
export const PgErrorCode = {
    UNIQUE_VIOLATION: "23505",
    FOREIGN_KEY_VIOLATION: "23503",
} as const;

function readCode(value: unknown): string | undefined {
    if (typeof value === "object" && value !== null && "code" in value && typeof value.code === "string") {
        return value.code;
    }
    return undefined;
}

/** Reads the PostgreSQL error code from a TypeORM `QueryFailedError` (or a raw driver error). */
export function getDatabaseErrorCode(error: unknown): string | undefined {
    if (typeof error === "object" && error !== null && "driverError" in error) {
        return readCode(error.driverError) ?? readCode(error);
    }
    return readCode(error);
}
