import express from "express";
import { AppDataSource } from "./src/config/data-source.js";
import { ErrorHandler } from "./src/middleware/errorHandler.js";
import { MongoDatabase } from './src/providers/database/mongo.database.js';
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
        await MongoDatabase.initConn();
        const port = Number(process.env.PORT || 3000);
        this.app.listen(port, () => console.log(`Server started on port ${port}`));
    }
}
new ApplicationServer().start().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map