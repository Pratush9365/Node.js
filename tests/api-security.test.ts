import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { ErrorHandler } from "../src/middleware/errorHandler.js";
import { createRateLimiter } from "../src/middleware/rateLimit.js";
import { buildWorld, MARK, STUDENT, USER, uuid } from "./helpers/world.js";
import type { World } from "./helpers/world.js";

describe("C1 per-user rate limit on POST /api/students/:id/marks", () => {
    const LIMIT = 3;
    let world: World;
    beforeEach(() => {
        world = buildWorld({ marksRateLimitMax: LIMIT });
    });

    const postMark = (userId: string, subject: string, studentId: string = STUDENT.priya) =>
        world.http.post(`/api/students/${studentId}/marks`).set("Authorization", world.as(userId)).send({ subject, marks: 50 });

    it("user A's request over the limit is 429 (standard error shape) while user B on the SAME IP is still served", async () => {
        for (let i = 1; i <= LIMIT; i += 1) expect((await postMark(USER.rao, `Subject ${i}`)).status).toBe(201);

        const blocked = await postMark(USER.rao, "One too many");
        expect(blocked.status).toBe(429);
        expect(blocked.body).toEqual({ message: expect.any(String) });
        expect(Number(blocked.headers["retry-after"])).toBeGreaterThan(0);
        expect(world.marks.create).toHaveBeenCalledTimes(LIMIT);

        // Same machine, so the same IP (supertest connects from 127.0.0.1), but a different user.
        const other = await postMark(USER.admin, "Admin subject");
        expect(other.status).toBe(201);
    });

    it("the key is the user id, not the IP: a spoofed X-Forwarded-For does not reset the budget", async () => {
        for (let i = 1; i <= LIMIT; i += 1) await postMark(USER.rao, `Subject ${i}`);

        const spoofed = await world.http
            .post(`/api/students/${STUDENT.priya}/marks`)
            .set("Authorization", world.as(USER.rao))
            .set("X-Forwarded-For", "203.0.113.77")
            .send({ subject: "Spoofed", marks: 50 });

        expect(spoofed.status).toBe(429);
    });

    it("the counter belongs to the user, not the endpoint's student: Ms Rao is still blocked for another of her students", async () => {
        for (let i = 1; i <= LIMIT; i += 1) await postMark(USER.rao, `Subject ${i}`);

        expect((await postMark(USER.rao, "Elsewhere", STUDENT.rohan)).status).toBe(429);
    });

    it("only this route is limited", async () => {
        for (let i = 1; i <= LIMIT + 1; i += 1) await postMark(USER.rao, `Subject ${i}`);

        expect((await world.http.get("/api/students").set("Authorization", world.as(USER.rao))).status).toBe(200);
        expect((await world.http.get(`/api/marks/${MARK.priyaMaths}`).set("Authorization", world.as(USER.rao))).status).toBe(200);
    });

    it("anonymous requests never reach the limiter (401, and they cannot burn a user's budget)", async () => {
        for (let i = 0; i < LIMIT + 2; i += 1) {
            expect((await world.http.post(`/api/students/${STUDENT.priya}/marks`).send({ subject: "x", marks: 1 })).status).toBe(401);
        }
        expect((await postMark(USER.rao, "Still fine")).status).toBe(201);
    });

    it("defaults to 60 per 10 minutes when MARKS_RATE_LIMIT_MAX is unset", async () => {
        const { EnvironmentConfig } = await import("../src/config/env.js");
        expect(EnvironmentConfig.validate(validEnv()).MARKS_RATE_LIMIT_MAX).toBe(60);
    });
});

describe("createRateLimiter", () => {
    function appWith(now: () => number) {
        const app = express();
        app.get("/", createRateLimiter({ windowMs: 1000, max: 2, keyGenerator: (req) => String(req.query.who), now }), (_req, res) => {
            res.send("ok");
        });
        app.use(ErrorHandler.handle);
        return request(app);
    }

    it("counts per key and starts a new window once the old one has passed", async () => {
        let clock = 10_000;
        const http = appWith(() => clock);

        expect((await http.get("/?who=a")).status).toBe(200);
        expect((await http.get("/?who=a")).status).toBe(200);
        expect((await http.get("/?who=a")).status).toBe(429);
        expect((await http.get("/?who=b")).status).toBe(200);

        clock += 1001;
        expect((await http.get("/?who=a")).status).toBe(200);
    });
});

