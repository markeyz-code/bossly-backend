import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DebtsController } from './debts.controller';
import { DebtsService } from './debts.service';
import { Debt, DebtSchema } from './debt.schema';
import { Customer, CustomerSchema } from '../customers/customer.schema';
import { Sale, SaleSchema } from '../sales/sale.schema';
import { Order, OrderSchema } from '../orders/order.schema';
import { Business, BusinessSchema } from '../businesses/business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Debt.name, schema: DebtSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [DebtsController],
  providers: [DebtsService],
  exports: [DebtsService, MongooseModule],
})
export class DebtsModule {}
