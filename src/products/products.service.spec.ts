import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductsService } from './products.service';
import { Repository } from 'typeorm';

const productArray = [
  {
    firstName: 'firstName #1',
    lastName: 'lastName #1',
  },
  {
    firstName: 'firstName #2',
    lastName: 'lastName #2',
  },
];

const oneProduct = {
  firstName: 'firstName #1',
  lastName: 'lastName #1',
};

describe('ProductService', () => {
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should successfully insert a product', () => {
      const oneProduct = {
        firstName: 'firstName #1',
        lastName: 'lastName #1',
      };

      expect(
        service.create({
          firstName: 'firstName #1',
          lastName: 'lastName #1',
        }),
      ).resolves.toEqual(oneProduct);
    });
  });

  describe('findAll()', () => {
    it('should return an array of products', async () => {
      const products = await service.findAll();
      expect(products).toEqual(productArray);
    });
  });

  describe('findOne()', () => {
    it('should get a single product', () => {
      const repoSpy = jest.spyOn(repository, 'findOneBy');
      expect(service.findOne(1)).resolves.toEqual(oneProduct);
      expect(repoSpy).toBeCalledWith({ id: 1 });
    });
  });

  describe('remove()', () => {
    it('should call remove with the passed value', async () => {
      const removeSpy = jest.spyOn(repository, 'delete');
      const retVal = await service.remove('2');
      expect(removeSpy).toBeCalledWith('2');
      expect(retVal).toBeUndefined();
    });
  });
});
