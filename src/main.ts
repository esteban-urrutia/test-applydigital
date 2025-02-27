import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);

  if ((process.env.TESTMODE || "no").toLocaleLowerCase() === "yes") {
    console.log(
      "\n\n- - - - - - - - TEST MODE ENABLED - - - - - - - -\n\n Fetching every minute for easy testing and from a fixed moment, due that external API stopped returning live data.\n\n",
    );
  }
}
bootstrap();
