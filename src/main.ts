import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("Products API")
    .setDescription("The Products API documentation")
    .setVersion("1.0")
    .addTag("auth")
    .addTag("products")
    .addTag("reports")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);

  if (
    !process.env.TESTMODE ||
    process.env.TESTMODE.toLocaleLowerCase() === "yes"
  ) {
    console.log(
      "\n\n- - - - - - - - TEST MODE ENABLED - - - - - - - -\n\n Fetching every minute for easy testing and from a fixed moment, due that external API stopped returning live data.\n\n",
    );
  }
}
bootstrap();
