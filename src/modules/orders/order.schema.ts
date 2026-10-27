import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';
import { SaleItem, SaleItemSchema } from '../sales/sale.schema';

export type OrderDocument = HydratedDocument<Order>;
export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'delivered' | 'cancelled';
export type OrderSource = 'manual' | 'storefront' | 'whatsapp' | 'paste_chat' | 'embed';

@Schema({ _id: false })
export class OrderHistory {
  @Prop({ type: String, required: true })
  status: string;

  @Prop({ type: Date, default: () => new Date() })
  at: Date;

  @Prop({ type: String, default: null })
  by: string | null;

  @Prop({ type: String, default: '' })
  note: string;
}
export const OrderHistorySchema = SchemaFactory.createForClass(OrderHistory);

@Schema(schemaOptions('orders'))
export class Order {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true })
  orderNumber: string;

  @Prop({ type: String, enum: ['pending', 'confirmed', 'paid', 'delivered', 'cancelled'], default: 'pending', index: true })
  status: OrderStatus;

  @Prop({ type: String, enum: ['manual', 'storefront', 'whatsapp', 'paste_chat', 'embed'], default: 'manual' })
  source: OrderSource;

  @Prop({ type: String, default: null })
  customerId: string | null;

  @Prop({ type: String, required: true })
  customerName: string;

  @Prop({ type: String, required: true })
  customerPhone: string;

  @Prop({ type: String, default: null })
  customerEmail: string | null;

  @Prop({ type: String, default: '' })
  deliveryAddress: string;

  @Prop({ type: String, default: '' })
  deliveryDetails: string;

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

  @Prop({ type: Number, default: 0 })
  amountPaidKobo: number;

  @Prop({ type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid', index: true })
  paymentStatus: 'unpaid' | 'partial' | 'paid';

  @Prop({ type: String, default: 'cash' })
  paymentMethod: string;

  @Prop({ type: String, default: null })
  debtId: string | null;

  @Prop({ type: String, default: null })
  saleId: string | null;

  @Prop({ type: String, default: null })
  receiptId: string | null;

  @Prop({ type: String, default: '' })
  notes: string;

  @Prop({ type: String, default: '' })
  whatsappMessage: string;

  @Prop({ type: Boolean, default: false })
  stockDeducted: boolean;

  @Prop({ type: Boolean, default: false })
  createDebtOnConfirm: boolean;

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({ type: [OrderHistorySchema], default: [] })
  history: OrderHistory[];

  @Prop({ type: String, required: true, unique: true, index: true })
  publicToken: string;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: Date, default: null })
  convertedAt: Date | null;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
OrderSchema.index({ businessId: 1, createdAt: -1 });
OrderSchema.index({ businessId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ businessId: 1, customerId: 1 });
OrderSchema.index({ businessId: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ businessId: 1, customerPhone: 1 });
