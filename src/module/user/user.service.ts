import pool from "../../middleware/db.js";

export class UserService {
    public async getAll() {
        const response = await pool.query("SELECT * FROM customers");
        return response.rows;
    }
}
