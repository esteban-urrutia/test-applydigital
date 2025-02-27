import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { ReportsService } from "./reports.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@ApiTags("reports")
@ApiBearerAuth()
@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("deleted-products")
  @ApiOperation({ summary: "Get deleted products percentage" })
  @ApiResponse({
    status: 200,
    description: "Returns statistics about deleted products",
    schema: {
      properties: {
        total: { type: "number", example: 42 },
        percentage: { type: "number", example: 15.7 },
      },
    },
  })
  async getDeletedProductsPercentage() {
    return this.reportsService.getDeletedProductsPercentage();
  }

  @Get("non-deleted-products-with-price")
  @ApiOperation({ summary: "Get percentage of non-deleted products" })
  @ApiResponse({
    status: 200,
    description: "Returns statistics about non-deleted products",
    schema: {
      properties: {
        total: { type: "number", example: 237 },
        percentage: { type: "number", example: 84.3 },
      },
    },
  })
  async getNonDeletedProductsWithPricePercentage() {
    return this.reportsService.getNonDeletedProductsPercentage();
  }

  @Get("non-deleted-products-without-price")
  @ApiOperation({
    summary: "Get percentage of non-deleted products without price",
  })
  @ApiResponse({
    status: 200,
    description: "Returns statistics about non-deleted products without price",
    schema: {
      properties: {
        total: { type: "number", example: 45 },
        percentage: { type: "number", example: 19 },
      },
    },
  })
  async getNonDeletedProductsWithoutPricePercentage() {
    const priceStats = await this.reportsService.getPriceStats();
    return {
      total: priceStats.withoutPrice.total,
      percentage: priceStats.withoutPrice.percentage,
    };
  }

  @Get("price-stats")
  @ApiOperation({ summary: "Get price statistics for products" })
  @ApiResponse({
    status: 200,
    description: "Returns price statistics for products",
    schema: {
      properties: {
        withPrice: {
          properties: {
            total: { type: "number", example: 192 },
            percentage: { type: "number", example: 81 },
          },
        },
        withoutPrice: {
          properties: {
            total: { type: "number", example: 45 },
            percentage: { type: "number", example: 19 },
          },
        },
      },
    },
  })
  async getPriceStats() {
    return this.reportsService.getPriceStats();
  }

  @Get("date-range")
  @ApiOperation({ summary: "Get date range statistics for products" })
  @ApiQuery({
    name: "startDate",
    required: true,
    type: String,
    example: "2023-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: true,
    type: String,
    example: "2023-12-31",
  })
  @ApiResponse({
    status: 200,
    description: "Returns date range statistics for products",
    schema: {
      properties: {
        withinRange: {
          properties: {
            total: { type: "number", example: 150 },
            percentage: { type: "number", example: 63.3 },
          },
        },
        outsideRange: {
          properties: {
            total: { type: "number", example: 87 },
            percentage: { type: "number", example: 36.7 },
          },
        },
      },
    },
  })
  async getDateRangeStats(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.reportsService.getDateRangeStats(startDate, endDate);
  }

  @Get("price-range")
  @ApiOperation({ summary: "Get price range statistics for products" })
  @ApiQuery({ name: "minPrice", required: true, type: Number, example: 10 })
  @ApiQuery({ name: "maxPrice", required: true, type: Number, example: 100 })
  @ApiResponse({
    status: 200,
    description: "Returns price range statistics for products",
    schema: {
      properties: {
        withinRange: {
          properties: {
            total: { type: "number", example: 120 },
            percentage: { type: "number", example: 50.6 },
          },
        },
        belowRange: {
          properties: {
            total: { type: "number", example: 45 },
            percentage: { type: "number", example: 19 },
          },
        },
        aboveRange: {
          properties: {
            total: { type: "number", example: 72 },
            percentage: { type: "number", example: 30.4 },
          },
        },
      },
    },
  })
  async getPriceRangeStats(
    @Query("minPrice") minPrice: number,
    @Query("maxPrice") maxPrice: number,
  ) {
    return this.reportsService.getPriceRangeStats(minPrice, maxPrice);
  }

  @Get("summary")
  @ApiOperation({ summary: "Get complete product statistics summary" })
  @ApiQuery({
    name: "startDate",
    required: false,
    type: String,
    example: "2023-01-01",
  })
  @ApiQuery({
    name: "endDate",
    required: false,
    type: String,
    example: "2023-12-31",
  })
  @ApiQuery({ name: "minPrice", required: false, type: Number, example: 10 })
  @ApiQuery({ name: "maxPrice", required: false, type: Number, example: 100 })
  @ApiResponse({
    status: 200,
    description: "Returns comprehensive summary of product statistics",
    schema: {
      properties: {
        deletedStats: {
          properties: {
            total: { type: "number", example: 42 },
            percentage: { type: "number", example: 15.7 },
          },
        },
        nonDeletedStats: {
          properties: {
            total: { type: "number", example: 237 },
            percentage: { type: "number", example: 84.3 },
          },
        },
        priceStats: {
          properties: {
            withPrice: {
              properties: {
                total: { type: "number", example: 192 },
                percentage: { type: "number", example: 81 },
              },
            },
            withoutPrice: {
              properties: {
                total: { type: "number", example: 45 },
                percentage: { type: "number", example: 19 },
              },
            },
          },
        },
        dateRangeStats: {
          nullable: true,
          properties: {
            withinRange: {
              properties: {
                total: { type: "number", example: 150 },
                percentage: { type: "number", example: 63.3 },
              },
            },
            outsideRange: {
              properties: {
                total: { type: "number", example: 87 },
                percentage: { type: "number", example: 36.7 },
              },
            },
          },
        },
        priceRangeStats: {
          nullable: true,
          properties: {
            withinRange: {
              properties: {
                total: { type: "number", example: 120 },
                percentage: { type: "number", example: 50.6 },
              },
            },
            belowRange: {
              properties: {
                total: { type: "number", example: 45 },
                percentage: { type: "number", example: 19 },
              },
            },
            aboveRange: {
              properties: {
                total: { type: "number", example: 72 },
                percentage: { type: "number", example: 30.4 },
              },
            },
          },
        },
      },
    },
  })
  async getSummary(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("minPrice") minPrice: number,
    @Query("maxPrice") maxPrice: number,
  ) {
    const [
      deletedStats,
      nonDeletedStats,
      priceStats,
      dateRangeStats,
      priceRangeStats,
    ] = await Promise.all([
      this.reportsService.getDeletedProductsPercentage(),
      this.reportsService.getNonDeletedProductsPercentage(),
      this.reportsService.getPriceStats(),
      startDate && endDate
        ? this.reportsService.getDateRangeStats(startDate, endDate)
        : null,
      minPrice && maxPrice
        ? this.reportsService.getPriceRangeStats(minPrice, maxPrice)
        : null,
    ]);

    return {
      deletedStats,
      nonDeletedStats,
      priceStats,
      dateRangeStats,
      priceRangeStats,
    };
  }
}
