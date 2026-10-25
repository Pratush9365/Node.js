import type { Repository } from "typeorm";
import { Customer } from "./customer.entity.js";
export declare class UserService {
    private readonly repository;
    constructor(repository?: Repository<Customer>);
    getAll(): Promise<Customer[]>;
}
//# sourceMappingURL=user.service.d.ts.map