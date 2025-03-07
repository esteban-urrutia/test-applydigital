import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Product } from "./product.entity";
import { ProductsService } from "./products.service";
import { Repository } from "typeorm";

const productArray = [
  {
    name: "car 1",
    category: "cars",
    price: 10,
  },
  {
    name: "car 2",
    category: "cars",
    price: 10,
  },
];

const oneProduct = {
  name: "car 1",
  category: "cars",
  price: 10,
};

describe("ProductService", () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: jest.fn().mockResolvedValue(productArray),
            findOneBy: jest.fn().mockResolvedValue(oneProduct),
            save: jest.fn().mockResolvedValue(oneProduct),
            remove: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create()", () => {
    it("should successfully insert a product", () => {
      const oneProduct = {
        name: "car 1",
        category: "cars",
        price: 10,
      };

      expect(
        service.create({
          name: "car 1",
          category: "cars",
          price: 10,
        }),
      ).resolves.toEqual(oneProduct);
    });
  });

  describe("findAll()", () => {
    beforeEach(() => {
      // Add findAndCount mock to the repository
      repository.findAndCount = jest.fn();
    });

    it("should return paginated products with total count", async () => {
      const page = 1;
      const mockProducts = [
        {
          id: 1,
          name: "car 1",
          category: "cars",
          price: 10,
          date: new Date(),
          deleted: false,
        },
        {
          id: 2,
          name: "car 2",
          category: "cars",
          price: 15,
          date: new Date(),
          deleted: false,
        },
      ];

      const mockResult = {
        data: mockProducts,
        total: 2,
      };

      // Mock the findAndCount repository method
      jest
        .spyOn(repository, "findAndCount")
        .mockResolvedValue([mockProducts, 2]);

      const result = await service.findAll(page);

      expect(result).toEqual(mockResult);
      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          take: expect.any(Number),
          skip: 0,
          where: { deleted: false },
        }),
      );
    });

    it("should apply filters when provided", async () => {
      const page = 1;
      const category = "cars";
      const startDate = "2023-01-01";
      const endDate = "2023-12-31";
      const minPrice = 5;
      const maxPrice = 20;

      const mockProducts = [
        {
          id: 1,
          name: "car 1",
          category: "cars",
          price: 10,
          date: new Date(),
          deleted: false,
        },
      ];

      // Mock the findAndCount repository method
      jest
        .spyOn(repository, "findAndCount")
        .mockResolvedValue([mockProducts, 1]);

      const result = await service.findAll(
        page,
        category,
        startDate,
        endDate,
        minPrice,
        maxPrice,
      );

      expect(result).toEqual({ data: mockProducts, total: 1 });
      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: "cars",
            deleted: false,
          } as Record<string, unknown>),
        }),
      );
    });

    it("should include deleted products when includeDeleted is true", async () => {
      const page = 1;
      const mockProducts = [
        {
          id: 1,
          name: "car 1",
          category: "cars",
          price: 10,
          date: new Date(),
          deleted: false,
        },
        {
          id: 3,
          name: "deleted car",
          category: "cars",
          price: 12,
          date: new Date(),
          deleted: true,
        },
      ];

      jest
        .spyOn(repository, "findAndCount")
        .mockResolvedValue([mockProducts, 2]);

      await service.findAll(
        page,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true,
      );

      expect(repository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            deleted: false,
          }) as Record<string, unknown>,
        }),
      );
    });
  });

  describe("findOne()", () => {
    it("should get a single product", () => {
      const repoSpy = jest.spyOn(repository, "findOneBy");
      expect(service.findOne(1)).resolves.toEqual(oneProduct);
      expect(repoSpy).toBeCalledWith({ id: 1 });
    });
  });

  describe("update()", () => {
    it("should update a product successfully", async () => {
      const updateProductDto = {
        name: "updated car",
        price: 20,
      };

      const existingProduct = {
        id: 1,
        name: "car 1",
        category: "cars",
        price: 10,
        date: new Date(),
        deleted: false,
      };

      const updatedProduct = {
        ...existingProduct,
        ...updateProductDto,
      };

      jest.spyOn(repository, "findOneBy").mockResolvedValue(existingProduct);
      jest.spyOn(repository, "save").mockResolvedValue(updatedProduct);

      const result = await service.update(1, updateProductDto);

      expect(jest.spyOn(repository, "findOneBy")).toHaveBeenCalledWith({
        id: 1,
      });
      expect(jest.spyOn(repository, "save")).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 1,
          name: "updated car",
          category: "cars",
          price: 20,
        }),
      );
      expect(result).toEqual(updatedProduct);
    });

    it("should throw NotFoundException if product does not exist", async () => {
      jest.spyOn(repository, "findOneBy").mockResolvedValue(null);

      await expect(service.update(999, { name: "test" })).rejects.toThrow();
    });
  });

  describe("remove()", () => {
    it("should mark a product as deleted", async () => {
      const mockProduct = {
        id: 2,
        name: "Product to delete",
        category: "test",
        price: 15,
        date: new Date(),
        deleted: false,
      };

      const findOneBySpy = jest
        .spyOn(repository, "findOneBy")
        .mockResolvedValue(mockProduct);
      const saveSpy = jest.spyOn(repository, "save");

      await service.remove("2");

      expect(findOneBySpy).toHaveBeenCalledWith({ id: 2 });
      expect(saveSpy).toHaveBeenCalledWith({
        ...mockProduct,
        deleted: true,
      });
    });

    it("should do nothing if product is not found", async () => {
      const findOneBySpy = jest
        .spyOn(repository, "findOneBy")
        .mockResolvedValue(null);
      const saveSpy = jest.spyOn(repository, "save");

      await service.remove("999");

      expect(findOneBySpy).toHaveBeenCalledWith({ id: 999 });
      expect(saveSpy).not.toHaveBeenCalled();
    });
  });
});
