import express from 'express';
import { userRoute } from './src/route/user.route.js';
import { studentRoute } from "./src/route/student.route.js";
import { markRoute } from "./src/route/mark.route.js";
import { NotFoundMiddleware } from "./src/middleware/notFound.js";
import { ErrorHandler } from "./src/middleware/errorHandler.js";

export class ApplicationServer {
    public readonly app = express();

    public constructor() {
        this.app.use(express.json());
        this.app.use("/user", userRoute);
        this.app.use("/api/students", studentRoute);
        this.app.use("/api/marks", markRoute);
        this.app.use(NotFoundMiddleware.handle);
        this.app.use(ErrorHandler.handle);
    }

    public start(): void {
        const port = Number(process.env.PORT || 3000);
        this.app.listen(port, () => console.log(`Server started on port ${port}`));
    }
}

new ApplicationServer().start();
