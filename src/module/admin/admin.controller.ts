import type { Request, Response } from "express";
import { HttpStatus } from "../../errors/AppError.js";
import { requireActor } from "../../middleware/authenticate.js";
import { Validators } from "../../utils/validators.js";
import { AdminDto } from "./admin.dto.js";
import { AdminService } from "./admin.service.js";

export class AdminController {
    public constructor(private readonly service = new AdminService()) {}

    public async addTeacherClass(req: Request, res: Response): Promise<void> {
        const link = await this.service.addTeacherClass(AdminDto.teacherClass(req.body));
        res.status(HttpStatus.CREATED).json(link);
    }

    public async linkStudent(req: Request, res: Response): Promise<void> {
        const link = await this.service.linkStudent(AdminDto.studentLink(req.body));
        res.status(HttpStatus.CREATED).json(link);
    }

    public async changeRole(req: Request, res: Response): Promise<void> {
        const userId = Validators.uuidParam(req.params.userId, "userId");
        const user = await this.service.changeRole(requireActor(req), userId, AdminDto.roleChange(req.body));
        res.status(HttpStatus.OK).json(user);
    }
}
