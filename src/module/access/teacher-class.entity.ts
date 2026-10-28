import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import type { Relation } from "typeorm";
import { User } from "../user/user.entity.js";

/** Which (class, section) pairs a teacher teaches. The composite primary key makes duplicates impossible. */
@Entity("teacher_classes")
export class TeacherClass {
    @PrimaryColumn({ name: "teacher_user_id", type: "uuid" })
    teacherUserId!: string;

    @PrimaryColumn({ name: "class_name", type: "varchar", length: 2 })
    className!: string;

    @PrimaryColumn({ type: "char", length: 1 })
    section!: string;

    @ManyToOne(() => User, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "teacher_user_id" })
    teacher?: Relation<User>;
}
