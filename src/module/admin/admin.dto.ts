import { z } from "zod";
import { ROLE_VALUES } from "../../config/permissions.js";
import type { Role } from "../../config/permissions.js";
import { Validators } from "../../utils/validators.js";

const teacherClassSchema = z.object({
    teacherUserId: Validators.uuid,
    className: Validators.className,
    section: Validators.section,
});

const studentLinkSchema = z.object({
    userId: Validators.uuid,
    studentId: Validators.uuid,
});

const roleChangeSchema = z.object({
    role: z.enum(ROLE_VALUES as readonly [Role, ...Role[]]),
});

export type TeacherClassInput = z.output<typeof teacherClassSchema>;
export type StudentLinkInput = z.output<typeof studentLinkSchema>;

export class AdminDto {
    public static teacherClass(body: unknown): TeacherClassInput {
        return Validators.parse(teacherClassSchema, body);
    }

    public static studentLink(body: unknown): StudentLinkInput {
        return Validators.parse(studentLinkSchema, body);
    }

    public static roleChange(body: unknown): Role {
        return Validators.parse(roleChangeSchema, body).role;
    }
}
