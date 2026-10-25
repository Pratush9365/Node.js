import express from "express";
import { AppDataSource } from "./src/config/data-source.js";
import { ErrorHandler } from "./src/middleware/errorHandler.js";
import { NotFoundMiddleware } from "./src/middleware/notFound.js";
import { markRoute } from "./src/route/mark.route.js";
import { studentRoute } from "./src/route/student.route.js";
import { userRoute } from "./src/route/user.route.js";
const DEFAULT_PORT = 3000;
export class ApplicationServer {
    app = express();
    constructor() {
        this.app.use(express.json());
        this.app.use("/user", userRoute);
        this.app.use("/api/students", studentRoute);
        this.app.use("/api/marks", markRoute);
        this.app.use(NotFoundMiddleware.handle);
        this.app.use(ErrorHandler.handle);
    }
    async start() {
        await AppDataSource.initialize();
        const port = Number(process.env.PORT || DEFAULT_PORT);
        this.app.listen(port, (error) => {
            if (error) {
                console.error(`Failed to listen on port ${port}:`, error);
                process.exit(1);
            }
            console.log(`Server started on port ${port}`);
        });
    }
}
new ApplicationServer().start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map