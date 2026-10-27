import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { Receipt, ReceiptSchema } from './receipt.schema';
import { Invoice, InvoiceSchema } from './invoice.schema';
import { Sale, SaleSchema } from '../sales/sale.schema';
import { Business, BusinessSchema } from '../businesses/business.schema';
import { Counter, CounterSchema } from '../plans/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Receipt.name, schema: ReceiptSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Business.name, schema: BusinessSchema },
      { name: Counter.name, schema: CounterSchema },
    ]),
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService, MongooseModule],
})
export class ReceiptsModule {}
