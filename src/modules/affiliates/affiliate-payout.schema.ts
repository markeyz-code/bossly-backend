import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type AffiliatePayoutDocument = HydratedDocument<AffiliatePayout>;

@Schema(schemaOptions('affiliate_payouts'))
export class AffiliatePayout {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: Number, required: true, min: 1 })
  amountKobo: number;

  @Prop({ type: String, enum: ['requested', 'paid', 'rejected'], default: 'requested', index: true })
  status: 'requested' | 'paid' | 'rejected';

  @Prop({ type: String, required: true })
  bankName: string;

  @Prop({ type: String, required: true })
  accountName: string;

  @Prop({ type: String, required: true })
  accountNumber: string;

  @Prop({ type: String, default: null })
  note: string | null;

  @Prop({ type: String, default: null })
  reference: string | null;

  @Prop({ type: Date, default: null })
  processedAt: Date | null;

  @Prop({ type: String, default: null })
  processedBy: string | null;
}

export const AffiliatePayoutSchema = SchemaFactory.createForClass(AffiliatePayout);
AffiliatePayoutSchema.index({ status: 1, createdAt: -1 });
