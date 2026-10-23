import { z } from "zod";
export class Validators {
    static personName = z.string().trim().normalize("NFC").min(1).max(100).regex(/^[\p{L} .'-]+$/u, "must be a valid name").refine((value) => !/[\u0000-\u001F<>]/.test(value), "name contains unsafe characters");
    static tag = z.string().trim().normalize("NFC").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase slug").refine((value) => !/[\u0000-\u001F<>]/.test(value), "tag contains unsafe characters");
    static idParam = z.coerce.number().int().positive();
    static pagination = z.object({ limit: z.coerce.number().int().min(1).max(100).default(20), offset: z.coerce.number().int().min(0).default(0) });
    static safeText(label) {
        return z.string().trim().normalize("NFC").refine((value) => !/[\u0000-\u001F<>]/.test(value), `${label} contains unsafe characters`);
    }
    static escapeLike(value) { return value.replace(/[\\%_]/g, "\\$&"); }
}
//# sourceMappingURL=validators.js.map