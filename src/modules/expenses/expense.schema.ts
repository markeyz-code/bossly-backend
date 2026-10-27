import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type ExpenseDocument = HydratedDocument<Expense>;
export type ExpenseCategory = 'stock_purchase' | 'transport' | 'data' | 'packaging' | 'rent' | 'ads' | 'other';
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export const EXPENSE_CATEGORIES: { key: ExpenseCategory; label: string }[] = [
  { key: 'stock_purchase', label: 'Stock purchase' },
  { key: 'transport', label: 'Transport' },
  { key: 'data', label: 'Data & airtime' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'rent', label: 'Rent' },
  { key: 'ads', label: 'Ads & promotion' },
  { key: 'other', label: 'Other' },
];

@Schema(schemaOptions('expenses'))
export class Expense {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({
    type: String,
    enum: ['stock_purchase', 'transport', 'data', 'packaging', 'rent', 'ads', 'other'],
    required: true,
  })
  category: ExpenseCategory;

  @Prop({ type: Number, required: true })
  amountKobo: number;

  @Prop({ type: Date, required: true, index: true })
  date: Date;

  @Prop({ type: String, default: '' })
  notes: string;

  @Prop({ type: String, default: null })
  receiptUrl: string | null;

  @Prop({ type: String, enum: ['none', 'daily', 'weekly', 'monthly'], default: 'none' })
  recurrence: Recurrence;

  @Prop({ type: Date, default: null })
  recurrenceEndsAt: Date | null;

  @Prop({ type: Date, default: null })
  nextOccurrenceAt: Date | null;

  @Prop({ type: String, default: null })
  recurringParentId: string | null;

  @Prop({ type: String, default: null })
  createdBy: string | null;

  @Prop({ type: String, default: 'manual' })
  source: string;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
ExpenseSchema.index({ businessId: 1, date: -1 });
ExpenseSchema.index({ businessId: 1, category: 1, date: -1 });
ExpenseSchema.index({ nextOccurrenceAt: 1 }, { sparse: true });
