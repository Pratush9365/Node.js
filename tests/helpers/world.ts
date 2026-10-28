import jwt from "jsonwebtoken";
import request from "supertest";
import { vi } from "vitest";
import { createApp } from "../../src/app.js";
import type { AppConfig } from "../../src/app.js";
import { ROLES } from "../../src/config/permissions.js";
import type { AveragesFilter, ClassSection, IAccessRepository, StudentScope } from "../../src/module/access/access.interface.js";
import type { IMarkRepository, MarkFilters, SubjectAverage, UpdateMarkInput, CreateMarkInput } from "../../src/module/mark/mark.interface.js";
import type { Mark } from "../../src/module/mark/mark.entity.js";
import type { CreateStudentInput, IStudentRepository, UpdateStudentInput } from "../../src/module/student/student.interface.js";
import type { Student } from "../../src/module/student/student.entity.js";
import type { CreateUserInput, IUserRepository } from "../../src/module/user/interface/user.interface.js";
import type { User } from "../../src/module/user/user.entity.js";

export const TEST_JWT_SECRET = "test-secret-test-secret-test-secret-1234";

/** Ids are UUIDs in this codebase; these keep the numbers from the assignment readable (user 2, student_id 17...). */
export function uuid(n: number): string {
    return `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
}

export const USER = {
    admin: uuid(1),
    rao: uuid(2), // teacher: 10A and 10B
    iyer: uuid(3), // teacher: 9C
    priya: uuid(4), // student account -> student 17
    arjun: uuid(5), // student account -> student 23
    plain: uuid(6), // role "user"
    idleTeacher: uuid(7), // teacher with no classes
    unlinkedStudent: uuid(8), // student account with no student record yet
} as const;

export const STUDENT = {
    priya: uuid(17), // 10A
    rohan: uuid(31), // 10B
    arjun: uuid(23), // 9C
    meera: uuid(40), // 10C
} as const;

export const MARK = {
    priyaMaths: uuid(101),
    rohanMaths: uuid(102),
    arjunMaths: uuid(103),
    meeraScience: uuid(104),
} as const;

function uniqueViolation(): Error {
    return Object.assign(new Error("duplicate key value violates unique constraint"), { code: "23505" });
}

function inScope(scope: StudentScope, student: Student): boolean {
    switch (scope.kind) {
        case "all": return true;
        case "classes": return scope.classes.some((c) => c.className === student.className && c.section === student.section);
        case "self": return scope.studentId === student.id;
        case "none": return false;
    }
}

function matchesAverages(filter: AveragesFilter, student: Student): boolean {
    if (filter.className !== undefined && student.className !== filter.className) return false;
    if (filter.section !== undefined && student.section !== filter.section) return false;
    if (filter.classes !== undefined) return filter.classes.some((c) => c.className === student.className && c.section === student.section);
    return true;
}

export class FakeUserRepository implements IUserRepository {
    public constructor(public readonly rows: User[]) {}
    private nextId = 5000;

    public create = vi.fn(async (input: CreateUserInput): Promise<User> => {
        if (this.rows.some((row) => row.email === input.email)) throw uniqueViolation();
        const user: User = { id: uuid(this.nextId++), ...input, studentId: null, createdAt: new Date(0) };
        this.rows.push(user);
        return user;
    });

    public findById = vi.fn(async (id: string): Promise<User | null> => this.rows.find((row) => row.id === id) ?? null);

    public findByEmailWithPassword = vi.fn(async (email: string): Promise<User | null> => this.rows.find((row) => row.email === email) ?? null);

    public updateRole = vi.fn(async (id: string, role: string): Promise<User | null> => {
        const user = this.rows.find((row) => row.id === id);
        if (!user) return null;
        user.role = role;
        return user;
    });

    public linkStudent = vi.fn(async (userId: string, studentId: string): Promise<boolean> => {
        const user = this.rows.find((row) => row.id === userId);
        if (!user || user.studentId !== null) return false;
        if (this.rows.some((row) => row.studentId === studentId)) throw uniqueViolation();
        user.studentId = studentId;
        return true;
    });
}

export class FakeAccessRepository implements IAccessRepository {
    public constructor(public readonly links: Array<ClassSection & { teacherUserId: string }>, private readonly users: FakeUserRepository) {}

    public findTeacherClasses = vi.fn(async (teacherUserId: string): Promise<ClassSection[]> =>
        this.links.filter((link) => link.teacherUserId === teacherUserId).map(({ className, section }) => ({ className, section })));

    public findLinkedStudentId = vi.fn(async (userId: string): Promise<string | null> =>
        this.users.rows.find((row) => row.id === userId)?.studentId ?? null);

    public addTeacherClass = vi.fn(async (teacherUserId: string, classSection: ClassSection): Promise<void> => {
        if (this.links.some((l) => l.teacherUserId === teacherUserId && l.className === classSection.className && l.section === classSection.section)) {
            throw uniqueViolation();
        }
        this.links.push({ teacherUserId, ...classSection });
    });
}

export class FakeStudentRepository implements IStudentRepository {
    public constructor(public readonly rows: Student[]) {}
    private nextId = 7000;

    public create = vi.fn(async (input: CreateStudentInput): Promise<Student> => {
        if (this.rows.some((row) => row.email === input.email)) throw uniqueViolation();
        const student: Student = { id: uuid(this.nextId++), ...input };
        this.rows.push(student);
        return student;
    });

    public findAll = vi.fn(async (scope: StudentScope): Promise<Student[]> => this.rows.filter((row) => inScope(scope, row)));

    public findById = vi.fn(async (id: string): Promise<Student | null> => this.rows.find((row) => row.id === id) ?? null);

    public update = vi.fn(async (id: string, input: UpdateStudentInput): Promise<Student | null> => {
        const student = this.rows.find((row) => row.id === id);
        return student ? Object.assign(student, input) : null;
    });

    public delete = vi.fn(async (id: string): Promise<boolean> => {
        const index = this.rows.findIndex((row) => row.id === id);
        if (index === -1) return false;
        this.rows.splice(index, 1);
        return true;
    });
}

export class FakeMarkRepository implements IMarkRepository {
    public constructor(public readonly rows: Mark[], private readonly students: FakeStudentRepository) {}
    private nextId = 9000;

    private studentOf(mark: Mark): Student | undefined {
        return this.students.rows.find((row) => row.id === mark.studentId);
    }

    public create = vi.fn(async (input: CreateMarkInput): Promise<Mark> => {
        if (this.rows.some((row) => row.studentId === input.studentId && row.subject === input.subject)) throw uniqueViolation();
        const mark: Mark = { id: uuid(this.nextId++), ...input };
        this.rows.push(mark);
        return mark;
    });

    public findAll = vi.fn(async (filters: MarkFilters, scope: StudentScope): Promise<Mark[]> =>
        this.rows.filter((mark) => {
            const student = this.studentOf(mark);
            return student !== undefined
                && inScope(scope, student)
                && (!filters.studentId || mark.studentId === filters.studentId)
                && (!filters.subject || mark.subject === filters.subject);
        }));

    public findById = vi.fn(async (id: string): Promise<Mark | null> => this.rows.find((row) => row.id === id) ?? null);

    public update = vi.fn(async (id: string, input: UpdateMarkInput): Promise<Mark | null> => {
        const mark = this.rows.find((row) => row.id === id);
        return mark ? Object.assign(mark, input) : null;
    });

    public delete = vi.fn(async (id: string): Promise<boolean> => {
        const index = this.rows.findIndex((row) => row.id === id);
        if (index === -1) return false;
        this.rows.splice(index, 1);
        return true;
    });

    public findSubjectAverages = vi.fn(async (filter: AveragesFilter): Promise<SubjectAverage[]> => {
        const bySubject = new Map<string, number[]>();
        for (const mark of this.rows) {
            const student = this.studentOf(mark);
            if (!student || !matchesAverages(filter, student)) continue;
            bySubject.set(mark.subject, [...(bySubject.get(mark.subject) ?? []), mark.marks]);
        }
        return [...bySubject.entries()]
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([subject, values]) => ({
                subject,
                averageMarks: Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100,
                totalRecords: values.length,
            }));
    });
}

function seedUser(id: string, email: string, role: string, studentId: string | null = null): User {
    return { id, email, passwordHash: "not-a-real-hash", role, studentId, createdAt: new Date(0) };
}

function seedStudent(id: string, name: string, className: string, section: string): Student {
    return { id, name, email: `${name.toLowerCase()}@school.test`, className, section };
}

export interface WorldOptions {
    marksRateLimitMax?: number;
}

/**
 * A complete app wired to in-memory repositories, seeded with the assignment's scenario:
 * Ms Rao teaches 10A + 10B, Mr Iyer teaches 9C, Priya (student 17, 10A), Arjun (student 23, 9C).
 */
export function buildWorld(options: WorldOptions = {}) {
    const users = new FakeUserRepository([
        seedUser(USER.admin, "admin@school.test", ROLES.ADMIN),
        seedUser(USER.rao, "rao@school.test", ROLES.TEACHER),
        seedUser(USER.iyer, "iyer@school.test", ROLES.TEACHER),
        seedUser(USER.priya, "priya@school.test", ROLES.STUDENT, STUDENT.priya),
        seedUser(USER.arjun, "arjun@school.test", ROLES.STUDENT, STUDENT.arjun),
        seedUser(USER.plain, "plain@school.test", ROLES.USER),
        seedUser(USER.idleTeacher, "idle@school.test", ROLES.TEACHER),
        seedUser(USER.unlinkedStudent, "unlinked@school.test", ROLES.STUDENT),
    ]);
    const access = new FakeAccessRepository([
        { teacherUserId: USER.rao, className: "10", section: "A" },
        { teacherUserId: USER.rao, className: "10", section: "B" },
        { teacherUserId: USER.iyer, className: "9", section: "C" },
    ], users);
    const students = new FakeStudentRepository([
        seedStudent(STUDENT.priya, "Priya", "10", "A"),
        seedStudent(STUDENT.rohan, "Rohan", "10", "B"),
        seedStudent(STUDENT.arjun, "Arjun", "9", "C"),
        seedStudent(STUDENT.meera, "Meera", "10", "C"),
    ]);
    const marks = new FakeMarkRepository([
        { id: MARK.priyaMaths, studentId: STUDENT.priya, subject: "Maths", marks: 90 },
        { id: MARK.rohanMaths, studentId: STUDENT.rohan, subject: "Maths", marks: 70 },
        { id: MARK.arjunMaths, studentId: STUDENT.arjun, subject: "Maths", marks: 60 },
        { id: MARK.meeraScience, studentId: STUDENT.meera, subject: "Science", marks: 50 },
    ], students);

    const config: AppConfig = {
        JWT_SECRET: TEST_JWT_SECRET,
        CORS_ORIGINS: ["http://localhost:3000"],
        MARKS_RATE_LIMIT_MAX: options.marksRateLimitMax ?? 60,
    };
    const app = createApp({ users, students, marks, access }, config);

    /** `Authorization` header for a real, signed access token of this user (its role is read from the repository). */
    const as = (userId: string, secret = TEST_JWT_SECRET): string =>
        `Bearer ${jwt.sign({}, secret, { subject: userId, expiresIn: 15 * 60 })}`;

    return { app, config, users, access, students, marks, as, http: request(app) };
}

export type World = ReturnType<typeof buildWorld>;
