
import type { Repository } from "typeorm";
import { Customer } from "./customer.entity.js";

export class UserService {
    public constructor(
        private readonly repository: Repository<Customer>
    ) {}

    public getAll(): Promise<Customer[]> {
        return this.repository.find();
    }
}
