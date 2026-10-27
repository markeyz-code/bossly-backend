import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type ReferralDocument = HydratedDocument<Referral>;

@Schema(schemaOptions('referrals'))
export class Referral {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, required: true, index: true })
  referrerBusinessId: string;

  @Prop({ type: String, required: true, uppercase: true, index: true })
  code: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  referredBusinessId: string;

  @Prop({ type: String, required: true })
  referredBusinessName: string;

  @Prop({ type: String, enum: ['registered', 'converted', 'cancelled'], default: 'registered', index: true })
  status: 'registered' | 'converted' | 'cancelled';

  @Prop({ type: Number, default: 20 })
  commissionRate: number;

  @Prop({ type: Number, default: 0 })
  commissionKobo: number;

  @Prop({ type: String, enum: ['none', 'pending', 'available', 'paid'], default: 'none', index: true })
  commissionStatus: 'none' | 'pending' | 'available' | 'paid';

  @Prop({ type: Date, default: null })
  commissionAvailableAt: Date | null;

  @Prop({ type: Date, default: null })
  convertedAt: Date | null;

  @Prop({ type: Date, default: null })
  commissionReleasedAt: Date | null;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
ReferralSchema.index({ referrerBusinessId: 1, createdAt: -1 });
ReferralSchema.index({ status: 1, commissionStatus: 1, commissionAvailableAt: 1 });
