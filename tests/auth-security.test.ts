import jwt from "jsonwebtoken";
import { beforeEach, describe, expect, it } from "vitest";
import { buildWorld, MARK, STUDENT, TEST_JWT_SECRET, USER, uuid } from "./helpers/world.js";
import type { World } from "./helpers/world.js";

let world: World;
beforeEach(() => {
    world = buildWorld();
});

describe("A1/A2 registration and login", () => {
    it("registration creates a plain 'user' and never returns a password or hash", async () => {
        const res = await world.http.post("/api/auth/register").send({ email: "New@School.test", password: "correct horse battery" });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ email: "new@school.test", role: "user", studentId: null });
        expect(JSON.stringify(res.body)).not.toMatch(/password|hash|scrypt/i);
    });

    it("cannot self-assign a role or a student link at registration", async () => {
        const res = await world.http.post("/api/auth/register").send({
            email: "sneaky@school.test",
            password: "correct horse battery",
            role: "admin",
            studentId: STUDENT.priya,
        });

        expect(res.status).toBe(201);
        expect(res.body.role).toBe("user");
        expect(res.body.studentId).toBeNull();
    });

    it("rejects short passwords, bad emails and duplicate emails", async () => {
        expect((await world.http.post("/api/auth/register").send({ email: "a@b.test", password: "short" })).status).toBe(400);
        expect((await world.http.post("/api/auth/register").send({ email: "not-an-email", password: "correct horse battery" })).status).toBe(400);
        expect((await world.http.post("/api/auth/register").send({ email: "admin@school.test", password: "correct horse battery" })).status).toBe(409);
    });

    it("login returns a 15 minute bearer token; wrong password and unknown email look identical", async () => {
        await world.http.post("/api/auth/register").send({ email: "kim@school.test", password: "correct horse battery" });

        const ok = await world.http.post("/api/auth/login").send({ email: "kim@school.test", password: "correct horse battery" });
        expect(ok.status).toBe(200);
        expect(ok.body).toMatchObject({ tokenType: "Bearer", expiresIn: 900 });
        const claims = jwt.verify(ok.body.accessToken, TEST_JWT_SECRET) as jwt.JwtPayload;
        expect(claims.exp! - claims.iat!).toBe(900);
        expect(claims).not.toHaveProperty("role");

        const wrongPassword = await world.http.post("/api/auth/login").send({ email: "kim@school.test", password: "wrong password!" });
        const unknownEmail = await world.http.post("/api/auth/login").send({ email: "nobody@school.test", password: "correct horse battery" });
        expect(wrongPassword.status).toBe(401);
        expect(unknownEmail.status).toBe(401);
        expect(unknownEmail.body).toEqual(wrongPassword.body);
    });

    it("a freshly registered 'user' can see NO students or marks", async () => {
        await world.http.post("/api/auth/register").send({ email: "kim@school.test", password: "correct horse battery" });
        const login = await world.http.post("/api/auth/login").send({ email: "kim@school.test", password: "correct horse battery" });
        const auth = `Bearer ${login.body.accessToken as string}`;

        const attempts = [
            world.http.get("/api/students").set("Authorization", auth),
            world.http.get(`/api/students/${STUDENT.priya}`).set("Authorization", auth),
            world.http.get("/api/marks").set("Authorization", auth),
            world.http.get(`/api/marks/${MARK.priyaMaths}`).set("Authorization", auth),
            world.http.get("/api/marks/averages").set("Authorization", auth),
            world.http.post(`/api/students/${STUDENT.priya}/marks`).set("Authorization", auth).send({ subject: "Maths", marks: 1 }),
        ];
        for (const response of await Promise.all(attempts)) {
            expect(response.status).toBe(403);
            expect(JSON.stringify(response.body)).not.toContain("school.test");
        }
        expect(world.marks.create).not.toHaveBeenCalled();
    });

    it("moderator keeps working as a role but has no school-data permissions", async () => {
        world.users.rows.push({ ...world.users.rows[0]!, id: uuid(77), email: "mod@school.test", role: "moderator" });
        const res = await world.http.get("/api/students").set("Authorization", world.as(uuid(77)));
        expect(res.status).toBe(403);
    });
});

