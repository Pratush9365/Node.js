/**
 * Single source of truth for who may do what.
 *
 * House rule: application code asks "does this actor have permission X?" via
 * hasPermission() / can(). It never compares role names. The only role names that
 * may appear in a comparison live in this file.
 */
export const ROLES = {
    ADMIN: "admin",
    TEACHER: "teacher",
    STUDENT: "student",
    /** Plain self-registered account: authenticated, but can see no school data. */
    USER: "user",
    MODERATOR: "moderator",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES = Object.values(ROLES) as readonly Role[];

export const PERMISSIONS = {
    STUDENTS_READ_OWN: "students:read:own",
    STUDENTS_READ_CLASS: "students:read:class",
    STUDENTS_READ_ANY: "students:read:any",
    STUDENTS_WRITE_ANY: "students:write:any",
    MARKS_READ_OWN: "marks:read:own",
    MARKS_READ_CLASS: "marks:read:class",
    MARKS_READ_ANY: "marks:read:any",
    MARKS_WRITE_CLASS: "marks:write:class",
    MARKS_WRITE_ANY: "marks:write:any",
    MARKS_AVERAGES_CLASS: "marks:averages:class",
    MARKS_AVERAGES_ANY: "marks:averages:any",
    /** Account administration: roles, teacher-class links, student-account links. */
    ADMIN_MANAGE: "admin:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ROLE_PERMISSIONS: Readonly<Record<Role, readonly Permission[]>> = {
    [ROLES.ADMIN]: Object.values(PERMISSIONS),
    [ROLES.TEACHER]: [
        PERMISSIONS.STUDENTS_READ_CLASS,
        PERMISSIONS.MARKS_READ_CLASS,
        PERMISSIONS.MARKS_WRITE_CLASS,
        PERMISSIONS.MARKS_AVERAGES_CLASS,
    ],
    [ROLES.STUDENT]: [PERMISSIONS.STUDENTS_READ_OWN, PERMISSIONS.MARKS_READ_OWN],
    [ROLES.USER]: [],
    [ROLES.MODERATOR]: [],
};

export interface PermissionActor {
    readonly role: string;
}

export function isRole(value: unknown): value is Role {
    return typeof value === "string" && (ROLE_VALUES as readonly string[]).includes(value);
}

/** Unknown / tampered role values get no permissions at all. */
export function hasPermission(role: string, permission: Permission): boolean {
    return isRole(role) && ROLE_PERMISSIONS[role].includes(permission);
}

export function can(actor: PermissionActor, permission: Permission): boolean {
    return hasPermission(actor.role, permission);
}

export function canAny(actor: PermissionActor, permissions: readonly Permission[]): boolean {
    return permissions.some((permission) => can(actor, permission));
}

/** Account-linking rules: kept here so no other file needs to know a role's name. */
export function canBeAssignedClasses(role: string): boolean {
    return role === ROLES.TEACHER;
}

export function canBeLinkedToStudent(role: string): boolean {
    return role === ROLES.STUDENT;
}
