import { z } from "zod";
export declare class Validators {
    static readonly personName: z.ZodString;
    static readonly tag: z.ZodString;
    static readonly idParam: z.ZodCoercedNumber<unknown>;
    static readonly pagination: z.ZodObject<{
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    /** School class: 1-12, no leading zero. Stored as VARCHAR(2). */
    static readonly className: z.ZodString;
    /** Section: a single upper-case letter. Stored as CHAR(1). */
    static readonly section: z.ZodString;
    static readonly uuid: z.ZodUUID;
    static readonly email: z.ZodPipe<z.ZodString, z.ZodEmail>;
    static safeText(label: string): z.ZodString;
    static escapeLike(value: string): string;
    /** Parses untrusted input and turns the first Zod issue into a 400 with the standard error shape. */
    static parse<S extends z.ZodType>(schema: S, input: unknown, label?: string): z.output<S>;
    /** Route / query params arrive as strings; ids are UUIDs, so reject anything else before it reaches Postgres. */
    static uuidParam(value: unknown, label: string): string;
}
//# sourceMappingURL=validators.d.ts.map