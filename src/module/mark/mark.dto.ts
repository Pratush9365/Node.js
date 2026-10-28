import { AppError } from "../../errors/AppError.js";
import { Validators } from "../../utils/validators.js";
import type { AveragesQuery, CreateMarkInput, UpdateMarkInput } from "./mark.interface.js";

export class MarkDto {
    private static asObject(body: unknown): Record<string, unknown> {
        if (!body || typeof body !== "object") {
            throw AppError.badRequest("Request body must be a JSON object");
        }
        return body as Record<string, unknown>;
    }

    private static subjectAndMarks(fields: Record<string, unknown>): { subject: string; marks: number } {
        const { subject, marks } = fields;
        if (typeof subject !== "string" || !subject.trim()) {
            throw AppError.badRequest("subject is required and must be a non-empty string");
        }
        if (typeof marks !== "number" || !Number.isFinite(marks) || marks < 0 || marks > 100) {
            throw AppError.badRequest("marks must be a number between 0 and 100");
        }
        return { subject: subject.trim(), marks };
    }

    private static validate(body: unknown): CreateMarkInput {
        const fields = MarkDto.asObject(body);
        const { studentId } = fields;
        if (typeof studentId !== "string" || !studentId.trim()) {
            throw AppError.badRequest("studentId is required");
        }
        return { studentId: Validators.uuidParam(studentId.trim(), "studentId"), ...MarkDto.subjectAndMarks(fields) };
    }

    public static create(body: unknown): CreateMarkInput {
        return MarkDto.validate(body);
    }

    /** For POST /api/students/:studentId/marks: the student id is taken from the URL and any body value is ignored. */
    public static createForStudent(studentId: string, body: unknown): CreateMarkInput {
        return { studentId, ...MarkDto.subjectAndMarks(MarkDto.asObject(body)) };
    }

    public static update(body: unknown): UpdateMarkInput {
        return MarkDto.validate(body);
    }

    public static averagesQuery(query: Record<string, unknown>): AveragesQuery {
        const result: AveragesQuery = {};
        if (typeof query.className === "string" && query.className !== "") {
            result.className = Validators.parse(Validators.className, query.className, "className");
        }
        if (typeof query.section === "string" && query.section !== "") {
            result.section = Validators.parse(Validators.section, query.section, "section");
        }
        return result;
    }
}
