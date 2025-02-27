import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { Product } from "../products/product.entity";

export interface ProductStats {
  total: number;
  percentage: number;
}

export interface PriceRangeStats {
  withPrice: ProductStats;
  withoutPrice: ProductStats;
}

export interface DateRangeStats {
  withinRange: ProductStats;
  outsideRange: ProductStats;
}

export interface PriceValueRangeStats {
  withinRange: ProductStats;
  belowRange: ProductStats;
  aboveRange: ProductStats;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getDeletedProductsPercentage(): Promise<ProductStats> {
    const total = await this.productRepository.count();
    if (total === 0) {
      return { total: 0, percentage: 0 };
    }

    const deleted = await this.productRepository.count({
      where: { deleted: true },
    });

    return {
      total: deleted,
      percentage: (deleted / total) * 100,
    };
  }

  async getNonDeletedProductsPercentage(): Promise<ProductStats> {
    const total = await this.productRepository.count();
    if (total === 0) {
      return { total: 0, percentage: 0 };
    }

    const nonDeleted = await this.productRepository.count({
      where: { deleted: false },
    });

    return {
      total: nonDeleted,
      percentage: (nonDeleted / total) * 100,
    };
  }

  async getPriceStats(): Promise<PriceRangeStats> {
    const nonDeleted = await this.productRepository.count({
      where: { deleted: false },
    });

    if (nonDeleted === 0) {
      return {
        withPrice: { total: 0, percentage: 0 },
        withoutPrice: { total: 0, percentage: 0 },
      };
    }

    const withPrice = await this.productRepository.count({
      where: {
        deleted: false,
        price: MoreThanOrEqual(0),
      },
    });

    const withoutPrice = nonDeleted - withPrice;

    return {
      withPrice: {
        total: withPrice,
        percentage: (withPrice / nonDeleted) * 100,
      },
      withoutPrice: {
        total: withoutPrice,
        percentage: (withoutPrice / nonDeleted) * 100,
      },
    };
  }

  async getDateRangeStats(
    startDate: string,
    endDate: string,
  ): Promise<DateRangeStats> {
    const nonDeleted = await this.productRepository.count({
      where: { deleted: false },
    });

    if (nonDeleted === 0) {
      return {
        withinRange: { total: 0, percentage: 0 },
        outsideRange: { total: 0, percentage: 0 },
      };
    }

    const withinRange = await this.productRepository.count({
      where: {
        deleted: false,
        date: Between(new Date(startDate), new Date(endDate)),
      },
    });

    const outsideRange = nonDeleted - withinRange;

    return {
      withinRange: {
        total: withinRange,
        percentage: (withinRange / nonDeleted) * 100,
      },
      outsideRange: {
        total: outsideRange,
        percentage: (outsideRange / nonDeleted) * 100,
      },
    };
  }

  async getPriceRangeStats(
    minPrice: number,
    maxPrice: number,
  ): Promise<PriceValueRangeStats> {
    const nonDeleted = await this.productRepository.count({
      where: { deleted: false },
    });

    if (nonDeleted === 0) {
      return {
        withinRange: { total: 0, percentage: 0 },
        belowRange: { total: 0, percentage: 0 },
        aboveRange: { total: 0, percentage: 0 },
      };
    }

    const withinRange = await this.productRepository.count({
      where: {
        deleted: false,
        price: Between(minPrice, maxPrice),
      },
    });

    const belowRange = await this.productRepository.count({
      where: {
        deleted: false,
        price: LessThanOrEqual(minPrice),
      },
    });

    const aboveRange = await this.productRepository.count({
      where: {
        deleted: false,
        price: MoreThanOrEqual(maxPrice),
      },
    });

    return {
      withinRange: {
        total: withinRange,
        percentage: (withinRange / nonDeleted) * 100,
      },
      belowRange: {
        total: belowRange,
        percentage: (belowRange / nonDeleted) * 100,
      },
      aboveRange: {
        total: aboveRange,
        percentage: (aboveRange / nonDeleted) * 100,
      },
    };
  }
}
