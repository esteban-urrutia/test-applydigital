import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

@Entity()
export class Product {
  @ApiProperty({ example: 1, description: "Unique product identifier" })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: "iPhone 13", description: "Product name" })
  @Column()
  name: string;

  @ApiProperty({ example: "Electronics", description: "Product category" })
  @Column()
  category: string;

  @ApiProperty({
    example: 999.99,
    description: "Product price",
    nullable: true,
  })
  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  price: number | null;

  @ApiProperty({
    example: "2023-01-01T12:00:00Z",
    description: "Date when the product was created",
  })
  @CreateDateColumn()
  date: Date;

  @ApiProperty({
    example: false,
    description: "Whether the product has been soft deleted",
  })
  @Column({ default: false })
  deleted: boolean;
}
