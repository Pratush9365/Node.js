import { can, PERMISSIONS } from "../../config/permissions.js";
import type { Permission } from "../../config/permissions.js";
import { AppError } from "../../errors/AppError.js";
import { AccessRepository } from "./access.repository.js";
import type {
    Actor,
    AveragesFilter,
    ClassSection,
    IAccessRepository,
    ScopedStudent,
    StudentAction,
    StudentResource,
    StudentScope,
} from "./access.interface.js";

type ScopeLevel = "any" | "class" | "own";

/** Which permission grants which scope level, per resource and action. A missing entry means "never". */
const SCOPE_PERMISSIONS: Record<StudentResource, Record<StudentAction, Partial<Record<ScopeLevel, Permission>>>> = {
    students: {
        read: { any: PERMISSIONS.STUDENTS_READ_ANY, class: PERMISSIONS.STUDENTS_READ_CLASS, own: PERMISSIONS.STUDENTS_READ_OWN },
        write: { any: PERMISSIONS.STUDENTS_WRITE_ANY },
    },
    marks: {
        read: { any: PERMISSIONS.MARKS_READ_ANY, class: PERMISSIONS.MARKS_READ_CLASS, own: PERMISSIONS.MARKS_READ_OWN },
        write: { any: PERMISSIONS.MARKS_WRITE_ANY, class: PERMISSIONS.MARKS_WRITE_CLASS },
    },
};

export const STUDENT_NOT_FOUND = "Student not found";

function isSameClass(a: ClassSection, b: ClassSection): boolean {
    return a.className === b.className && a.section === b.section;
}

/**
 * Ownership rules, in one place. Routes decide WHICH ROLE-LEVEL permission a caller needs
 * (requirePermission); this class decides WHICH RECORDS that permission reaches.
 * It checks permissions only, never role names, and loads scope data through a repository.
 */
export class AccessPolicy {
    public constructor(private readonly access: IAccessRepository = new AccessRepository()) {}

    /**
     * The one scope check every student / marks service calls.
     *  - `:any`   permission -> always true
     *  - `:class` permission -> the student's (className, section) is one the actor teaches
     *  - `:own`   permission -> the actor's login is linked to exactly this student
     */
    public async canAccessStudent(
        actor: Actor,
        student: ScopedStudent,
        action: StudentAction,
        resource: StudentResource = "students",
    ): Promise<boolean> {
        const granted = SCOPE_PERMISSIONS[resource][action];

        if (granted.any && can(actor, granted.any)) return true;

        if (granted.class && can(actor, granted.class)) {
            const classes = await this.access.findTeacherClasses(actor.id);
            if (classes.some((classSection) => isSameClass(classSection, student))) return true;
        }

        if (granted.own && can(actor, granted.own)) {
            const linkedStudentId = await this.access.findLinkedStudentId(actor.id);
            if (linkedStudentId !== null && linkedStudentId === student.id) return true;
        }

        return false;
    }

    /**
     * Single students outside the actor's scope are reported as 404, exactly like students that do not exist,
     * so an id probe cannot tell "not yours" from "not there".
     */
    public async requireStudentAccess(
        actor: Actor,
        student: ScopedStudent,
        action: StudentAction,
        resource: StudentResource = "students",
        notFoundMessage = STUDENT_NOT_FOUND,
    ): Promise<void> {
        if (!(await this.canAccessStudent(actor, student, action, resource))) throw AppError.notFound(notFoundMessage);
    }

    /** The list-endpoint counterpart of canAccessStudent: lists are FILTERED to this scope, never rejected. */
    public async scopeFor(actor: Actor, action: StudentAction, resource: StudentResource): Promise<StudentScope> {
        const granted = SCOPE_PERMISSIONS[resource][action];

        if (granted.any && can(actor, granted.any)) return { kind: "all" };

        if (granted.class && can(actor, granted.class)) {
            return { kind: "classes", classes: await this.access.findTeacherClasses(actor.id) };
        }

        if (granted.own && can(actor, granted.own)) {
            const studentId = await this.access.findLinkedStudentId(actor.id);
            return studentId === null ? { kind: "none" } : { kind: "self", studentId };
        }

        return { kind: "none" };
    }

    /**
     * Averages are not a record lookup, so an explicit request for a class the actor does not teach is a 403
     * (there is nothing to hide). Without a class in the request, a teacher gets averages over their own classes.
     */
    public async averagesFilter(actor: Actor, requested: { className?: string; section?: string }): Promise<AveragesFilter> {
        const asked = requested.className !== undefined || requested.section !== undefined;

        if (can(actor, PERMISSIONS.MARKS_AVERAGES_ANY)) {
            const filter: AveragesFilter = {};
            if (requested.className !== undefined) filter.className = requested.className;
            if (requested.section !== undefined) filter.section = requested.section;
            return filter;
        }

        if (can(actor, PERMISSIONS.MARKS_AVERAGES_CLASS)) {
            const taught = await this.access.findTeacherClasses(actor.id);
            const allowed = taught.filter((classSection) =>
                (requested.className === undefined || classSection.className === requested.className)
                && (requested.section === undefined || classSection.section === requested.section));
            if (asked && allowed.length === 0) throw AppError.forbidden("You do not teach the requested class");
            return { classes: allowed };
        }

        throw AppError.forbidden();
    }
}
