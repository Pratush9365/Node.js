import { AppError } from "../../errors/AppError.js";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export class StudentDto {
    static validate(body) {
        if (!body || typeof body !== "object") {
            throw AppError.badRequest("Request body must be a JSON object");
        }
        const { name, email } = body;
        if (typeof name !== "string" || !name.trim()) {
            throw AppError.badRequest("name is required and must be a non-empty string");
        }
        if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
            throw AppError.badRequest("email is required and must be a valid email address");
        }
        return { name: name.trim(), email: email.trim().toLowerCase() };
    }
    static create(body) {
        return StudentDto.validate(body);
    }
    static update(body) {
        return StudentDto.validate(body);
    }
}
//# sourceMappingURL=student.dto.js.map