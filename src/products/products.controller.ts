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
import { CreateProductDto } from "./dto/create-product.dto";
import { Product } from "./product.entity";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  // Paginated results (max 5 per page) with ability to filter by category, date range and price range
  @Get()
  findAll(
    @Query("page") page: number = 1, // Default page to 1
    @Query("category") category?: string, // Optional category filter
    @Query("startDate") startDate?: string, // Optional start date filter
    @Query("endDate") endDate?: string, // Optional end date filter
    @Query("minPrice") minPrice?: number, // Optional min price filter
    @Query("maxPrice") maxPrice?: number, // Optional max price filter
    @Query("deleted") deleted: boolean = false, // Optional max price filter
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
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Product> {
    return this.productsService.findOne(id);
  }

  @Put(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() UpdateProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productsService.update(id, UpdateProductDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string): Promise<void> {
    return this.productsService.remove(id);
  }
}
