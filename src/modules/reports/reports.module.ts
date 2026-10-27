import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Sale, SaleSchema } from '../sales/sale.schema';
import { Expense, ExpenseSchema } from '../expenses/expense.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { Debt, DebtSchema } from '../debts/debt.schema';
import { Customer, CustomerSchema } from '../customers/customer.schema';
import { Business, BusinessSchema } from '../businesses/business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sale.name, schema: SaleSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Business.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
