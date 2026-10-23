import pool from "../../middleware/db.js";
import { AppError } from "../../errors/AppError.js";
export class StudentRepository {
    static toDomain(row) {
        if (!["father", "mother", "guardian"].includes(row.guardian_relation))
            throw new Error("Unknown guardian relation");
        return { id: row.id, rollNo: row.roll_no, firstName: row.first_name, lastName: row.last_name, dateOfBirth: new Date(row.date_of_birth), className: row.class_name, section: row.section, guardian: { name: row.guardian_name, phone: row.guardian_phone, relation: row.guardian_relation }, createdAt: new Date(row.created_at), updatedAt: new Date(row.updated_at) };
    }
    static toPersistence(changes) {
        return {
            ...(changes.rollNo && { roll_no: changes.rollNo }), ...(changes.firstName && { first_name: changes.firstName }), ...(changes.lastName && { last_name: changes.lastName }), ...(changes.dateOfBirth && { date_of_birth: changes.dateOfBirth }), ...(changes.className && { class_name: changes.className }), ...(changes.section && { section: changes.section }), ...(changes.guardian && { guardian_name: changes.guardian.name, guardian_phone: changes.guardian.phone, guardian_relation: changes.guardian.relation }),
        };
    }
    static async findById(id) { const r = await pool.query("SELECT * FROM students WHERE id=$1", [id]); return r.rows[0] ? this.toDomain(r.rows[0]) : null; }
    static async insert(changes) { const p = this.toPersistence(changes); try {
        const r = await pool.query("INSERT INTO students (roll_no,first_name,last_name,date_of_birth,class_name,section,guardian_name,guardian_phone,guardian_relation) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *", [p.roll_no, p.first_name, p.last_name, p.date_of_birth, p.class_name, p.section, p.guardian_name, p.guardian_phone, p.guardian_relation]);
        return this.toDomain(r.rows[0]);
    }
    catch (e) {
        if (e.code === "23505")
            throw AppError.conflict("roll number already exists");
        throw e;
    } }
}
//# sourceMappingURL=student.repository.js.map