import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type CouponDocument = HydratedDocument<Coupon>;

@Schema(schemaOptions('coupons'))
export class Coupon {
  @Prop({ type: String, required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ type: Number, default: 0, min: 0, max: 100 })
  percentOff: number;

  @Prop({ type: Number, default: 0 })
  amountOffKobo: number;

  @Prop({ type: String, default: 'once', enum: ['once', 'repeating', 'forever'] })
  duration: 'once' | 'repeating' | 'forever';

  @Prop({ type: Number, default: 1 })
  durationMonths: number;

  @Prop({ type: Number, default: null })
  maxRedemptions: number | null;

  @Prop({ type: Number, default: 0 })
  redeemedCount: number;

  @Prop({ type: Date, default: null })
  expiresAt: Date | null;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: String, default: null })
  grantedToBusinessId: string | null;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
