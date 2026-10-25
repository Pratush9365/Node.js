import type { Request, Response } from "express";
import { HttpStatus } from "../../errors/AppError.js";
import { UserService } from "./user.service.js";

export class UserController {
    public constructor(private readonly service = new UserService()) {}

    public async getAll(_req: Request, res: Response): Promise<void> {
        try {
            const users = await this.service.getAll();
            res.status(HttpStatus.OK).json(users);
        } catch (error) {
            console.error("Database query failed:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch users" });
        }
    }

    public async create(req: Request, res: Response): Promise<void> {
        const name = req.query.name;
        const lastName = req.params.last;
        const age = req.body?.age;
        res.status(HttpStatus.OK).json({ name, lastName, age });
    }
}
