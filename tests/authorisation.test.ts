import { beforeEach, describe, expect, it } from "vitest";
import { hasPermission, PERMISSIONS, ROLES } from "../src/config/permissions.js";
import type { Permission } from "../src/config/permissions.js";
import { AccessPolicy } from "../src/module/access/access.policy.js";
import { buildWorld, MARK, STUDENT, USER, uuid } from "./helpers/world.js";
import type { World } from "./helpers/world.js";

let world: World;
beforeEach(() => {
    world = buildWorld();
});

describe("B1 permission map", () => {
    // Rows copied from the assignment table: [permission, admin, teacher, student]
    const table: Array<[Permission, boolean, boolean, boolean]> = [
        [PERMISSIONS.STUDENTS_READ_OWN, true, false, true],
        [PERMISSIONS.STUDENTS_READ_CLASS, true, true, false],
        [PERMISSIONS.STUDENTS_READ_ANY, true, false, false],
        [PERMISSIONS.STUDENTS_WRITE_ANY, true, false, false],
        [PERMISSIONS.MARKS_READ_OWN, true, false, true],
        [PERMISSIONS.MARKS_READ_CLASS, true, true, false],
        [PERMISSIONS.MARKS_READ_ANY, true, false, false],
        [PERMISSIONS.MARKS_WRITE_CLASS, true, true, false],
        [PERMISSIONS.MARKS_WRITE_ANY, true, false, false],
        [PERMISSIONS.MARKS_AVERAGES_CLASS, true, true, false],
        [PERMISSIONS.MARKS_AVERAGES_ANY, true, false, false],
    ];

    it.each(table)("%s -> admin:%s teacher:%s student:%s", (permission, admin, teacher, student) => {
        expect(hasPermission(ROLES.ADMIN, permission)).toBe(admin);
        expect(hasPermission(ROLES.TEACHER, permission)).toBe(teacher);
        expect(hasPermission(ROLES.STUDENT, permission)).toBe(student);
    });

    it("'user', 'moderator' and unknown roles hold none of them", () => {
        for (const role of [ROLES.USER, ROLES.MODERATOR, "root", ""]) {
            for (const [permission] of table) expect(hasPermission(role, permission)).toBe(false);
        }
    });

    it("only admin may manage accounts", () => {
        expect(hasPermission(ROLES.ADMIN, PERMISSIONS.ADMIN_MANAGE)).toBe(true);
        expect(hasPermission(ROLES.TEACHER, PERMISSIONS.ADMIN_MANAGE)).toBe(false);
        expect(hasPermission(ROLES.STUDENT, PERMISSIONS.ADMIN_MANAGE)).toBe(false);
    });
});

