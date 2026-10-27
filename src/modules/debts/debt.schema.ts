import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type DebtDocument = HydratedDocument<Debt>;
export type DebtStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

@Schema({ _id: false })
export class DebtPayment {
  @Prop({ type: Number, required: true })
  amountKobo: number;

  @Prop({ type: String, default: 'cash' })
  method: string;

  @Prop({ type: String, default: null })
  reference: string | null;

  @Prop({ type: String, default: null })
  note: string | null;

  @Prop({ type: Date, default: () => new Date() })
  paidAt: Date;

  @Prop({ type: String, default: null })
  recordedBy: string | null;

  @Prop({ type: String, default: null })
  paymentId: string | null;
}
export const DebtPaymentSchema = SchemaFactory.createForClass(DebtPayment);

@Schema({ _id: false })
export class DebtReminder {
  @Prop({ type: String, required: true })
  channel: string;

  @Prop({ type: String, default: 'manual' })
  kind: string;

  @Prop({ type: Date, default: () => new Date() })
  sentAt: Date;
}
export const DebtReminderSchema = SchemaFactory.createForClass(DebtReminder);

@Schema(schemaOptions('debts'))
export class Debt {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true, index: true })
  customerId: string;

  @Prop({ type: String, required: true })
  customerName: string;

  @Prop({ type: String, default: null })
  customerPhone: string | null;

  @Prop({ type: String, default: null })
  customerEmail: string | null;

  @Prop({ type: String, default: null, index: true })
  saleId: string | null;

  @Prop({ type: String, default: null })
  orderId: string | null;

  @Prop({ type: Number, required: true })
  principalKobo: number;

  @Prop({ type: Number, default: 0 })
  paidKobo: number;

  @Prop({ type: Number, required: true })
  balanceKobo: number;

  @Prop({ type: Date, required: true, index: true })
  dueDate: Date;

  @Prop({ type: String, enum: ['unpaid', 'partial', 'paid', 'overdue'], default: 'unpaid', index: true })
  status: DebtStatus;

  @Prop({ type: [DebtPaymentSchema], default: [] })
  payments: DebtPayment[];

  @Prop({ type: [DebtReminderSchema], default: [] })
  reminders: DebtReminder[];

  @Prop({ type: Date, default: null })
  lastReminderAt: Date | null;

  @Prop({ type: String, default: '' })
  notes: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  publicToken: string;

  @Prop({ type: String, default: null })
  createdBy: string | null;

  @Prop({ type: Date, default: null })
  settledAt: Date | null;
}

export const DebtSchema = SchemaFactory.createForClass(Debt);
DebtSchema.index({ businessId: 1, status: 1, dueDate: 1 });
DebtSchema.index({ businessId: 1, customerId: 1, createdAt: -1 });
DebtSchema.index({ businessId: 1, balanceKobo: -1 });
