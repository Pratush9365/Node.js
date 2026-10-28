import { z } from "zod";
import { AppError } from "../errors/AppError.js";

export class Validators {
    public static readonly personName = z.string().trim().normalize("NFC").min(1).max(100).regex(/^[\p{L} .'-]+$/u, "must be a valid name").refine((value) => !/[\u0000-\u001F<>]/.test(value), "name contains unsafe characters");
    public static readonly tag = z.string().trim().normalize("NFC").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase slug").refine((value) => !/[\u0000-\u001F<>]/.test(value), "tag contains unsafe characters");
    public static readonly idParam = z.coerce.number().int().positive();
    public static readonly pagination = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20), offset: z.coerce.number().int().min(0).default(0) });

    /** School class: 1-12, no leading zero. Stored as VARCHAR(2). */
    public static readonly className = z.string().trim().regex(/^(?:[1-9]|1[0-2])$/, "must be a class between 1 and 12");
    /** Section: a single upper-case letter. Stored as CHAR(1). */
    public static readonly section = z.string().trim().regex(/^[A-Z]$/, "must be a single upper-case letter A-Z");
    public static readonly uuid = z.uuid();
    public static readonly email = z.string().trim().toLowerCase().max(255).pipe(z.email());

    public static safeText(label: string) {
        return z.string().trim().normalize("NFC").refine((value) => !/[\u0000-\u001F<>]/.test(value), `${label} contains unsafe characters`);
    }

    public static escapeLike(value: string): string { return value.replace(/[\\%_]/g, "\\$&"); }

    /** Parses untrusted input and turns the first Zod issue into a 400 with the standard error shape. */
    public static parse<S extends z.ZodType>(schema: S, input: unknown, label?: string): z.output<S> {
        const result = schema.safeParse(input);
        if (result.success) return result.data;
        const issue = result.error.issues[0];
        const path = label ?? issue?.path.join(".");
        throw AppError.badRequest(path ? `${path}: ${issue?.message ?? "invalid value"}` : (issue?.message ?? "Invalid request"));
    }

    /** Route / query params arrive as strings; ids are UUIDs, so reject anything else before it reaches Postgres. */
    public static uuidParam(value: unknown, label: string): string {
        const result = Validators.uuid.safeParse(value);
        if (!result.success) throw AppError.badRequest(`${label} must be a valid UUID`);
        return result.data;
    }
}