describe("B2 canAccessStudent", () => {
    const actors = {
        admin: { id: USER.admin, role: "admin" },
        rao: { id: USER.rao, role: "teacher" },
        iyer: { id: USER.iyer, role: "teacher" },
        priya: { id: USER.priya, role: "student" },
        arjun: { id: USER.arjun, role: "student" },
        plain: { id: USER.plain, role: "user" },
        idleTeacher: { id: USER.idleTeacher, role: "teacher" },
        unlinked: { id: USER.unlinkedStudent, role: "student" },
    };
    const students = {
        priya: { id: STUDENT.priya, className: "10", section: "A" },
        rohan: { id: STUDENT.rohan, className: "10", section: "B" },
        arjun: { id: STUDENT.arjun, className: "9", section: "C" },
        meera: { id: STUDENT.meera, className: "10", section: "C" },
    };

    // [actor, student, students read, students write, marks read, marks write]
    const cases: Array<[keyof typeof actors, keyof typeof students, boolean, boolean, boolean, boolean]> = [
        ["admin", "priya", true, true, true, true],
        ["admin", "arjun", true, true, true, true],
        ["rao", "priya", true, false, true, true],
        ["rao", "rohan", true, false, true, true],
        ["rao", "arjun", false, false, false, false],
        ["rao", "meera", false, false, false, false], // same class, different section
        ["iyer", "arjun", true, false, true, true],
        ["iyer", "priya", false, false, false, false],
        ["priya", "priya", true, false, true, false],
        ["priya", "arjun", false, false, false, false],
        ["arjun", "arjun", true, false, true, false],
        ["arjun", "priya", false, false, false, false],
        ["plain", "priya", false, false, false, false],
        ["idleTeacher", "priya", false, false, false, false],
        ["unlinked", "priya", false, false, false, false],
    ];

    it.each(cases)("%s on %s", async (actor, student, studentsRead, studentsWrite, marksRead, marksWrite) => {
        const policy = new AccessPolicy(world.access);

        expect(await policy.canAccessStudent(actors[actor], students[student], "read", "students")).toBe(studentsRead);
        expect(await policy.canAccessStudent(actors[actor], students[student], "write", "students")).toBe(studentsWrite);
        expect(await policy.canAccessStudent(actors[actor], students[student], "read", "marks")).toBe(marksRead);
        expect(await policy.canAccessStudent(actors[actor], students[student], "write", "marks")).toBe(marksWrite);
    });

    it("defaults to the students resource", async () => {
        const policy = new AccessPolicy(world.access);
        expect(await policy.canAccessStudent(actors.rao, students.priya, "read")).toBe(true);
        expect(await policy.canAccessStudent(actors.rao, students.priya, "write")).toBe(false);
    });

    it("admin never needs a scope lookup", async () => {
        await new AccessPolicy(world.access).canAccessStudent(actors.admin, students.arjun, "write", "marks");
        expect(world.access.findTeacherClasses).not.toHaveBeenCalled();
        expect(world.access.findLinkedStudentId).not.toHaveBeenCalled();
    });
});

interface Row {
    label: string;
    method: "get" | "post" | "patch" | "delete";
    path: string;
    body?: object;
    admin: number;
    teacher: number;
    student: number;
}

/** The table from B3. Teacher = Ms Rao acting on her own class (Priya, 10A). Student = Priya acting on herself. */
const matrix: Row[] = [
    { label: "GET    /api/students", method: "get", path: "/api/students", admin: 200, teacher: 200, student: 200 },
    { label: "GET    /api/students/:id", method: "get", path: `/api/students/${STUDENT.priya}`, admin: 200, teacher: 200, student: 200 },
    {
        label: "POST   /api/students",
        method: "post",
        path: "/api/students",
        body: { name: "New Kid", email: "kid@school.test", className: "10", section: "A" },
        admin: 201, teacher: 403, student: 403,
    },
    {
        label: "PATCH  /api/students/:id",
        method: "patch",
        path: `/api/students/${STUDENT.priya}`,
        body: { name: "Priya S", email: "priya@school.test", className: "10", section: "A" },
        admin: 200, teacher: 403, student: 403,
    },
    { label: "DELETE /api/students/:id", method: "delete", path: `/api/students/${STUDENT.priya}`, admin: 204, teacher: 403, student: 403 },
    {
        label: "POST   /api/students/:id/marks",
        method: "post",
        path: `/api/students/${STUDENT.priya}/marks`,
        body: { subject: "Science", marks: 80 },
        admin: 201, teacher: 201, student: 403,
    },
    {
        label: "PATCH  /api/marks/:id",
        method: "patch",
        path: `/api/marks/${MARK.priyaMaths}`,
        body: { studentId: STUDENT.priya, subject: "Maths", marks: 95 },
        admin: 200, teacher: 200, student: 403,
    },
    { label: "GET    /api/marks/averages", method: "get", path: "/api/marks/averages?className=10", admin: 200, teacher: 200, student: 403 },
    // Extra rows for the endpoints that already existed in this codebase.
    { label: "GET    /api/marks", method: "get", path: "/api/marks", admin: 200, teacher: 200, student: 200 },
    { label: "GET    /api/marks/:id", method: "get", path: `/api/marks/${MARK.priyaMaths}`, admin: 200, teacher: 200, student: 200 },
    { label: "DELETE /api/marks/:id", method: "delete", path: `/api/marks/${MARK.priyaMaths}`, admin: 204, teacher: 204, student: 403 },
    {
        label: "POST   /api/marks",
        method: "post",
        path: "/api/marks",
        body: { studentId: STUDENT.priya, subject: "Science", marks: 70 },
        admin: 201, teacher: 201, student: 403,
    },
];

