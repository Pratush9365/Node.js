import { Column, Entity, PrimaryColumn } from "typeorm";

// Maps the pre-existing `customers` table. `synchronize: false` keeps TypeORM from altering it.
// Property names intentionally match the column names so API responses keep the same shape.
@Entity("customers", { synchronize: false })
export class Customer {
    @PrimaryColumn({ type: "integer" })
    customer_id!: number;

    @Column({ type: "varchar" })
    customer_name!: string;

    @Column({ type: "varchar", nullable: true })
    city!: string | null;

    @Column({ type: "varchar", nullable: true })
    country!: string | null;

    @Column({ type: "integer", nullable: true })
    referred_by_customer_id!: number | null;
}