describe("authentication", () => {
    it.each([
        ["no Authorization header", undefined],
        ["a non-bearer scheme", "Basic dXNlcjpwYXNz"],
        ["garbage", "Bearer not.a.jwt"],
        ["a token signed with another secret", `Bearer ${jwt.sign({}, "x".repeat(40), { subject: USER.admin })}`],
        ["an expired token", `Bearer ${jwt.sign({}, TEST_JWT_SECRET, { subject: USER.admin, expiresIn: -10 })}`],
        ["an unsigned (alg none) token", `Bearer ${Buffer.from('{"alg":"none","typ":"JWT"}').toString("base64url")}.${Buffer.from(`{"sub":"${USER.admin}"}`).toString("base64url")}.`],
        ["a token for a user that no longer exists", `Bearer ${jwt.sign({}, TEST_JWT_SECRET, { subject: uuid(999), expiresIn: 60 })}`],
    ])("401 for %s", async (_label, header) => {
        const req = world.http.get("/api/students");
        const res = await (header === undefined ? req : req.set("Authorization", header));

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ message: expect.any(String) });
    });
});

describe("A3 admin: teacher-classes", () => {
    const post = (body: unknown, as: string) => world.http.post("/api/admin/teacher-classes").set("Authorization", as).send(body as object);

    it("admin assigns a class to a teacher", async () => {
        const res = await post({ teacherUserId: USER.iyer, className: "10", section: "C" }, world.as(USER.admin));

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ teacherUserId: USER.iyer, className: "10", section: "C" });
        expect(world.access.links).toContainEqual({ teacherUserId: USER.iyer, className: "10", section: "C" });
    });

    it.each([USER.rao, USER.priya, USER.plain])("is admin-only: %s gets 403 and nothing is written", async (actor) => {
        const res = await post({ teacherUserId: USER.iyer, className: "10", section: "C" }, world.as(actor));

        expect(res.status).toBe(403);
        expect(world.access.addTeacherClass).not.toHaveBeenCalled();
    });

    it("401 without a token", async () => {
        expect((await world.http.post("/api/admin/teacher-classes").send({})).status).toBe(401);
    });

    it.each([
        ["className out of range", { teacherUserId: USER.iyer, className: "13", section: "A" }],
        ["className not numeric", { teacherUserId: USER.iyer, className: "ten", section: "A" }],
        ["lower-case section", { teacherUserId: USER.iyer, className: "10", section: "a" }],
        ["multi-letter section", { teacherUserId: USER.iyer, className: "10", section: "AB" }],
        ["teacherUserId not a uuid", { teacherUserId: "2", className: "10", section: "A" }],
        ["missing fields", {}],
    ])("400 for %s", async (_label, body) => {
        const res = await post(body, world.as(USER.admin));

        expect(res.status).toBe(400);
        expect(world.access.addTeacherClass).not.toHaveBeenCalled();
    });

    it("400 when the target is not a teacher account", async () => {
        for (const target of [USER.priya, USER.plain, USER.admin]) {
            expect((await post({ teacherUserId: target, className: "10", section: "A" }, world.as(USER.admin))).status).toBe(400);
        }
        expect(world.access.addTeacherClass).not.toHaveBeenCalled();
    });

    it("404 for an unknown user", async () => {
        expect((await post({ teacherUserId: uuid(999), className: "10", section: "A" }, world.as(USER.admin))).status).toBe(404);
    });

    it("409 for a duplicate link", async () => {
        const res = await post({ teacherUserId: USER.rao, className: "10", section: "A" }, world.as(USER.admin));

        expect(res.status).toBe(409);
        expect(world.access.links.filter((l) => l.teacherUserId === USER.rao)).toHaveLength(2);
    });
});

