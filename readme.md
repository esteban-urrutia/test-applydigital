# NestJs ApplyDigital esteban-urrutia test

## Description

This is a REST API built with NestJS for managing products.
It includes features for authentication, data ingestion from an external API,
and report generation.

## Features

*   **Authentication:** JWT-based authentication to secure API endpoints. See [`AuthModule`](src/auth/auth.module.ts), [`AuthController`](src/auth/auth.controller.ts), and [`JwtStrategy`](src/auth/jwt.strategy.ts).
*   **Data Ingestion:** Scheduled task to fetch product data from external API using the [`IngestionService`](src/ingestion/ingestion.service.ts).
*   **Product Management:** CRUD operations for products.
*   **Report Generation:** API endpoints for generating reports.
*   **API Documentation:** Interactive API documentation using Swagger, accessible at `/api/docs`.
*   **Containerization:** Dockerfile and docker-compose.yml for easy deployment.

## Requirements

*   Node.js (version 20)
*   npm
*   Docker (optional, for containerized deployment)

## Installation

1.  Install dependencies:

    ```bash
    npm install
    ```

## Running the Application

1.  Start the application:

    ```bash
    npm run start
    ```

2.  Access the API documentation:

    Open your browser and navigate to `http://localhost:3000/api/docs`.

## Running Tests

*   Run unit tests:

    ```bash
    npm run test
    ```

*   Run tests with coverage:

    ```bash
    npm run test:cov
    ```

## Docker Deployment

1.  Run the Dockers containers:

    ```bash
    docker-compose up
    ```

2.  Stop the Dockers containers:

    ```bash
    docker-compose down
    ```


## CI/CD

The project includes a CI/CD pipeline configured with GitHub Actions.
The pipeline performs linting, unit tests, and generates a coverage report.

## Configuration

The application is configured using environment variables. The following variables are available:

*   `TESTMODE`: Enables test mode (fetches data every minute from a fixed moment).
*   `DB_HOST`: Database host.
*   `DB_PORT`: Database port.
*   `DB_USERNAME`: Database username.
*   `DB_PASSWORD`: Database password.
*   `DB_DATABASE`: Database name.
*   `PORT`: Application port.
*   `MAX_ITEMS_PER_PAGE`: Maximum number of items per page in paginated responses.
*   `JWT_SECRET`: Secret key for JWT authentication.
*   `CONTENTFUL_SPACE_ID`: Contentful space ID.
*   `CONTENTFUL_ACCESS_TOKEN`: Contentful access token.
*   `CONTENTFUL_ENVIRONMENT`: Contentful environment.
*   `CONTENTFUL_CONTENT_TYPE`: Contentful content type.
*   `CONTENTFUL_URL`: Contentful API URL.

## API Endpoints

*   `POST /auth/login`: Logs in a user and returns a JWT token.
*   `GET /products`: Retrieves a list of products.
*   `GET /products/:id`: Retrieves a specific product by ID.
*   `POST /products`: Creates a new product.
*   `PUT /products/:id`: Updates an existing product.
*   `DELETE /products/:id`: Deletes a product.
*   `GET /reports/products-by-category`: Generates a report of products grouped by category.

Refer to the Swagger documentation for a complete list of endpoints and their specifications.