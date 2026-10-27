import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema(schemaOptions('subscriptions'))
export class Subscription {
  @Prop({ type: String, required: true, unique: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true, index: true })
  planKey: string;

  @Prop({ type: String, default: null })
  planId: string | null;

  @Prop({
    type: String,
    enum: ['trialing', 'active', 'past_due', 'cancelled', 'expired'],
    default: 'trialing',
    index: true,
  })
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';

  @Prop({ type: Date, default: null })
  trialStartedAt: Date | null;

  @Prop({ type: Date, default: null })
  trialEndsAt: Date | null;

  @Prop({ type: Number, default: 0 })
  trialMilestoneOrders: number;

  @Prop({ type: Date, default: null })
  milestoneReachedAt: Date | null;

  @Prop({ type: Date, default: null })
  currentPeriodStart: Date | null;

  @Prop({ type: Date, default: null })
  currentPeriodEnd: Date | null;

  @Prop({ type: String, default: 'monthly', enum: ['monthly', 'yearly'] })
  billingInterval: 'monthly' | 'yearly';

  @Prop({ type: String, default: null })
  paystackSubscriptionCode: string | null;

  @Prop({ type: String, default: null })
  paystackEmailToken: string | null;

  @Prop({ type: String, default: null })
  billingEmail: string | null;

  @Prop({ type: String, default: null })
  couponCode: string | null;

  @Prop({ type: Number, default: 0 })
  discountPercent: number;

  @Prop({ type: Date, default: null })
  cancelledAt: Date | null;

  @Prop({ type: String, default: null })
  adminNote: string | null;

  @Prop({ type: Number, default: 0 })
  trialExtensions: number;
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
SubscriptionSchema.index({ status: 1, trialEndsAt: 1 });
