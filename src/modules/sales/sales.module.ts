import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale, SaleSchema } from './sale.schema';
import { Order, OrderSchema } from '../orders/order.schema';
import { Customer, CustomerSchema } from '../customers/customer.schema';
import { Debt, DebtSchema } from '../debts/debt.schema';
import { Business, BusinessSchema } from '../businesses/business.schema';
import { Counter, CounterSchema } from '../plans/counter.schema';
import { StockModule } from '../stock/stock.module';
import { DebtsModule } from '../debts/debts.module';
import { ReceiptsModule } from '../receipts/receipts.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
    StockModule,
    DebtsModule,
    ReceiptsModule,
    NotificationsModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService, MongooseModule],
})
export class SalesModule {}
