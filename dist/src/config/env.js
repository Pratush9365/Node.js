import { z } from "zod";
const academicYear = z.string().regex(/^\d{4}-\d{2}$/, "must use YYYY-YY format").refine((value) => Number(value.slice(5)) === (Number(value.slice(0, 4)) + 1) % 100, { message: "second year must follow the first" });
export class EnvironmentConfig {
    static schema = z.object({
        DB_HOST: z.string().min(1), DB_PORT: z.coerce.number().int().positive().default(5432),
        DB_NAME: z.string().min(1), DB_USER: z.string().min(1), DB_PASSWORD: z.string(),
        PORT: z.coerce.number().int().positive().default(3000),
        PASS_PERCENTAGE: z.coerce.number({ error: "PASS_PERCENTAGE is required but missing" }).min(0).max(100),
        ACADEMIC_YEAR: academicYear,
    });
    static validate(input = process.env) {
        const result = this.schema.safeParse(input);
        if (result.success)
            return result.data;
        throw new Error(result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
    }
}
export const env = EnvironmentConfig.validate();
//# sourceMappingURL=env.js.map