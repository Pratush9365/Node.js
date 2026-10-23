import { z } from "zod";
export declare class Validators {
    static readonly personName: z.ZodString;
    static readonly tag: z.ZodString;
    static readonly idParam: z.ZodCoercedNumber<unknown>;
    static readonly pagination: z.ZodObject<{
        limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
        offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    }, z.core.$strip>;
    static safeText(label: string): z.ZodString;
    static escapeLike(value: string): string;
}
//# sourceMappingURL=validators.d.ts.map