describe("C2 Cache-Control: no-store on personal data", () => {
    let world: World;
    beforeEach(() => {
        world = buildWorld();
    });

    it("is present on success responses", async () => {
        const admin = world.as(USER.admin);
        const responses = [
            await world.http.get("/api/students").set("Authorization", admin),
            await world.http.get(`/api/students/${STUDENT.priya}`).set("Authorization", admin),
            await world.http.get("/api/marks").set("Authorization", admin),
            await world.http.post("/api/auth/register").send({ email: "kim@school.test", password: "correct horse battery" }),
            await world.http.post("/api/auth/login").send({ email: "kim@school.test", password: "correct horse battery" }),
        ];

        for (const res of responses) {
            expect(res.status).toBeLessThan(300);
            expect(res.headers["cache-control"]).toBe("no-store");
        }
    });

    it("is present on error responses too", async () => {
        const admin = world.as(USER.admin);
        const responses = [
            [401, await world.http.get("/api/students")],
            [403, await world.http.get("/api/students").set("Authorization", world.as(USER.plain))],
            [404, await world.http.get(`/api/students/${uuid(999)}`).set("Authorization", admin)],
            [400, await world.http.get("/api/students/not-a-uuid").set("Authorization", admin)],
            [400, await world.http.post("/api/students").set("Authorization", admin).set("Content-Type", "application/json").send("{ broken json")],
            [401, await world.http.post("/api/auth/login").send({ email: "nobody@school.test", password: "whatever12" })],
            [404, await world.http.get("/api/marks/does/not/exist").set("Authorization", admin)],
        ] as const;

        for (const [status, res] of responses) {
            expect(res.status).toBe(status);
            expect(res.headers["cache-control"]).toBe("no-store");
        }
    });

    it("is present on a 429", async () => {
        const limited = buildWorld({ marksRateLimitMax: 1 });
        const send = () => limited.http.post(`/api/students/${STUDENT.priya}/marks`).set("Authorization", limited.as(USER.admin));
        await send().send({ subject: "A", marks: 1 });
        const res = await send().send({ subject: "B", marks: 1 });

        expect(res.status).toBe(429);
        expect(res.headers["cache-control"]).toBe("no-store");
    });
});

describe("C4 no secrets in responses", () => {
    it("login, then three student / marks endpoints: no body leaks the password, a hash or the raw token", async () => {
        const world = buildWorld();
        const password = "Tr0ub4dor&3-correct-horse";

        const registered = await world.http.post("/api/auth/register").send({ email: "admin2@school.test", password });
        expect(registered.status).toBe(201);
        // Promote the new account the way an admin would, so the three calls below return real data.
        const account = world.users.rows.find((row) => row.email === "admin2@school.test")!;
        account.role = "admin";

        const login = await world.http.post("/api/auth/login").send({ email: "admin2@school.test", password });
        expect(login.status).toBe(200);
        const token = login.body.accessToken as string;
        const auth = `Bearer ${token}`;

        const bodies = [
            registered.text,
            (await world.http.get("/api/students").set("Authorization", auth)).text,
            (await world.http.get(`/api/students/${STUDENT.priya}`).set("Authorization", auth)).text,
            (await world.http.get("/api/marks").set("Authorization", auth)).text,
            (await world.http.get("/api/marks/averages").set("Authorization", auth)).text,
            (await world.http.get("/api/students/not-a-uuid").set("Authorization", auth)).text,
            (await world.http.post("/api/auth/login").send({ email: "admin2@school.test", password: "wrong password" })).text,
        ];

        expect(account.passwordHash).toMatch(/^scrypt:/);
        for (const body of bodies) {
            expect(body.length).toBeGreaterThan(2);
            expect(body).not.toContain(password);
            expect(body).not.toContain(account.passwordHash);
            expect(body).not.toContain("scrypt:");
            expect(body).not.toContain(token);
            expect(body.toLowerCase()).not.toContain("passwordhash");
        }
    });

    it("the stored password is a salted scrypt hash, never the plain text, and two accounts with one password differ", async () => {
        const world = buildWorld();
        await world.http.post("/api/auth/register").send({ email: "one@school.test", password: "same password 123" });
        await world.http.post("/api/auth/register").send({ email: "two@school.test", password: "same password 123" });

        const hashOf = (email: string): string => world.users.rows.find((row) => row.email === email)?.passwordHash ?? "";
        expect(hashOf("one@school.test")).toMatch(/^scrypt:/);
        expect(hashOf("one@school.test")).not.toContain("same password 123");
        expect(hashOf("one@school.test")).not.toEqual(hashOf("two@school.test"));
    });
});

function validEnv(): NodeJS.ProcessEnv {
    return {
        DB_HOST: "localhost", DB_NAME: "school", DB_USER: "postgres", DB_PASSWORD: "pw",
        PASS_PERCENTAGE: "33.5", ACADEMIC_YEAR: "2026-27",
        JWT_SECRET: "x".repeat(40),
    };
}
