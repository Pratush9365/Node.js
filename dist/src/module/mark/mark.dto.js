import { AppError } from "../../errors/AppError.js";
export class MarkDto {
    static validate(body) {
        if (!body || typeof body !== "object") {
            throw AppError.badRequest("Request body must be a JSON object");
        }
        const { studentId, subject, marks } = body;
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
    static create(body) {
        return MarkDto.validate(body);
    }
    static update(body) {
        return MarkDto.validate(body);
    }
}
//# sourceMappingURL=mark.dto.js.map