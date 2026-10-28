import type { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import { User } from "../user/user.entity.js";
import type { ClassSection, IAccessRepository } from "./access.interface.js";
import { TeacherClass } from "./teacher-class.entity.js";

/** Loads the data that defines an actor's scope: the classes a teacher teaches and the record a student account is linked to. */
export class AccessRepository implements IAccessRepository {
    public constructor(
        private readonly teacherClasses: Repository<TeacherClass> = AppDataSource.getRepository(TeacherClass),
        private readonly users: Repository<User> = AppDataSource.getRepository(User),
    ) {}

    public async findTeacherClasses(teacherUserId: string): Promise<ClassSection[]> {
        const rows = await this.teacherClasses.find({
            where: { teacherUserId },
            order: { className: "ASC", section: "ASC" },
        });
        return rows.map((row) => ({ className: row.className, section: row.section }));
    }

    public async findLinkedStudentId(userId: string): Promise<string | null> {
        const user = await this.users.findOneBy({ id: userId });
        return user?.studentId ?? null;
    }

    public async addTeacherClass(teacherUserId: string, classSection: ClassSection): Promise<void> {
        // insert(), not save(): save() would silently upsert and hide the duplicate.
        await this.teacherClasses.insert({ teacherUserId, ...classSection });
    }
}
