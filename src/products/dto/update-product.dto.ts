import { PartialType } from "@nestjs/mapped-types";
import { ApiProperty } from "@nestjs/swagger";
import { CreateProductDto } from "./create-product.dto";

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty({ required: false })
  category?: string;

  @ApiProperty({ required: false })
  price?: number;
}
