import type { User } from "../user.entity.js";

export interface IUserGetPayload {
    limit: number;
    page: number;
    search: string;
}

export interface CreateUserInput {
    email: string;
    passwordHash: string;
    role: string;
}

/** What may be sent to a client. Deliberately has no password or hash field. */
export interface PublicUser {
    id: string;
    email: string;
    role: string;
    studentId: string | null;
}

export interface IUserRepository {
    /** Throws a unique-violation (23505) when the email is already registered. */
    create(input: CreateUserInput): Promise<User>;
    findById(id: string): Promise<User | null>;
    /** The only lookup that returns `passwordHash`; used by login. */
    findByEmailWithPassword(email: string): Promise<User | null>;
    updateRole(id: string, role: string): Promise<User | null>;
    /**
     * Links a student account to its student record. Returns false when the user is missing
     * or already linked; throws a unique-violation (23505) when the student is linked to another login.
     */
    linkStudent(userId: string, studentId: string): Promise<boolean>;
}
