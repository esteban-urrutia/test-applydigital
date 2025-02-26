import { Test, TestingModule } from '@nestjs/testing';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

const createProductDto: CreateProductDto = {
  firstName: 'firstName #1',
  lastName: 'lastName #1',
};

describe('ProductsController', () => {
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
                Promise.resolve({ id: '1', ...product }),
              ),
            findAll: jest.fn().mockResolvedValue([
              {
                firstName: 'firstName #1',
                lastName: 'lastName #1',
              },
              {
                firstName: 'firstName #2',
                lastName: 'lastName #2',
              },
            ]),
            findOne: jest.fn().mockImplementation((id: string) =>
              Promise.resolve({
                firstName: 'firstName #1',
                lastName: 'lastName #1',
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

  it('should be defined', () => {
    expect(productsController).toBeDefined();
  });

  describe('create()', () => {
    it('should create a product', () => {
      productsController.create(createProductDto);
      expect(productsController.create(createProductDto)).resolves.toEqual({
        id: '1',
        ...createProductDto,
      });
      expect(productsService.create).toHaveBeenCalledWith(createProductDto);
    });
  });

  describe('findAll()', () => {
    it('should find all products ', () => {
      productsController.findAll();
      expect(productsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should find a product', () => {
      expect(productsController.findOne(1)).resolves.toEqual({
        firstName: 'firstName #1',
        lastName: 'lastName #1',
        id: 1,
      });
      expect(productsService.findOne).toHaveBeenCalled();
    });
  });

  describe('remove()', () => {
    it('should remove the product', () => {
      productsController.remove('2');
      expect(productsService.remove).toHaveBeenCalled();
    });
  });
});
