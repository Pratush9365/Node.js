import type { Request, Response } from "express";
import { HttpStatus } from "../../errors/AppError.js";
import { AuthDto } from "./auth.dto.js";
import { AuthService } from "./auth.service.js";

export class AuthController {
    public constructor(private readonly service: AuthService) {}

    public async register(req: Request, res: Response): Promise<void> {
        const user = await this.service.register(AuthDto.register(req.body));
        res.status(HttpStatus.CREATED).json(user);
    }

    public async login(req: Request, res: Response): Promise<void> {
        res.status(HttpStatus.OK).json(await this.service.login(AuthDto.login(req.body)));
    }
}
