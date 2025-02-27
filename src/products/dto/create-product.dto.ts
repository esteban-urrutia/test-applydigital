import { ApiProperty } from "@nestjs/swagger";

export class CreateProductDto {
  @ApiProperty({
    example: "iPhone 13",
    description: "The name of the product",
  })
  name: string;

  @ApiProperty({
    example: "Electronics",
    description: "Product category",
  })
  category: string;

  @ApiProperty({
    example: 999.99,
    description: "Product price",
  })
  price: number;
}
