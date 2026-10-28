import { createApp } from "./src/app.js";
import type { Repositories } from "./src/app.js";
import { AppDataSource } from "./src/config/data-source.js";
import { loadEnv } from "./src/config/env.js";
import { AccessRepository } from "./src/module/access/access.repository.js";
import { MarkRepository } from "./src/module/mark/mark.repository.js";
import { StudentRepository } from "./src/module/student/student.repository.js";
import { UserRepository } from "./src/module/user/user.repository.js";
import { UserRoute } from "./src/routes/user.route.js";

export class ApplicationServer {
    public async start(): Promise<void> {
        // Fails fast, before touching the database, when the configuration is missing or unsafe.
        const env = loadEnv();
        await AppDataSource.initialize();

        const repositories: Repositories = {
            users: new UserRepository(),
            students: new StudentRepository(),
            marks: new MarkRepository(),
            access: new AccessRepository(),
        };
        const app = createApp(repositories, env, { legacyUserRoute: new UserRoute().router });

        app.listen(env.PORT, (error?: Error) => {
            if (error) {
                console.error(`Failed to listen on port ${env.PORT}:`, error);
                process.exit(1);
            }
            console.log(`Server started on port ${env.PORT}`);
        });
    }
}

new ApplicationServer().start().catch((error: unknown) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
