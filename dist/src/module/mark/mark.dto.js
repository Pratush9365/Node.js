import { AppError } from "../../errors/AppError.js";
import { Validators } from "../../utils/validators.js";
export class MarkDto {
    static asObject(body) {
        if (!body || typeof body !== "object") {
            throw AppError.badRequest("Request body must be a JSON object");
        }
        return body;
    }
    static subjectAndMarks(fields) {
        const { subject, marks } = fields;
        if (typeof subject !== "string" || !subject.trim()) {
            throw AppError.badRequest("subject is required and must be a non-empty string");
        }
        if (typeof marks !== "number" || !Number.isFinite(marks) || marks < 0 || marks > 100) {
            throw AppError.badRequest("marks must be a number between 0 and 100");
        }
        return { subject: subject.trim(), marks };
    }
    static validate(body) {
        const fields = MarkDto.asObject(body);
        const { studentId } = fields;
        if (typeof studentId !== "string" || !studentId.trim()) {
            throw AppError.badRequest("studentId is required");
        }
        return { studentId: Validators.uuidParam(studentId.trim(), "studentId"), ...MarkDto.subjectAndMarks(fields) };
    }
    static create(body) {
        return MarkDto.validate(body);
    }
    /** For POST /api/students/:studentId/marks: the student id is taken from the URL and any body value is ignored. */
    static createForStudent(studentId, body) {
        return { studentId, ...MarkDto.subjectAndMarks(MarkDto.asObject(body)) };
    }
    static update(body) {
        return MarkDto.validate(body);
    }
    static averagesQuery(query) {
        const result = {};
        if (typeof query.className === "string" && query.className !== "") {
            result.className = Validators.parse(Validators.className, query.className, "className");
        }
        if (typeof query.section === "string" && query.section !== "") {
            result.section = Validators.parse(Validators.section, query.section, "section");
        }
        return result;
    }
}
//# sourceMappingURL=mark.dto.js.map