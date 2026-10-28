import "dotenv/config";
import { z } from "zod";
export declare const CORS_WILDCARD_MESSAGE: string;
export declare class EnvironmentConfig {
    static readonly schema: z.ZodObject<{
        DB_HOST: z.ZodString;
        DB_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        DB_NAME: z.ZodString;
        DB_USER: z.ZodString;
        DB_PASSWORD: z.ZodString;
        PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        PASS_PERCENTAGE: z.ZodCoercedNumber<unknown>;
        ACADEMIC_YEAR: z.ZodString;
        JWT_SECRET: z.ZodString;
        CORS_ORIGINS: z.ZodPipe<z.ZodDefault<z.ZodString>, z.ZodTransform<string[], string>>;
        MARKS_RATE_LIMIT_MAX: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    static validate(input?: NodeJS.ProcessEnv): z.infer<typeof EnvironmentConfig.schema>;
}
export type Env = z.infer<typeof EnvironmentConfig.schema>;
/** Validated process.env, read once. Throws at boot when anything is missing or unsafe. */
export declare function loadEnv(): Env;
//# sourceMappingURL=env.d.ts.map