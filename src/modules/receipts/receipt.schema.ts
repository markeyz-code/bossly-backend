import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';
import { SaleItem, SaleItemSchema } from '../sales/sale.schema';

export type ReceiptDocument = HydratedDocument<Receipt>;

@Schema(schemaOptions('receipts'))
export class Receipt {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true })
  receiptNumber: string;

  @Prop({ type: String, default: null })
  saleId: string | null;

  @Prop({ type: String, default: null })
  orderId: string | null;

  @Prop({ type: String, required: true })
  customerName: string;

  @Prop({ type: String, default: null })
  customerEmail: string | null;

  @Prop({ type: String, default: '' })
  customerPhone: string;

  @Prop({ type: [SaleItemSchema], default: [] })
  items: SaleItem[];

  @Prop({ type: Number, required: true })
  subtotalKobo: number;

  @Prop({ type: Number, default: 0 })
  discountKobo: number;

  @Prop({ type: Number, default: 0 })
  deliveryFeeKobo: number;

  @Prop({ type: Number, required: true })
  totalKobo: number;

  @Prop({ type: Number, required: true })
  amountPaidKobo: number;

  @Prop({ type: String, default: 'paid' })
  paymentMethod: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  publicToken: string;

  @Prop({ type: Date, default: () => new Date() })
  issuedAt: Date;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
ReceiptSchema.index({ businessId: 1, receiptNumber: 1 }, { unique: true });
ReceiptSchema.index({ businessId: 1, issuedAt: -1 });
