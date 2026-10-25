import { AppError } from "../../errors/AppError.js";
import type { CreateMarkInput, UpdateMarkInput } from "./mark.interface.js";

export class MarkDto {
    private static validate(body: unknown): CreateMarkInput {
        if (!body || typeof body !== "object") {
            throw AppError.badRequest("Request body must be a JSON object");
        }

        const { studentId, subject, marks } = body as Record<string, unknown>;
        if (typeof studentId !== "string" || !studentId.trim()) {
            throw AppError.badRequest("studentId is required");
        }
        if (typeof subject !== "string" || !subject.trim()) {
            throw AppError.badRequest("subject is required and must be a non-empty string");
        }
        if (typeof marks !== "number" || !Number.isFinite(marks) || marks < 0 || marks > 100) {
            throw AppError.badRequest("marks must be a number between 0 and 100");
        }

        return { studentId: studentId.trim(), subject: subject.trim(), marks };
    }

    public static create(body: unknown): CreateMarkInput {
        return MarkDto.validate(body);
    }

    public static update(body: unknown): UpdateMarkInput {
        return MarkDto.validate(body);
    }
}
