import { HttpStatus } from "../../errors/AppError.js";
import { UserService } from "./user.service.js";
export class UserController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getAll(_req, res) {
        const users = await this.service.getAll();
        res.status(HttpStatus.OK).json(users);
    }
    async create(req, res) {
        const name = req.query.name;
        const lastName = req.params.last;
        const age = req.body?.age;
        res.status(HttpStatus.OK).json({
            name,
            lastName,
            age,
        });
    }
}
//# sourceMappingURL=user.controller.js.map