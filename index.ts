
import express from "express";
import { AppDataSource } from "./src/config/data-source.js";
import { ErrorHandler } from "./src/middleware/errorHandler.js";
import { NotFoundMiddleware } from "./src/middleware/notFound.js";

import { MarkRepository } from "./src/module/mark/mark.repository.js";
import { MarkService } from "./src/module/mark/mark.service.js";
import { MarkController } from "./src/module/mark/mark.controller.js";
import { MarkRoute } from "./src/route/mark.route.js";

import { StudentRepository } from "./src/module/student/student.repository.js";
import { StudentService } from "./src/module/student/student.service.js";
import { StudentController } from "./src/module/student/student.controller.js";
import { StudentRoute } from "./src/route/student.route.js";

import { Customer } from "./src/module/user/customer.entity.js";
import { UserService } from "./src/module/user/user.service.js";
import { UserController } from "./src/module/user/user.controller.js";
import { UserRoute } from "./src/route/user.route.js";

const DEFAULT_PORT = 3000;

export class ApplicationServer {
    public readonly app = express();

    public constructor() {
        this.app.use(express.json());
    }

    private registerRoutes(): void {
        // Student dependencies
        const studentRepository = new StudentRepository();
        const studentService = new StudentService(studentRepository);
        const studentController = new StudentController(studentService);
        const studentRoute = new StudentRoute(studentController);

        // Mark dependencies
        const markRepository = new MarkRepository();
        const markService = new MarkService(
            markRepository,
            studentRepository
        );
        const markController = new MarkController(markService);
        const markRoute = new MarkRoute(markController);

        // User dependencies (TypeORM)
        const customerRepository = AppDataSource.getRepository(Customer);
        const userService = new UserService(customerRepository);
        const userController = new UserController(userService);
        const userRoute = new UserRoute(userController);

        this.app.use("/user", userRoute.router);
        this.app.use("/api/students", studentRoute.router);
        this.app.use("/api/marks", markRoute.router);

        this.app.use(NotFoundMiddleware.handle);
        this.app.use(ErrorHandler.handle);
    }

    public async start(): Promise<void> {
        await AppDataSource.initialize();

        this.registerRoutes();

        const port = Number(process.env.PORT || DEFAULT_PORT);

        this.app.listen(port, (error?: Error) => {
            if (error) {
                console.error(`Failed to listen on port ${port}:`, error);
                process.exit(1);
            }

            console.log(`Server started on port ${port}`);
        });
    }
}

new ApplicationServer().start().catch((error: unknown) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