describe("B3/B4 role x endpoint matrix", () => {
    const cases = matrix.flatMap((row) => [
        { ...row, actor: "admin", userId: USER.admin, expected: row.admin },
        { ...row, actor: "teacher (own class)", userId: USER.rao, expected: row.teacher },
        { ...row, actor: "student (self)", userId: USER.priya, expected: row.student },
    ]);

    it.each(cases)("$actor: $label -> $expected", async ({ method, path, body, userId, expected }) => {
        const req = world.http[method](path).set("Authorization", world.as(userId));
        const res = await (body ? req.send(body) : req);

        expect(res.status).toBe(expected);
    });

    it("every matrix row is rejected with 401 when anonymous", async () => {
        for (const { method, path, body } of matrix) {
            const req = world.http[method](path);
            expect((await (body ? req.send(body) : req)).status).toBe(401);
        }
    });
});

describe("B3/B4 outside-scope access is blocked with ONE status (404) and never writes", () => {
    const foreignStudent = `/api/students/${STUDENT.arjun}`;

    it("IDOR: Ms Rao cannot read student 23 (class 9C)", async () => {
        const res = await world.http.get(foreignStudent).set("Authorization", world.as(USER.rao));

        expect(res.status).toBe(404);
        expect(JSON.stringify(res.body)).not.toContain("arjun");
    });

    it("IDOR: Ms Rao cannot post marks for student 23, and the repository write is never called", async () => {
        const res = await world.http
            .post(`${foreignStudent}/marks`)
            .set("Authorization", world.as(USER.rao))
            .send({ subject: "Physics", marks: 100 });

        expect(res.status).toBe(404);
        expect(world.marks.create).not.toHaveBeenCalled();
        expect(world.marks.rows.filter((m) => m.studentId === STUDENT.arjun)).toHaveLength(1);
    });

    it("IDOR: Ms Rao cannot post marks for student 23 through POST /api/marks either", async () => {
        const res = await world.http
            .post("/api/marks")
            .set("Authorization", world.as(USER.rao))
            .send({ studentId: STUDENT.arjun, subject: "Physics", marks: 100 });

        expect(res.status).toBe(404);
        expect(world.marks.create).not.toHaveBeenCalled();
    });

    it("IDOR: Ms Rao cannot read, edit or delete Arjun's mark by id", async () => {
        const auth = world.as(USER.rao);
        const url = `/api/marks/${MARK.arjunMaths}`;

        expect((await world.http.get(url).set("Authorization", auth)).status).toBe(404);
        expect((await world.http.patch(url).set("Authorization", auth).send({ studentId: STUDENT.arjun, subject: "Maths", marks: 100 })).status).toBe(404);
        expect((await world.http.delete(url).set("Authorization", auth)).status).toBe(404);
        expect(world.marks.update).not.toHaveBeenCalled();
        expect(world.marks.delete).not.toHaveBeenCalled();
        expect(world.marks.rows.find((m) => m.id === MARK.arjunMaths)?.marks).toBe(60);
    });

    it("IDOR: Ms Rao cannot move her own mark onto Arjun", async () => {
        const res = await world.http
            .patch(`/api/marks/${MARK.priyaMaths}`)
            .set("Authorization", world.as(USER.rao))
            .send({ studentId: STUDENT.arjun, subject: "Maths", marks: 90 });

        expect(res.status).toBe(404);
        expect(world.marks.update).not.toHaveBeenCalled();
        expect(world.marks.rows.find((m) => m.id === MARK.priyaMaths)?.studentId).toBe(STUDENT.priya);
    });

    it("IDOR: the student id in the body of POST /:id/marks is ignored; the URL decides", async () => {
        const res = await world.http
            .post(`/api/students/${STUDENT.priya}/marks`)
            .set("Authorization", world.as(USER.rao))
            .send({ studentId: STUDENT.arjun, subject: "Art", marks: 77 });

        expect(res.status).toBe(201);
        expect(res.body.studentId).toBe(STUDENT.priya);
        expect(world.marks.rows.some((m) => m.studentId === STUDENT.arjun && m.subject === "Art")).toBe(false);
    });

    it("IDOR: Priya cannot read Arjun's profile or mark", async () => {
        const auth = world.as(USER.priya);

        expect((await world.http.get(foreignStudent).set("Authorization", auth)).status).toBe(404);
        expect((await world.http.get(`/api/marks/${MARK.arjunMaths}`).set("Authorization", auth)).status).toBe(404);
    });

    it("students and teachers cannot write students at all (403 before any lookup)", async () => {
        for (const user of [USER.rao, USER.priya]) {
            const res = await world.http
                .put(`/api/students/${STUDENT.priya}`)
                .set("Authorization", world.as(user))
                .send({ name: "Hacked", email: "hacked@school.test", className: "10", section: "A" });
            expect(res.status).toBe(403);
        }
        expect(world.students.update).not.toHaveBeenCalled();
        expect(world.students.delete).not.toHaveBeenCalled();
    });

    it("a student cannot write marks for themselves", async () => {
        const res = await world.http
            .post(`/api/students/${STUDENT.priya}/marks`)
            .set("Authorization", world.as(USER.priya))
            .send({ subject: "Maths", marks: 100 });

        expect(res.status).toBe(403);
        expect(world.marks.create).not.toHaveBeenCalled();
    });

    it("'not yours' is indistinguishable from 'does not exist'", async () => {
        const auth = world.as(USER.rao);
        const foreign = await world.http.get(foreignStudent).set("Authorization", auth);
        const missing = await world.http.get(`/api/students/${uuid(999)}`).set("Authorization", auth);

        expect(foreign.status).toBe(missing.status);
        expect(foreign.body).toEqual(missing.body);
    });

    it("a malformed id is a 400, not a database error", async () => {
        const res = await world.http.get("/api/students/17").set("Authorization", world.as(USER.admin));
        expect(res.status).toBe(400);
    });
});

