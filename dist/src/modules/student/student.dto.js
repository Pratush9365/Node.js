import { z } from "zod";
import { Validators } from "../../utils/validators.js";
const dob = Validators.safeText("dateOfBirth").refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)) && /^\d{4}-\d{2}-\d{2}$/.test(value), "must be a real YYYY-MM-DD date");
const guardian = z.strictObject({ name: Validators.personName, phone: Validators.safeText("guardian.phone").transform((value) => value.replace(/[ -]/g, "")).refine((value) => /^\+[1-9]\d{7,14}$/.test(value), "must be E.164"), relation: z.enum(["father", "mother", "guardian"]).or(z.string()).transform((v, ctx) => { const value = v.toLowerCase(); if (!["father", "mother", "guardian"].includes(value)) {
        ctx.addIssue({ code: "custom", message: "invalid relation" });
        return z.NEVER;
    } return value; }) });
const className = z.union([z.string(), z.number().int()]).transform(String).pipe(z.enum(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]));
export class StudentDto {
    static createSchema = z.strictObject({ rollNo: Validators.safeText("rollNo").transform((v) => v.toUpperCase()).refine((value) => /^\d{4}-\d{1,2}[A-F]-\d{3}$/.test(value), "invalid roll number"), firstName: Validators.personName, lastName: Validators.personName, dateOfBirth: dob, className, section: Validators.safeText("section").transform((v) => v.toUpperCase()).refine((value) => /^[A-F]$/.test(value), "invalid section"), guardian });
    static updateSchema = this.createSchema.partial().strict().refine((v) => Object.keys(v).length > 0, "at least one field is required");
    static toResponse(student) { return { ...student, dateOfBirth: student.dateOfBirth.toISOString().slice(0, 10), createdAt: student.createdAt.toISOString(), updatedAt: student.updatedAt.toISOString() }; }
}
//# sourceMappingURL=student.dto.js.map