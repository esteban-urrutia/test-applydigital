import { Test, TestingModule } from "@nestjs/testing";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import {
  ProductStats,
  PriceRangeStats,
  DateRangeStats,
  PriceValueRangeStats,
} from "./reports.service";

describe("ReportsController", () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockProductStats: ProductStats = {
    total: 10,
    percentage: 20,
  };

  const mockPriceRangeStats: PriceRangeStats = {
    withPrice: { total: 8, percentage: 80 },
    withoutPrice: { total: 2, percentage: 20 },
  };

  const mockDateRangeStats: DateRangeStats = {
    withinRange: { total: 6, percentage: 60 },
    outsideRange: { total: 4, percentage: 40 },
  };

  const mockPriceValueRangeStats: PriceValueRangeStats = {
    withinRange: { total: 5, percentage: 50 },
    belowRange: { total: 3, percentage: 30 },
    aboveRange: { total: 2, percentage: 20 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getDeletedProductsPercentage: jest
              .fn()
              .mockResolvedValue(mockProductStats),
            getNonDeletedProductsPercentage: jest
              .fn()
              .mockResolvedValue(mockProductStats),
            getPriceStats: jest.fn().mockResolvedValue(mockPriceRangeStats),
            getDateRangeStats: jest.fn().mockResolvedValue(mockDateRangeStats),
            getPriceRangeStats: jest
              .fn()
              .mockResolvedValue(mockPriceValueRangeStats),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getDeletedProductsPercentage", () => {
    it("should return deleted products percentage", async () => {
      const result = await controller.getDeletedProductsPercentage();
      expect(service.getDeletedProductsPercentage).toHaveBeenCalled();
      expect(result).toEqual(mockProductStats);
    });
  });

  describe("getNonDeletedProductsWithPricePercentage", () => {
    it("should return non-deleted products percentage", async () => {
      const result =
        await controller.getNonDeletedProductsWithPricePercentage();
      expect(service.getNonDeletedProductsPercentage).toHaveBeenCalled();
      expect(result).toEqual(mockProductStats);
    });
  });

  describe("getNonDeletedProductsWithoutPricePercentage", () => {
    it("should return products without price percentage", async () => {
      const result =
        await controller.getNonDeletedProductsWithoutPricePercentage();
      expect(service.getPriceStats).toHaveBeenCalled();
      expect(result).toEqual({
        total: mockPriceRangeStats.withoutPrice.total,
        percentage: mockPriceRangeStats.withoutPrice.percentage,
      });
    });
  });

  describe("getPriceStats", () => {
    it("should return price statistics", async () => {
      const result = await controller.getPriceStats();
      expect(service.getPriceStats).toHaveBeenCalled();
      expect(result).toEqual(mockPriceRangeStats);
    });
  });

  describe("getDateRangeStats", () => {
    it("should return date range statistics", async () => {
      const startDate = "2023-01-01";
      const endDate = "2023-12-31";

      const result = await controller.getDateRangeStats(startDate, endDate);

      expect(service.getDateRangeStats).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
      expect(result).toEqual(mockDateRangeStats);
    });
  });

  describe("getPriceRangeStats", () => {
    it("should return price range statistics", async () => {
      const minPrice = 10;
      const maxPrice = 100;

      const result = await controller.getPriceRangeStats(minPrice, maxPrice);

      expect(service.getPriceRangeStats).toHaveBeenCalledWith(
        minPrice,
        maxPrice,
      );
      expect(result).toEqual(mockPriceValueRangeStats);
    });
  });

  describe("getSummary", () => {
    it("should return full summary with all parameters", async () => {
      const startDate = "2023-01-01";
      const endDate = "2023-12-31";
      const minPrice = 10;
      const maxPrice = 100;

      const result = await controller.getSummary(
        startDate,
        endDate,
        minPrice,
        maxPrice,
      );

      expect(service.getDeletedProductsPercentage).toHaveBeenCalled();
      expect(service.getNonDeletedProductsPercentage).toHaveBeenCalled();
      expect(service.getPriceStats).toHaveBeenCalled();
      expect(service.getDateRangeStats).toHaveBeenCalledWith(
        startDate,
        endDate,
      );
      expect(service.getPriceRangeStats).toHaveBeenCalledWith(
        minPrice,
        maxPrice,
      );

      expect(result).toEqual({
        deletedStats: mockProductStats,
        nonDeletedStats: mockProductStats,
        priceStats: mockPriceRangeStats,
        dateRangeStats: mockDateRangeStats,
        priceRangeStats: mockPriceValueRangeStats,
      });
    });

    it("should return partial summary when date range params are missing", async () => {
      const result = await controller.getSummary(null, null, 10, 100);

      expect(service.getDateRangeStats).not.toHaveBeenCalled();
      expect(service.getPriceRangeStats).toHaveBeenCalledWith(10, 100);

      expect(result).toEqual({
        deletedStats: mockProductStats,
        nonDeletedStats: mockProductStats,
        priceStats: mockPriceRangeStats,
        dateRangeStats: null,
        priceRangeStats: mockPriceValueRangeStats,
      });
    });

    it("should return partial summary when price range params are missing", async () => {
      const result = await controller.getSummary(
        "2023-01-01",
        "2023-12-31",
        null,
        null,
      );

      expect(service.getDateRangeStats).toHaveBeenCalledWith(
        "2023-01-01",
        "2023-12-31",
      );
      expect(service.getPriceRangeStats).not.toHaveBeenCalled();

      expect(result).toEqual({
        deletedStats: mockProductStats,
        nonDeletedStats: mockProductStats,
        priceStats: mockPriceRangeStats,
        dateRangeStats: mockDateRangeStats,
        priceRangeStats: null,
      });
    });
  });
});
