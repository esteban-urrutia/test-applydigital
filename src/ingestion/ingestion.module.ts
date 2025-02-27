import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { Product } from "../products/product.entity";
import { IngestionService } from "./ingestion.service";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Product]),
    ConfigModule,
  ],
  providers: [IngestionService],
})
export class IngestionModule {}