describe("A3 admin: student-links", () => {
    const post = (body: unknown, as: string) => world.http.post("/api/admin/student-links").set("Authorization", as).send(body as object);

    it("admin links a student account to a student record", async () => {
        const res = await post({ userId: USER.unlinkedStudent, studentId: STUDENT.meera }, world.as(USER.admin));

        expect(res.status).toBe(201);
        expect(res.body).toEqual({ userId: USER.unlinkedStudent, studentId: STUDENT.meera });
        expect(world.users.rows.find((u) => u.id === USER.unlinkedStudent)?.studentId).toBe(STUDENT.meera);
    });

    it("is admin-only", async () => {
        const res = await post({ userId: USER.unlinkedStudent, studentId: STUDENT.meera }, world.as(USER.rao));

        expect(res.status).toBe(403);
        expect(world.users.linkStudent).not.toHaveBeenCalled();
    });

    it("400 for malformed ids", async () => {
        expect((await post({ userId: "4", studentId: "17" }, world.as(USER.admin))).status).toBe(400);
        expect((await post({}, world.as(USER.admin))).status).toBe(400);
    });

    it("400 when the account is not a student account", async () => {
        for (const target of [USER.rao, USER.plain, USER.admin]) {
            expect((await post({ userId: target, studentId: STUDENT.meera }, world.as(USER.admin))).status).toBe(400);
        }
        expect(world.users.linkStudent).not.toHaveBeenCalled();
    });

    it("404 for an unknown user or an unknown student", async () => {
        expect((await post({ userId: uuid(999), studentId: STUDENT.meera }, world.as(USER.admin))).status).toBe(404);
        expect((await post({ userId: USER.unlinkedStudent, studentId: uuid(999) }, world.as(USER.admin))).status).toBe(404);
    });

    it("409 when the account is already linked, or the student already has a login", async () => {
        const alreadyLinked = await post({ userId: USER.priya, studentId: STUDENT.priya }, world.as(USER.admin));
        const studentTaken = await post({ userId: USER.unlinkedStudent, studentId: STUDENT.priya }, world.as(USER.admin));

        expect(alreadyLinked.status).toBe(409);
        expect(studentTaken.status).toBe(409);
        expect(world.users.rows.find((u) => u.id === USER.unlinkedStudent)?.studentId).toBeNull();
    });
});

describe("A4 token lifetime and role reload", () => {
    it("a token issued while the user was a teacher stops working for teacher actions once an admin demotes them", async () => {
        const raoToken = world.as(USER.rao);
        const postMark = (subject: string) =>
            world.http.post(`/api/students/${STUDENT.priya}/marks`).set("Authorization", raoToken).send({ subject, marks: 80 });

        expect((await postMark("Physics")).status).toBe(201);

        const demote = await world.http
            .patch(`/api/admin/users/${USER.rao}/role`)
            .set("Authorization", world.as(USER.admin))
            .send({ role: "user" });
        expect(demote.status).toBe(200);
        expect(demote.body.role).toBe("user");

        const created = world.marks.create.mock.calls.length;
        const after = await postMark("Chemistry");
        expect(after.status).toBe(403);
        expect((await world.http.get("/api/students").set("Authorization", raoToken)).status).toBe(403);
        expect(world.marks.create.mock.calls.length).toBe(created);
    });

    it("the same token works again if the role is restored (the token never carried the role)", async () => {
        await world.http.patch(`/api/admin/users/${USER.rao}/role`).set("Authorization", world.as(USER.admin)).send({ role: "user" });
        await world.http.patch(`/api/admin/users/${USER.rao}/role`).set("Authorization", world.as(USER.admin)).send({ role: "teacher" });

        expect((await world.http.get("/api/students").set("Authorization", world.as(USER.rao))).status).toBe(200);
    });

    it("only an admin can change roles, and not their own", async () => {
        const asRao = await world.http.patch(`/api/admin/users/${USER.rao}/role`).set("Authorization", world.as(USER.rao)).send({ role: "admin" });
        expect(asRao.status).toBe(403);
        expect(world.users.rows.find((u) => u.id === USER.rao)?.role).toBe("teacher");

        const self = await world.http.patch(`/api/admin/users/${USER.admin}/role`).set("Authorization", world.as(USER.admin)).send({ role: "user" });
        expect(self.status).toBe(400);

        const bogus = await world.http.patch(`/api/admin/users/${USER.rao}/role`).set("Authorization", world.as(USER.admin)).send({ role: "superuser" });
        expect(bogus.status).toBe(400);
    });

    it("a deleted account's token stops working immediately", async () => {
        const token = world.as(USER.rao);
        world.users.rows.splice(world.users.rows.findIndex((u) => u.id === USER.rao), 1);

        expect((await world.http.get("/api/students").set("Authorization", token)).status).toBe(401);
    });
});
