import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ReportsService } from "./reports.service";
import { Product } from "../products/product.entity";

describe("ReportsService", () => {
  let service: ReportsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getDeletedProductsPercentage", () => {
    it("should return statistics for deleted products", async () => {
      jest.spyOn(repository, "count").mockResolvedValueOnce(100); // Total count
      jest.spyOn(repository, "count").mockResolvedValueOnce(20); // Deleted count

      const result = await service.getDeletedProductsPercentage();

      expect(repository.count).toHaveBeenCalledTimes(2);
      expect(repository.count).toHaveBeenNthCalledWith(2, {
        where: { deleted: true },
      });
      expect(result).toEqual({
        total: 20,
        percentage: 20,
      });
    });

    it("should handle empty database", async () => {
      jest.spyOn(repository, "count").mockResolvedValueOnce(0); // Total count

      const result = await service.getDeletedProductsPercentage();

      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        total: 0,
        percentage: 0,
      });
    });
  });

  describe("getNonDeletedProductsPercentage", () => {
    it("should return statistics for non-deleted products", async () => {
      jest.spyOn(repository, "count").mockResolvedValueOnce(100); // Total count
      jest.spyOn(repository, "count").mockResolvedValueOnce(80); // Non-deleted count

      const result = await service.getNonDeletedProductsPercentage();

      expect(repository.count).toHaveBeenCalledTimes(2);
      expect(repository.count).toHaveBeenNthCalledWith(2, {
        where: { deleted: false },
      });
      expect(result).toEqual({
        total: 80,
        percentage: 80,
      });
    });

    it("should handle empty database", async () => {
      jest.spyOn(repository, "count").mockResolvedValueOnce(0); // Total count

      const result = await service.getNonDeletedProductsPercentage();

      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        total: 0,
        percentage: 0,
      });
    });
  });

  describe("getPriceStats", () => {
    it("should return price statistics", async () => {
      jest
        .spyOn(repository, "count")
        .mockResolvedValueOnce(50) // Non-deleted count
        .mockResolvedValueOnce(40); // With price count

      const result = await service.getPriceStats();

      expect(repository.count).toHaveBeenCalledTimes(2);
      expect(repository.count).toHaveBeenNthCalledWith(1, {
        where: { deleted: false },
      });
      expect(repository.count).toHaveBeenNthCalledWith(2, {
        where: {
          deleted: false,
          price: expect.any(Object), // MoreThanOrEqual(0)
        },
      });
      expect(result).toEqual({
        withPrice: {
          total: 40,
          percentage: 80,
        },
        withoutPrice: {
          total: 10,
          percentage: 20,
        },
      });
    });

    it("should handle case with no non-deleted products", async () => {
      jest.spyOn(repository, "count").mockResolvedValueOnce(0); // Non-deleted count

      const result = await service.getPriceStats();

      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        withPrice: { total: 0, percentage: 0 },
        withoutPrice: { total: 0, percentage: 0 },
      });
    });
  });

  describe("getDateRangeStats", () => {
    it("should return date range statistics", async () => {
      const startDate = "2023-01-01";
      const endDate = "2023-12-31";

      jest
        .spyOn(repository, "count")
        .mockResolvedValueOnce(50) // Non-deleted count
        .mockResolvedValueOnce(30); // Within date range count

      const result = await service.getDateRangeStats(startDate, endDate);

      expect(repository.count).toHaveBeenCalledTimes(2);
      expect(repository.count).toHaveBeenNthCalledWith(1, {
        where: { deleted: false },
      });
      expect(repository.count).toHaveBeenNthCalledWith(2, {
        where: {
          deleted: false,
          date: expect.any(Object), // Between(new Date(startDate), new Date(endDate))
        },
      });
      expect(result).toEqual({
        withinRange: {
          total: 30,
          percentage: 60,
        },
        outsideRange: {
          total: 20,
          percentage: 40,
        },
      });
    });

    it("should handle case with no non-deleted products", async () => {
      jest.spyOn(repository, "count").mockResolvedValueOnce(0); // Non-deleted count

      const result = await service.getDateRangeStats(
        "2023-01-01",
        "2023-12-31",
      );

      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        withinRange: { total: 0, percentage: 0 },
        outsideRange: { total: 0, percentage: 0 },
      });
    });
  });

  describe("getPriceRangeStats", () => {
    it("should return price range statistics", async () => {
      const minPrice = 10;
      const maxPrice = 100;

      jest
        .spyOn(repository, "count")
        .mockResolvedValueOnce(100) // Non-deleted count
        .mockResolvedValueOnce(50) // Within price range count
        .mockResolvedValueOnce(20) // Below price range count
        .mockResolvedValueOnce(30); // Above price range count

      const result = await service.getPriceRangeStats(minPrice, maxPrice);

      expect(repository.count).toHaveBeenCalledTimes(4);
      expect(repository.count).toHaveBeenNthCalledWith(1, {
        where: { deleted: false },
      });
      expect(repository.count).toHaveBeenNthCalledWith(2, {
        where: {
          deleted: false,
          price: expect.any(Object), // Between(minPrice, maxPrice)
        },
      });
      expect(repository.count).toHaveBeenNthCalledWith(3, {
        where: {
          deleted: false,
          price: expect.any(Object), // LessThanOrEqual(minPrice)
        },
      });
      expect(repository.count).toHaveBeenNthCalledWith(4, {
        where: {
          deleted: false,
          price: expect.any(Object), // MoreThanOrEqual(maxPrice)
        },
      });

      expect(result).toEqual({
        withinRange: {
          total: 50,
          percentage: 50,
        },
        belowRange: {
          total: 20,
          percentage: 20,
        },
        aboveRange: {
          total: 30,
          percentage: 30,
        },
      });
    });

    it("should handle case with no non-deleted products", async () => {
      jest.spyOn(repository, "count").mockResolvedValueOnce(0); // Non-deleted count

      const result = await service.getPriceRangeStats(10, 100);

      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        withinRange: { total: 0, percentage: 0 },
        belowRange: { total: 0, percentage: 0 },
        aboveRange: { total: 0, percentage: 0 },
      });
    });
  });
});
