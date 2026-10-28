import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["tests/**/*.test.ts"],
        // The repositories are replaced by fakes in the tests, but importing them still builds the (unconnected)
        // TypeORM DataSource, which insists on these variables being present.
        env: {
            DB_HOST: "localhost",
            DB_USER: "test",
            DB_NAME: "test",
            DB_PASSWORD: "test",
        },
    },
});
