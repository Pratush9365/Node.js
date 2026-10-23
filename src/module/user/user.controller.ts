import type { Request, Response } from "express";
import { UserService } from "./user.service.js";

export class UserController {
    public constructor(private readonly service = new UserService()) {}

    public async getAll(_req: Request, res: Response): Promise<void> {
    console.log("getUserData controller called");
    
    try {
        const users = await this.service.getAll();

        console.log("Rows fetched:", users.length);

        res.status(200).json(users);
    } catch (error) {
        console.error("Database query failed:", error);

        res.status(500).json({
            message: "Failed to fetch users",
        });
    }
    }
    
    public async create(req: Request, res: Response): Promise<void> {
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
