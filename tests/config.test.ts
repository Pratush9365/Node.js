import { describe, expect, it } from "vitest";
import { EnvironmentConfig } from "../src/config/env.js";

function validEnv(overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
    return {
        DB_HOST: "localhost", DB_NAME: "school", DB_USER: "postgres", DB_PASSWORD: "pw",
        PASS_PERCENTAGE: "33.5", ACADEMIC_YEAR: "2026-27",
        JWT_SECRET: "x".repeat(40),
        ...overrides,
    };
}

const WILDCARD_MESSAGE =
    'CORS_ORIGINS: must not be "*". Allowing every origin lets any website a logged-in user visits call this API from their browser, '
    + "so list each trusted origin explicitly (comma separated), e.g. https://school.example.com";

describe("C3 CORS_ORIGINS", () => {
    it("rejects the wildcard with its own, explanatory message", () => {
        expect(() => EnvironmentConfig.validate(validEnv({ CORS_ORIGINS: "*" }))).toThrow(new Error(WILDCARD_MESSAGE));
    });

    it("rejects a wildcard hidden in a list", () => {
        expect(() => EnvironmentConfig.validate(validEnv({ CORS_ORIGINS: "https://school.example.com, *" }))).toThrow(new Error(WILDCARD_MESSAGE));
    });

    it("the wildcard error is not the generic URL error", () => {
        expect(() => EnvironmentConfig.validate(validEnv({ CORS_ORIGINS: "*" }))).not.toThrow(/full URL/);
    });

    it("still rejects entries that are not full URLs", () => {
        expect(() => EnvironmentConfig.validate(validEnv({ CORS_ORIGINS: "school.example.com" }))).toThrow(/must be a full URL/);
    });

    it("accepts a comma separated list of origins", () => {
        const env = EnvironmentConfig.validate(validEnv({ CORS_ORIGINS: "https://school.example.com, http://localhost:5173" }));
        expect(env.CORS_ORIGINS).toEqual(["https://school.example.com", "http://localhost:5173"]);
    });

    it("has a safe local default", () => {
        expect(EnvironmentConfig.validate(validEnv()).CORS_ORIGINS).toEqual(["http://localhost:3000"]);
    });
});

describe("security settings", () => {
    it("JWT_SECRET is required and must be long enough", () => {
        const { JWT_SECRET: _omit, ...withoutSecret } = validEnv();
        expect(() => EnvironmentConfig.validate(withoutSecret)).toThrow(/JWT_SECRET/);
        expect(() => EnvironmentConfig.validate(validEnv({ JWT_SECRET: "short" }))).toThrow(/at least 32 characters/);
    });

    it("MARKS_RATE_LIMIT_MAX defaults to 60 and must be a positive integer", () => {
        expect(EnvironmentConfig.validate(validEnv()).MARKS_RATE_LIMIT_MAX).toBe(60);
        expect(EnvironmentConfig.validate(validEnv({ MARKS_RATE_LIMIT_MAX: "5" })).MARKS_RATE_LIMIT_MAX).toBe(5);
        expect(() => EnvironmentConfig.validate(validEnv({ MARKS_RATE_LIMIT_MAX: "0" }))).toThrow(/MARKS_RATE_LIMIT_MAX/);
        expect(() => EnvironmentConfig.validate(validEnv({ MARKS_RATE_LIMIT_MAX: "lots" }))).toThrow(/MARKS_RATE_LIMIT_MAX/);
    });
});
