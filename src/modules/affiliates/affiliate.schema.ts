import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type AffiliateDocument = HydratedDocument<Affiliate>;

@Schema(schemaOptions('affiliates'))
export class Affiliate {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, required: true, unique: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true, unique: true, uppercase: true, trim: true, index: true })
  code: string;

  @Prop({ type: Number, default: 20, min: 1, max: 50 })
  commissionRate: number;

  @Prop({ type: Number, default: 0 })
  referralCount: number;

  @Prop({ type: Number, default: 0 })
  convertedCount: number;

  @Prop({ type: Number, default: 0 })
  totalEarnedKobo: number;

  @Prop({ type: Number, default: 0 })
  pendingKobo: number;

  @Prop({ type: Number, default: 0 })
  availableKobo: number;

  @Prop({ type: Number, default: 0 })
  payoutPendingKobo: number;

  @Prop({ type: Number, default: 0 })
  paidKobo: number;

  @Prop({ type: String, default: null })
  payoutBankName: string | null;

  @Prop({ type: String, default: null })
  payoutAccountName: string | null;

  @Prop({ type: String, default: null })
  payoutAccountNumber: string | null;
}

export const AffiliateSchema = SchemaFactory.createForClass(Affiliate);
AffiliateSchema.index({ createdAt: -1 });
