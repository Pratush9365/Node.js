import "dotenv/config";
import { z } from "zod";
const academicYear = z.string().regex(/^\d{4}-\d{2}$/, "must use YYYY-YY format").refine((value) => Number(value.slice(5)) === (Number(value.slice(0, 4)) + 1) % 100, { message: "second year must follow the first" });
export const CORS_WILDCARD_MESSAGE = 'must not be "*". Allowing every origin lets any website a logged-in user visits call this API from their browser, '
    + "so list each trusted origin explicitly (comma separated), e.g. https://school.example.com";
const DEFAULT_MARKS_RATE_LIMIT_MAX = 60;
const MIN_JWT_SECRET_LENGTH = 32;
/** Comma separated list of full origins. A wildcard gets its own, explanatory error. */
const corsOrigins = z.string().default("http://localhost:3000").superRefine((value, ctx) => {
    const origins = value.split(",").map((origin) => origin.trim()).filter(Boolean);
    if (origins.length === 0) {
        ctx.addIssue({ code: "custom", message: "must list at least one origin" });
        return;
    }
    if (origins.includes("*")) {
        ctx.addIssue({ code: "custom", message: CORS_WILDCARD_MESSAGE });
        return;
    }
    for (const origin of origins) {
        if (!URL.canParse(origin))
            ctx.addIssue({ code: "custom", message: `"${origin}" must be a full URL such as https://school.example.com` });
    }
}).transform((value) => value.split(",").map((origin) => origin.trim()).filter(Boolean));
export class EnvironmentConfig {
    static schema = z.object({
        DB_HOST: z.string().min(1), DB_PORT: z.coerce.number().int().positive().default(5432),
        DB_NAME: z.string().min(1), DB_USER: z.string().min(1), DB_PASSWORD: z.string(),
        PORT: z.coerce.number().int().positive().default(3000),
        PASS_PERCENTAGE: z.coerce.number({ error: "PASS_PERCENTAGE is required but missing" }).min(0).max(100),
        ACADEMIC_YEAR: academicYear,
        JWT_SECRET: z.string().min(MIN_JWT_SECRET_LENGTH, `must be at least ${MIN_JWT_SECRET_LENGTH} characters`),
        CORS_ORIGINS: corsOrigins,
        MARKS_RATE_LIMIT_MAX: z.coerce.number().int().min(1).max(10_000).default(DEFAULT_MARKS_RATE_LIMIT_MAX),
    });
    static validate(input = process.env) {
        const result = this.schema.safeParse(input);
        if (result.success)
            return result.data;
        throw new Error(result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
    }
}
let cached;
/** Validated process.env, read once. Throws at boot when anything is missing or unsafe. */
export function loadEnv() {
    cached ??= EnvironmentConfig.validate();
    return cached;
}
//# sourceMappingURL=env.js.map