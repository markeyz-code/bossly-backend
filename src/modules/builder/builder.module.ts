import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BuilderController } from './builder.controller';
import { BuilderService } from './builder.service';
import { Business, BusinessSchema } from '../businesses/business.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { BusinessesModule } from '../businesses/businesses.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    BusinessesModule,
  ],
  controllers: [BuilderController],
  providers: [BuilderService],
})
export class BuilderModule {}
