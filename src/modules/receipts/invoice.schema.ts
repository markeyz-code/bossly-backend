import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';
import { SaleItem, SaleItemSchema } from '../sales/sale.schema';

export type InvoiceDocument = HydratedDocument<Invoice>;

@Schema(schemaOptions('invoices'))
export class Invoice {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true })
  invoiceNumber: string;

  @Prop({ type: String, required: true })
  customerName: string;

  @Prop({ type: String, default: null })
  customerEmail: string | null;

  @Prop({ type: String, default: '' })
  customerPhone: string;

  @Prop({ type: String, default: '' })
  customerAddress: string;

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

  @Prop({ type: Date, required: true })
  dueDate: Date;

  @Prop({ type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' })
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

  @Prop({ type: String, default: '' })
  notes: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  publicToken: string;

  @Prop({ type: Date, default: null })
  paidAt: Date | null;

  @Prop({ type: String, default: null })
  paymentId: string | null;

  @Prop({ type: String, default: null })
  createdBy: string | null;
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);
InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
InvoiceSchema.index({ businessId: 1, dueDate: 1 });
