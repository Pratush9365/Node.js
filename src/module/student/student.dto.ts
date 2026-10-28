import { AppError } from "../../errors/AppError.js";
import { Validators } from "../../utils/validators.js";
import type { CreateStudentInput, UpdateStudentInput } from "./student.interface.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class StudentDto {
    private static validate(body: unknown): CreateStudentInput {
        if (!body || typeof body !== "object") {
            throw AppError.badRequest("Request body must be a JSON object");
        }

        const { name, email, className, section } = body as Record<string, unknown>;
        if (typeof name !== "string" || !name.trim()) {
            throw AppError.badRequest("name is required and must be a non-empty string");
        }
        if (typeof email !== "string" || !EMAIL_PATTERN.test(email.trim())) {
            throw AppError.badRequest("email is required and must be a valid email address");
        }

        return {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            className: Validators.parse(Validators.className, className, "className"),
            section: Validators.parse(Validators.section, section, "section"),
        };
    }

    public static create(body: unknown): CreateStudentInput {
        return StudentDto.validate(body);
    }

    public static update(body: unknown): UpdateStudentInput {
        return StudentDto.validate(body);
    }
}
