import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Product } from "../products/product.entity";
import axios from "axios";

interface ContentfulResponse {
  items: {
    sys: {
      createdAt: string;
    };
    fields: {
      name: string;
      category: string;
      price: number;
    };
  }[];
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly configService: ConfigService,
  ) {}

  @Cron(
    !process.env.TESTMODE || process.env.TESTMODE.toLocaleLowerCase() === "yes"
      ? CronExpression.EVERY_MINUTE
      : CronExpression.EVERY_HOUR,
  )
  async fetchAndSaveProducts() {
    try {
      this.logger.log("Starting to fetch products from external API...");

      const url = this.buildContentfulUrl();
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);

      // Adding timestamp filter to only get entries from the last hour
      const filterUrl =
        !process.env.TESTMODE ||
        process.env.TESTMODE.toLocaleLowerCase() === "yes"
          ? `${url}&sys.createdAt[gte]=2024-01-23T21:47:00.000Z`
          : `${url}&sys.createdAt[gte]=${oneHourAgo.toISOString()}`;

      const response = await axios.get<ContentfulResponse>(filterUrl);
      const items = response.data.items;

      this.logger.log(`Fetched ${items.length} products from API`);

      for (const item of items) {
        await this.saveProductFromContentful(item);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to ingest products: ${errorMessage}`,
        errorStack,
      );
    }
  }

  private buildContentfulUrl(): string {
    let url = this.configService.get<string>("CONTENTFUL_URL");

    // Replace placeholders with actual values from .env file
    url = url.replace(
      "CONTENTFUL_SPACE_ID",
      this.configService.get("CONTENTFUL_SPACE_ID"),
    );
    url = url.replace(
      "CONTENTFUL_ENVIRONMENT",
      this.configService.get("CONTENTFUL_ENVIRONMENT"),
    );
    url = url.replace(
      "CONTENTFUL_ACCESS_TOKEN",
      this.configService.get("CONTENTFUL_ACCESS_TOKEN"),
    );
    url = url.replace(
      "CONTENTFUL_CONTENT_TYPE",
      this.configService.get("CONTENTFUL_CONTENT_TYPE"),
    );

    return url;
  }

  private async saveProductFromContentful(
    item: ContentfulResponse["items"][0],
  ): Promise<void> {
    const product = new Product();

    // Extract product data from contentful response
    product.name = item.fields.name;
    product.category = item.fields.category;
    product.price = item.fields.price;
    product.date = new Date(item.sys.createdAt);

    await this.productRepository.save(product);
    this.logger.log(`Saved product: ${product.name}`);
  }
}
