import { AppDataSource } from "../../config/data-source.js";
import { Customer } from "./customer.entity.js";
export class UserService {
    repository;
    constructor(repository = AppDataSource.getRepository(Customer)) {
        this.repository = repository;
    }
    getAll() {
        return this.repository.find();
    }
}
//# sourceMappingURL=user.service.js.map