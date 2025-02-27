import { Test, TestingModule } from "@nestjs/testing";
import { CreateProductDto } from "./dto/create-product.dto";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";

const createProductDto: CreateProductDto = {
  name: "car 1",
  category: "cars",
  price: 10,
};

describe("ProductsController", () => {
  let productsController: ProductsController;
  let productsService: ProductsService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: ProductsService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation((product: CreateProductDto) =>
                Promise.resolve({ id: "1", ...product }),
              ),
            findAll: jest.fn(),
            findOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                name: "car 1",
                category: "cars",
                price: 10,
                id,
              }),
            ),
            update: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                name: "car 1",
                category: "cars",
                price: 10,
                id,
              }),
            ),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    productsController = app.get<ProductsController>(ProductsController);
    productsService = app.get<ProductsService>(ProductsService);
  });

  it("should be defined", () => {
    expect(productsController).toBeDefined();
  });

  describe("create()", () => {
    it("should create a product", () => {
      const createSpy = jest.spyOn(productsService, "create");

      expect(productsController.create(createProductDto)).resolves.toEqual({
        id: "1",
        ...createProductDto,
      });
      expect(createSpy).toHaveBeenCalledWith(createProductDto);
    });
  });



  describe("findOne()", () => {
    it("should find a product", () => {
      const findOneSpy = jest.spyOn(productsService, "findOne");

      expect(productsController.findOne(1)).resolves.toEqual({
        name: "car 1",
        category: "cars",
        price: 10,
        id: 1,
      });
      expect(findOneSpy).toHaveBeenCalled();
    });
  });

  describe("update()", () => {
    it("should update a product", () => {
      const updateProductDto = {
        name: "car updated",
        category: "cars",
        price: 15,
      };

      // Mock the update method in the service
      const updateSpy = jest
        .spyOn(productsService, "update")
        .mockResolvedValue({
          id: 1,
          name: "car updated",
          category: "cars",
          price: 15,
          date: new Date(),
          deleted: false,
        });

      expect(productsController.update(1, updateProductDto)).resolves.toEqual(
        expect.objectContaining({
          name: "car updated",
          category: "cars",
          price: 15,
        }),
      );

      expect(updateSpy).toHaveBeenCalledWith(1, updateProductDto);
    });
  });

  describe("remove()", () => {
    it("should remove the product", () => {
      const removeSpy = jest.spyOn(productsService, "remove");
      productsController.remove("2");
      expect(removeSpy).toHaveBeenCalledWith("2");
    });
  });
});
