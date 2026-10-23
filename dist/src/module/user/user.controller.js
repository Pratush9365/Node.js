import { UserService } from "./user.service.js";
export class UserController {
    service;
    constructor(service = new UserService()) {
        this.service = service;
    }
    async getAll(_req, res) {
        console.log("getUserData controller called");
        try {
            const users = await this.service.getAll();
            console.log("Rows fetched:", users.length);
            res.status(200).json(users);
        }
        catch (error) {
            console.error("Database query failed:", error);
            res.status(500).json({
                message: "Failed to fetch users",
            });
        }
    }
    async create(req, res) {
        const name = req.query.name;
        const lastName = req.params.last;
        const age = req.body.age;
        res.status(200).json({
            name,
            lastName,
            age,
        });
    }
}
//# sourceMappingURL=user.controller.js.map