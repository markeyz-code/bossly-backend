import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SummariesController } from './summaries.controller';
import { SummariesService } from './summaries.service';
import { Business, BusinessSchema } from '../businesses/business.schema';
import { Sale, SaleSchema } from '../sales/sale.schema';
import { Expense, ExpenseSchema } from '../expenses/expense.schema';
import { Debt, DebtSchema } from '../debts/debt.schema';
import { Product, ProductSchema } from '../products/product.schema';
import { Membership, MembershipSchema } from '../memberships/membership.schema';
import { User, UserSchema } from '../users/user.schema';
import { WhatsappContact, WhatsappContactSchema } from '../whatsapp/whatsapp-contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Expense.name, schema: ExpenseSchema },
      { name: Debt.name, schema: DebtSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Membership.name, schema: MembershipSchema },
      { name: User.name, schema: UserSchema },
      { name: WhatsappContact.name, schema: WhatsappContactSchema },
    ]),
  ],
  controllers: [SummariesController],
  providers: [SummariesService],
  exports: [SummariesService],
})
export class SummariesModule {}
