import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import type { Relation } from "typeorm";
import { ROLE_VALUES } from "../../config/permissions.js";
import { Student } from "../student/student.entity.js";

/** A login. Not to be confused with `Customer`, the legacy read-only table. */
@Entity("users")
@Check("users_role_check", `"role" IN (${ROLE_VALUES.map((role) => `'${role}'`).join(", ")})`)
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    /** Never selected by default and never serialised into a response; login asks for it explicitly. */
    @Column({ name: "password_hash", type: "varchar", length: 255, select: false })
    passwordHash!: string;

    @Column({ type: "varchar", length: 20, default: "user" })
    role!: string;

    /** Set only for student accounts: links the login to the student record. One login per student. */
    @Column({ name: "student_id", type: "uuid", nullable: true, unique: true })
    studentId!: string | null;

    @ManyToOne(() => Student, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "student_id" })
    student?: Relation<Student>;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;
}
