import { IsNull } from "typeorm";
import type { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import type { CreateUserInput, IUserRepository } from "./interface/user.interface.js";
import { User } from "./user.entity.js";

export class UserRepository implements IUserRepository {
    public constructor(private readonly repository: Repository<User> = AppDataSource.getRepository(User)) {}

    public create(input: CreateUserInput): Promise<User> {
        return this.repository.save(this.repository.create({ ...input, studentId: null }));
    }

    public findById(id: string): Promise<User | null> {
        return this.repository.findOneBy({ id });
    }

    public findByEmailWithPassword(email: string): Promise<User | null> {
        return this.repository
            .createQueryBuilder("user")
            .addSelect("user.passwordHash")
            .where("user.email = :email", { email })
            .getOne();
    }

    public async updateRole(id: string, role: string): Promise<User | null> {
        const result = await this.repository.update({ id }, { role });
        if (result.affected !== 1) return null;
        return this.findById(id);
    }

    public async linkStudent(userId: string, studentId: string): Promise<boolean> {
        const result = await this.repository.update({ id: userId, studentId: IsNull() }, { studentId });
        return result.affected === 1;
    }
}
