import pool from "../../middleware/db.js";
export class UserService {
    async getAll() {
        const response = await pool.query("SELECT * FROM customers");
        return response.rows;
    }
}
//# sourceMappingURL=user.service.js.map