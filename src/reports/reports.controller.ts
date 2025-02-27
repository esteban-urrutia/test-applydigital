import { Controller, Get, Query } from "@nestjs/common";
import { ReportsService } from "./reports.service";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("deleted-products")
  async getDeletedProductsPercentage() {
    return this.reportsService.getDeletedProductsPercentage();
  }

  @Get("non-deleted-products-with-price")
  async getNonDeletedProductsWithPricePercentage() {
    return this.reportsService.getNonDeletedProductsPercentage();
  }

  @Get("non-deleted-products-without-price")
  async getNonDeletedProductsWithoutPricePercentage() {
    const priceStats = await this.reportsService.getPriceStats();
    return {
      total: priceStats.withoutPrice.total,
      percentage: priceStats.withoutPrice.percentage,
    };
  }

  @Get("price-stats")
  async getPriceStats() {
    return this.reportsService.getPriceStats();
  }

  @Get("date-range")
  async getDateRangeStats(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.reportsService.getDateRangeStats(startDate, endDate);
  }

  @Get("price-range")
  async getPriceRangeStats(
    @Query("minPrice") minPrice: number,
    @Query("maxPrice") maxPrice: number,
  ) {
    return this.reportsService.getPriceRangeStats(minPrice, maxPrice);
  }

  @Get("summary")
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
