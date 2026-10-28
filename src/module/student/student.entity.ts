import { Check, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("students")
@Check(`length(trim("name")) > 0`)
export class Student {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "varchar", length: 255 })
    name!: string;

    @Column({ type: "varchar", length: 255, unique: true })
    email!: string;

    @Column({ name: "class_name", type: "varchar", length: 2 })
    className!: string;

    @Column({ type: "char", length: 1 })
    section!: string;
}
