/** The authenticated caller, as rebuilt from the database on every request. */
export interface Actor {
    id: string;
    role: string;
}

export interface ClassSection {
    className: string;
    section: string;
}

/** The only fields the scope helper needs to know about a student. */
export interface ScopedStudent {
    id: string;
    className: string;
    section: string;
}

export type StudentResource = "students" | "marks";
export type StudentAction = "read" | "write";

/** Which students an actor may see; repositories turn it into a WHERE clause. */
export type StudentScope =
    | { kind: "all" }
    | { kind: "classes"; classes: ClassSection[] }
    | { kind: "self"; studentId: string }
    | { kind: "none" };

/** Optional filters for the averages endpoint, narrowed to what the actor may see. */
export interface AveragesFilter {
    className?: string;
    section?: string;
    classes?: ClassSection[];
}

export interface IAccessRepository {
    findTeacherClasses(teacherUserId: string): Promise<ClassSection[]>;
    findLinkedStudentId(userId: string): Promise<string | null>;
    /** Throws a unique-violation (23505) when the teacher already has this class. */
    addTeacherClass(teacherUserId: string, classSection: ClassSection): Promise<void>;
}
