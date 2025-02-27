import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { CreateProductDto } from "./dto/create-product.dto";
import { Product } from "./product.entity";
import { ProductsService } from "./products.service";

@ApiTags("products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: "Create a new product" })
  @ApiResponse({
    status: 201,
    description: "The product has been successfully created.",
    type: Product,
  })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({
    summary: "Get all products with pagination and filtering options",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (default: 1)",
  })
  @ApiQuery({
    name: "category",
    required: false,
    type: String,
    description: "Filter by category",
  })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    description: "Filter by start date (ISO format)",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    description: "Filter by end date (ISO format)",
  })
  @ApiQuery({
    name: "minPrice",
    required: false,
    type: Number,
    description: "Filter by minimum price",
  })
  @ApiQuery({
    name: "maxPrice",
    required: false,
    type: Number,
    description: "Filter by maximum price",
  })
  @ApiQuery({
    name: "deleted",
    required: false,
    type: Boolean,
    description: "Include deleted products",
  })
  @ApiResponse({
    status: 200,
    description: "Returns paginated products",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/Product" },
        },
        total: {
          type: "number",
          example: 42,
        },
      },
    },
  })
  findAll(
    @Query("page") page: number = 1,
    @Query("category") category?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("minPrice") minPrice?: number,
    @Query("maxPrice") maxPrice?: number,
    @Query("deleted") deleted: boolean = false,
  ): Promise<{ data: Product[]; total: number }> {
    return this.productsService.findAll(
      page,
      category,
      startDate,
      endDate,
      minPrice,
      maxPrice,
      deleted,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get product by ID" })
  @ApiParam({ name: "id", type: "number", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Returns the product",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a product" })
  @ApiParam({ name: "id", type: "number", description: "Product ID" })
  @ApiResponse({
    status: 200,
    description: "Product updated successfully",
    type: Product,
  })
  @ApiResponse({ status: 404, description: "Product not found" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Soft delete a product (mark as deleted)" })
  @ApiParam({ name: "id", type: "string", description: "Product ID" })
  @ApiResponse({ status: 200, description: "Product marked as deleted" })
  @ApiResponse({ status: 404, description: "Product not found" })
  remove(@Param("id") id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