describe("B3/B4 list endpoints FILTER instead of rejecting", () => {
    const names = (rows: Array<{ name: string }>) => rows.map((row) => row.name).sort();

    it("Priya listing students gets exactly one row: herself", async () => {
        const res = await world.http.get("/api/students").set("Authorization", world.as(USER.priya));

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0]).toMatchObject({ id: STUDENT.priya, name: "Priya" });
    });

    it("each teacher sees only their own classes", async () => {
        const rao = await world.http.get("/api/students").set("Authorization", world.as(USER.rao));
        const iyer = await world.http.get("/api/students").set("Authorization", world.as(USER.iyer));

        expect(names(rao.body)).toEqual(["Priya", "Rohan"]);
        expect(names(iyer.body)).toEqual(["Arjun"]);
    });

    it("admin sees everyone", async () => {
        const res = await world.http.get("/api/students").set("Authorization", world.as(USER.admin));
        expect(names(res.body)).toEqual(["Arjun", "Meera", "Priya", "Rohan"]);
    });

    it("a teacher with no classes and a student with no student record see empty lists, not errors", async () => {
        const idle = await world.http.get("/api/students").set("Authorization", world.as(USER.idleTeacher));
        const unlinked = await world.http.get("/api/students").set("Authorization", world.as(USER.unlinkedStudent));

        expect(idle.status).toBe(200);
        expect(idle.body).toEqual([]);
        expect(unlinked.status).toBe(200);
        expect(unlinked.body).toEqual([]);
    });

    it("marks lists are filtered the same way", async () => {
        const ids = async (userId: string, query = "") =>
            ((await world.http.get(`/api/marks${query}`).set("Authorization", world.as(userId))).body as Array<{ id: string }>).map((m) => m.id).sort();

        expect(await ids(USER.priya)).toEqual([MARK.priyaMaths]);
        expect(await ids(USER.rao)).toEqual([MARK.priyaMaths, MARK.rohanMaths].sort());
        expect(await ids(USER.admin)).toHaveLength(4);
    });

    it("asking for someone else's marks by ?studentId= returns an empty list, never their data", async () => {
        const res = await world.http.get(`/api/marks?studentId=${STUDENT.arjun}`).set("Authorization", world.as(USER.rao));

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });
});

