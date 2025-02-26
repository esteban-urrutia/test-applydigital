import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { CreateProductDto } from '../../src/products/dto/create-product.dto';
import { ProductsModule } from '../../src/products/products.module';

describe('Products - /products (e2e)', () => {
  const products = {
    id: 1,
    firstName: 'FirstName #1',
    lastName: 'LastName #1',
    isActive: true,
  };

  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('TEST_DB_HOST'),
            port: +configService.get('TEST_DB_PORT'),
            username: configService.get('TEST_DB_USERNAME'),
            password: configService.get('TEST_DB_PASSWORD'),
            database: configService.get('TEST_DB_DATABASE'),
            autoLoadEntities: true,
            synchronize: true,
          }),
        }),
        ProductsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Create [POST /products]', () => {
    return request(app.getHttpServer())
      .post('/products')
      .send(products as CreateProductDto)
      .expect(201)
      .then(({ body }) => {
        expect(body).toEqual(products);
      });
  });

  it('Get all products [GET /products]', () => {
    return request(app.getHttpServer())
      .get('/products')
      .expect(200)
      .then(({ body }) => {
        expect(body).toBeDefined();
      });
  });

  it('Get one product [GET /products/:id]', () => {
    return request(app.getHttpServer())
      .get('/products/2')
      .expect(200)
      .then(({ body }) => {
        expect(body).toBeDefined();
      });
  });

  it('Delete one product [DELETE /products/:id]', () => {
    return request(app.getHttpServer()).delete('/products/1').expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
