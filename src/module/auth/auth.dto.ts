import { z } from "zod";
import { Validators } from "../../utils/validators.js";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

/** z.object() drops unknown keys, so a client can never smuggle `role` or `studentId` into registration. */
const registerSchema = z.object({
    email: Validators.email,
    password: z.string().min(MIN_PASSWORD_LENGTH, `must be at least ${MIN_PASSWORD_LENGTH} characters`).max(MAX_PASSWORD_LENGTH),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().min(1).max(255),
    password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

export type Credentials = z.output<typeof loginSchema>;

export class AuthDto {
    public static register(body: unknown): z.output<typeof registerSchema> {
        return Validators.parse(registerSchema, body);
    }

    public static login(body: unknown): Credentials {
        return Validators.parse(loginSchema, body);
    }
}