describe("B3 averages", () => {
    const averages = (userId: string, query: string) =>
        world.http.get(`/api/marks/averages${query}`).set("Authorization", world.as(userId));

    it("className=9 for a teacher who only teaches 10A/10B -> 403", async () => {
        const res = await averages(USER.rao, "?className=9");

        expect(res.status).toBe(403);
        expect(world.marks.findSubjectAverages).not.toHaveBeenCalled();
    });

    it("a section the teacher does not teach -> 403", async () => {
        expect((await averages(USER.rao, "?className=10&section=C")).status).toBe(403);
        expect((await averages(USER.rao, "?section=C")).status).toBe(403);
    });

    it("without a class, a teacher gets averages over their own classes only", async () => {
        const res = await averages(USER.rao, "");

        expect(res.status).toBe(200);
        // Priya 90 + Rohan 70 -> 80. Arjun (60) and Meera (Science) are not Ms Rao's students.
        expect(res.body.data).toEqual([{ subject: "Maths", averageMarks: 80, totalRecords: 2 }]);
    });

    it("a teacher may narrow to one of their classes", async () => {
        const res = await averages(USER.rao, "?className=10&section=B");
        expect(res.body.data).toEqual([{ subject: "Maths", averageMarks: 70, totalRecords: 1 }]);
    });

    it("Mr Iyer may ask for class 9; admin may ask for anything", async () => {
        expect((await averages(USER.iyer, "?className=9")).body.data).toEqual([{ subject: "Maths", averageMarks: 60, totalRecords: 1 }]);
        expect((await averages(USER.admin, "?className=9")).body.data).toEqual([{ subject: "Maths", averageMarks: 60, totalRecords: 1 }]);
        expect((await averages(USER.admin, "")).body.data).toHaveLength(2);
    });

    it("the original /averages/subjects path keeps working, with the same rules", async () => {
        const ok = await world.http.get("/api/marks/averages/subjects").set("Authorization", world.as(USER.admin));
        const denied = await world.http.get("/api/marks/averages/subjects").set("Authorization", world.as(USER.priya));

        expect(ok.status).toBe(200);
        expect(denied.status).toBe(403);
    });

    it("invalid filters are a 400", async () => {
        expect((await averages(USER.admin, "?className=abc")).status).toBe(400);
        expect((await averages(USER.admin, "?section=z9")).status).toBe(400);
    });
});

describe("student CRUD still works for admin", () => {
    it("requires className and section", async () => {
        const res = await world.http
            .post("/api/students")
            .set("Authorization", world.as(USER.admin))
            .send({ name: "No Class", email: "noclass@school.test" });

        expect(res.status).toBe(400);
        expect(world.students.create).not.toHaveBeenCalled();
    });

    it("duplicate email -> 409", async () => {
        const res = await world.http
            .post("/api/students")
            .set("Authorization", world.as(USER.admin))
            .send({ name: "Dup", email: "priya@school.test", className: "10", section: "A" });

        expect(res.status).toBe(409);
    });

    it("duplicate subject mark -> 409", async () => {
        const res = await world.http
            .post(`/api/students/${STUDENT.priya}/marks`)
            .set("Authorization", world.as(USER.admin))
            .send({ subject: "Maths", marks: 10 });

        expect(res.status).toBe(409);
    });

    it("marks must be 0-100", async () => {
        const res = await world.http
            .post(`/api/students/${STUDENT.priya}/marks`)
            .set("Authorization", world.as(USER.admin))
            .send({ subject: "Art", marks: 101 });

        expect(res.status).toBe(400);
    });
});
