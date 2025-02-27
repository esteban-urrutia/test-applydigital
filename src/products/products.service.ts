import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Repository,
  FindManyOptions,
  Between,
  MoreThanOrEqual,
  LessThanOrEqual,
} from "typeorm";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./product.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto): Promise<Product> {
    const product = new Product();
    product.name = createProductDto.name;
    product.category = createProductDto.category;
    product.price = createProductDto.price;

    return this.productsRepository.save(product);
  }

  async findAll(
    page: number,
    category?: string,
    startDate?: string,
    endDate?: string,
    minPrice?: number,
    maxPrice?: number,
  ): Promise<{ data: Product[]; total: number }> {
    const take = +process.env.MAX_ITEMS_PER_PAGE || 5; // Max items per page
    const skip = (page - 1) * take; // Calculate the number of items to skip

    const findOptions: FindManyOptions<Product> = {
      take,
      skip,
      where: {}, // Initialize where clause
    };

    // Add category filter if provided
    if (category) {
      findOptions.where = { ...findOptions.where, category };
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      findOptions.where = {
        ...findOptions.where,
        date: Between(new Date(startDate), new Date(endDate)),
      };
    }

    // Add price range filter if provided
    if (minPrice) {
      findOptions.where = {
        ...findOptions.where,
        price: MoreThanOrEqual(minPrice),
      };
    }
    if (maxPrice) {
      findOptions.where = {
        ...findOptions.where,
        price: LessThanOrEqual(maxPrice),
      };
    }

    // Fetch the products and total count
    const [data, total] =
      await this.productsRepository.findAndCount(findOptions);

    return { data, total };
  }

  findOne(id: number): Promise<Product> {
    return this.productsRepository.findOneBy({ id: id });
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.productsRepository.findOneBy({ id });

    // check if product exists
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Update properties
    Object.assign(product, updateProductDto);

    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    // Find the product first
    const product = await this.productsRepository.findOneBy({ id: +id });
    if (product) {
      // Set deleted flag to true
      product.deleted = true;
      await this.productsRepository.save(product);
    }
  }
}
