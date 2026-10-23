import { z } from "zod";

export class Validators {
    public static readonly personName = z.string().trim().normalize("NFC").min(1).max(100).regex(/^[\p{L} .'-]+$/u, "must be a valid name").refine((value) => !/[\u0000-\u001F<>]/.test(value), "name contains unsafe characters");
    public static readonly tag = z.string().trim().normalize("NFC").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase slug").refine((value) => !/[\u0000-\u001F<>]/.test(value), "tag contains unsafe characters");
    public static readonly idParam = z.coerce.number().int().positive();
    public static readonly pagination = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20), offset: z.coerce.number().int().min(0).default(0) });

    public static safeText(label: string) {
        return z.string().trim().normalize("NFC").refine((value) => !/[\u0000-\u001F<>]/.test(value), `${label} contains unsafe characters`);
    }

    public static escapeLike(value: string): string { return value.replace(/[\\%_]/g, "\\$&"); }
}
