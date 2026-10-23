import { z } from "zod";
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
    }, z.core.$strip>;
    static validate(input?: NodeJS.ProcessEnv): z.infer<typeof EnvironmentConfig.schema>;
}
export type Env = z.infer<typeof EnvironmentConfig.schema>;
export declare const env: {
    DB_HOST: string;
    DB_PORT: number;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    PORT: number;
    PASS_PERCENTAGE: number;
    ACADEMIC_YEAR: string;
};
//# sourceMappingURL=env.d.ts.map