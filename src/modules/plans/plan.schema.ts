import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type PlanDocument = HydratedDocument<Plan>;

export interface Entitlements {
  productLimit: number | null;
  staffSeats: number;
  customDomain: boolean;
  advancedReports: boolean;
  csvExport: boolean;
  pdfExport: boolean;
  embedWidget: boolean;
  whatsappBot: boolean;
  templates: string[];
  receiptBranding: boolean;
  prioritySupport: boolean;
}

export const FREE_ENTITLEMENTS: Entitlements = {
  productLimit: 25,
  staffSeats: 0,
  customDomain: false,
  advancedReports: false,
  csvExport: false,
  pdfExport: false,
  embedWidget: true,
  whatsappBot: true,
  templates: ['lagos-pop', 'market-bright'],
  receiptBranding: true,
  prioritySupport: false,
};

@Schema(schemaOptions('plans'))
export class Plan {
  @Prop({ type: String, required: true, unique: true, lowercase: true })
  key: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, default: '' })
  description: string;

  @Prop({ type: Number, default: 0 })
  priceMonthlyKobo: number;

  @Prop({ type: Number, default: 0 })
  priceYearlyKobo: number;

  @Prop({ type: String, default: null })
  paystackPlanCodeMonthly: string | null;

  @Prop({ type: String, default: null })
  paystackPlanCodeYearly: string | null;

  @Prop({ type: Object, default: FREE_ENTITLEMENTS })
  entitlements: Entitlements;

  @Prop({ type: Number, default: 14 })
  trialDays: number;

  @Prop({ type: Number, default: 0 })
  trialMilestoneOrders: number;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Boolean, default: false })
  isDefault: boolean;

  @Prop({ type: Boolean, default: false })
  isTrialPlan: boolean;

  @Prop({ type: Number, default: 0 })
  sortOrder: number;

  @Prop({ type: [String], default: [] })
  marketingFeatures: string[];
}

export const PlanSchema = SchemaFactory.createForClass(Plan);
PlanSchema.index({ sortOrder: 1 });
