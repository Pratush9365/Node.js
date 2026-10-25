import type { Repository } from "typeorm";
import { AppDataSource } from "../../config/data-source.js";
import { Customer } from "./customer.entity.js";

export class UserService {
    public constructor(private readonly repository: Repository<Customer> = AppDataSource.getRepository(Customer)) {}

    public getAll(): Promise<Customer[]> {
        return this.repository.find();
    }
}
