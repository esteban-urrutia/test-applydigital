import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn()
  date: Date;

  @Column({ default: false })
  deleted: boolean;
}
