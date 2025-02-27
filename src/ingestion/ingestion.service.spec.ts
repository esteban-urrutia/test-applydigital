/* eslint-disable @typescript-eslint/no-unused-vars */
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { IngestionService } from "./ingestion.service";
import { Product } from "../products/product.entity";
import axios from "axios";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("IngestionService", () => {
  let service: IngestionService;
  let productRepository: Repository<Product>;
  let configService: ConfigService;

  // Mock response data that matches ContentfulResponse interface
  const mockApiResponse = {
    data: {
      items: [
        {
          sys: {
            createdAt: "2024-01-23T21:47:08.012Z",
            space: {
              sys: { type: "Link", linkType: "Space", id: "9xs1613l9f7v" },
            },
            id: "4HZHurmc8Ld78PNnI1ReYh",
            type: "Entry",
            updatedAt: "2024-01-23T21:47:08.012Z",
            environment: {
              sys: { id: "master", type: "Link", linkType: "Environment" },
            },
            publishedVersion: 1,
            revision: 1,
            contentType: {
              sys: { type: "Link", linkType: "ContentType", id: "product" },
            },
            locale: "en-US",
          },
          fields: {
            sku: "ZIMPDOPD",
            name: "Apple Mi Watch",
            brand: "Apple",
            model: "Mi Watch",
            category: "Smartwatch",
            color: "Rose Gold",
            price: 1410.29,
            currency: "USD",
            stock: 7,
          },
        },
        {
          sys: {
            createdAt: "2024-01-23T22:15:30.000Z",
            space: {
              sys: { type: "Link", linkType: "Space", id: "9xs1613l9f7v" },
            },
            id: "5GZHurmc8Ld78PNnI1ReTg",
            type: "Entry",
            updatedAt: "2024-01-23T22:15:30.000Z",
            environment: {
              sys: { id: "master", type: "Link", linkType: "Environment" },
            },
            publishedVersion: 1,
            revision: 1,
            contentType: {
              sys: { type: "Link", linkType: "ContentType", id: "product" },
            },
            locale: "en-US",
          },
          fields: {
            sku: "SAMSGLXY",
            name: "Samsung Galaxy Watch",
            brand: "Samsung",
            model: "Galaxy Watch",
            category: "Smartwatch",
            color: "Black",
            price: 899.99,
            currency: "USD",
            stock: 12,
          },
        },
      ],
    },
  };

  // Create mocks for dependencies
  const mockRepository = {
    save: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key) => {
      const config = {
        CONTENTFUL_SPACE_ID: "9xs1613l9f7v",
        CONTENTFUL_ACCESS_TOKEN: "I-ThsT55eE_B3sCUWEQyDT4VqVO3x__20ufuie9usns",
        CONTENTFUL_ENVIRONMENT: "master",
        CONTENTFUL_CONTENT_TYPE: "product",
        CONTENTFUL_URL:
          "https://cdn.contentful.com/spaces/CONTENTFUL_SPACE_ID/environments/CONTENTFUL_ENVIRONMENT/entries?access_token=CONTENTFUL_ACCESS_TOKEN&content_type=CONTENTFUL_CONTENT_TYPE",
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IngestionService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<IngestionService>(IngestionService);
    productRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("fetchAndSaveProducts", () => {
    it("should fetch products from API and save them to the database", async () => {
      // Mock axios.get to return our mock response
      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);

      // Create spy for the saveProductFromContentful method
      const saveProductSpy = jest.spyOn<any, string>(
        service,
        "saveProductFromContentful",
      );

      // Execute the method we're testing
      await service.fetchAndSaveProducts();

      // Check that axios.get was called with the expected URL
      expect(mockedAxios.get.mock.calls[0][0]).toContain(
        "https://cdn.contentful.com/spaces/9xs1613l9f7v/environments/master/entries",
      );

      // Verify saveProductFromContentful was called for each item
      expect(saveProductSpy).toHaveBeenCalledTimes(2);
      expect(saveProductSpy).toHaveBeenCalledWith(
        mockApiResponse.data.items[0],
      );
      expect(saveProductSpy).toHaveBeenCalledWith(
        mockApiResponse.data.items[1],
      );

      // Verify that repository.save was called for each product
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Apple Mi Watch",
          category: "Smartwatch",
          price: 1410.29,
          date: new Date("2024-01-23T21:47:08.012Z"),
        }),
      );
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Samsung Galaxy Watch",
          category: "Smartwatch",
          price: 899.99,
          date: new Date("2024-01-23T22:15:30.000Z"),
        }),
      );
    });

    it("should handle errors when the API call fails", async () => {
      // Mock an API error
      const apiError = new Error("API connection error");
      mockedAxios.get.mockRejectedValueOnce(apiError);

      // Spy on logger.error
      const loggerErrorSpy = jest.spyOn(service["logger"], "error");

      // Execute the method
      await service.fetchAndSaveProducts();

      // Check that error was logged but no exception was thrown
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "Failed to ingest products: API connection error",
        expect.any(String),
      );
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should handle errors when saving products fails", async () => {
      // Mock successful API response but failed save
      mockedAxios.get.mockResolvedValueOnce(mockApiResponse);
      const dbError = new Error("Database error");
      mockRepository.save.mockRejectedValueOnce(dbError);

      // Spy on logger.error
      const loggerErrorSpy = jest.spyOn(service["logger"], "error");

      // Execute the method
      await service.fetchAndSaveProducts();

      // Check that error was logged
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        "Failed to ingest products: Database error",
        expect.any(String),
      );

      // First save attempt should have been made
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("buildContentfulUrl", () => {
    it("should correctly build the Contentful URL from config", () => {
      // Call the private method using type assertion
      const url = (
        service as unknown as { buildContentfulUrl: () => string }
      ).buildContentfulUrl();

      // Verify the URL is built correctly with all placeholders replaced
      expect(url).toBe(
        "https://cdn.contentful.com/spaces/9xs1613l9f7v/environments/master/entries?access_token=I-ThsT55eE_B3sCUWEQyDT4VqVO3x__20ufuie9usns&content_type=product",
      );
    });
  });
});
