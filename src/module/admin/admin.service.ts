import { canBeAssignedClasses, canBeLinkedToStudent } from "../../config/permissions.js";
import type { Role } from "../../config/permissions.js";
import { AppError } from "../../errors/AppError.js";
import { getDatabaseErrorCode, PgErrorCode } from "../../errors/databaseError.js";
import { AccessRepository } from "../access/access.repository.js";
import type { Actor, ClassSection, IAccessRepository } from "../access/access.interface.js";
import { toPublicUser } from "../auth/auth.service.js";
import type { IStudentRepository } from "../student/student.interface.js";
import { StudentRepository } from "../student/student.repository.js";
import type { IUserRepository, PublicUser } from "../user/interface/user.interface.js";
import { UserRepository } from "../user/user.repository.js";
import type { StudentLinkInput, TeacherClassInput } from "./admin.dto.js";

export interface TeacherClassLink extends ClassSection {
    teacherUserId: string;
}

export interface StudentLink {
    userId: string;
    studentId: string;
}

/** Account administration. Reachable only through routes guarded by the `admin:manage` permission. */
export class AdminService {
    public constructor(
        private readonly users: IUserRepository = new UserRepository(),
        private readonly students: IStudentRepository = new StudentRepository(),
        private readonly access: IAccessRepository = new AccessRepository(),
    ) {}

    private async requireUser(id: string) {
        const user = await this.users.findById(id);
        if (!user) throw AppError.notFound("User not found");
        return user;
    }

    public async addTeacherClass(input: TeacherClassInput): Promise<TeacherClassLink> {
        const teacher = await this.requireUser(input.teacherUserId);
        if (!canBeAssignedClasses(teacher.role)) throw AppError.badRequest("Only a teacher account can be assigned to a class");

        const classSection = { className: input.className, section: input.section };
        try {
            await this.access.addTeacherClass(teacher.id, classSection);
        } catch (error: unknown) {
            if (getDatabaseErrorCode(error) === PgErrorCode.UNIQUE_VIOLATION) {
                throw AppError.conflict("This teacher is already assigned to that class and section");
            }
            throw error;
        }
        return { teacherUserId: teacher.id, ...classSection };
    }

    public async linkStudent(input: StudentLinkInput): Promise<StudentLink> {
        const user = await this.requireUser(input.userId);
        const student = await this.students.findById(input.studentId);
        if (!student) throw AppError.notFound("Student not found");
        if (!canBeLinkedToStudent(user.role)) throw AppError.badRequest("Only a student account can be linked to a student record");
        if (user.studentId !== null && user.studentId !== undefined) throw AppError.conflict("This account is already linked to a student");

        try {
            if (!(await this.users.linkStudent(user.id, student.id))) {
                throw AppError.conflict("This account is already linked to a student");
            }
        } catch (error: unknown) {
            // Unique index on users.student_id: another login already owns this student record.
            if (getDatabaseErrorCode(error) === PgErrorCode.UNIQUE_VIOLATION) {
                throw AppError.conflict("This student is already linked to another account");
            }
            throw error;
        }
        return { userId: user.id, studentId: student.id };
    }

    public async changeRole(actor: Actor, userId: string, role: Role): Promise<PublicUser> {
        if (actor.id === userId) throw AppError.badRequest("You cannot change your own role");
        await this.requireUser(userId);
        const updated = await this.users.updateRole(userId, role);
        if (!updated) throw AppError.notFound("User not found");
        return toPublicUser(updated);
    }
}
