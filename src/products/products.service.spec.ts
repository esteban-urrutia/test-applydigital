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
    it("should return an array of products", async () => {
      const products = await service.findAll();
      expect(products).toEqual(productArray);
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

      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(repository.save).toHaveBeenCalledWith(
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
    it("should call remove with the passed value", async () => {
      const removeSpy = jest.spyOn(repository, "delete");
      const retVal = await service.remove("2");
      expect(removeSpy).toBeCalledWith("2");
      expect(retVal).toBeUndefined();
    });
  });
});
