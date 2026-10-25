import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import type { Relation } from "typeorm";
import { Student } from "../student/student.entity.js";

@Entity("student_marks")
@Unique(["studentId", "subject"])
@Check(`length(trim("subject")) > 0`)
@Check(`"marks" >= 0 AND "marks" <= 100`)
export class Mark {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "student_id", type: "uuid" })
    studentId!: string;

    @ManyToOne(() => Student, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "student_id" })
    student?: Relation<Student>;

    @Column({ type: "varchar", length: 255 })
    subject!: string;

    /** NUMERIC columns come back from pg as strings, so convert to a number on read. */
    @Column({
        type: "numeric",
        precision: 5,
        scale: 2,
        transformer: {
            to: (value: number): number => value,
            from: (value: string | null): number | null => (value === null ? null : Number(value)),
        },
    })
    marks!: number;
}
