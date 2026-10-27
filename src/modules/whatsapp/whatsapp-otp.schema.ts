import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type WhatsappOtpDocument = HydratedDocument<WhatsappOtp>;

@Schema(schemaOptions('whatsapp_otps'))
export class WhatsappOtp {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, required: true })
  codeHash: string;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @Prop({ type: Number, default: 0 })
  attempts: number;

  @Prop({ type: Date, default: null })
  consumedAt: Date | null;
}

export const WhatsappOtpSchema = SchemaFactory.createForClass(WhatsappOtp);
WhatsappOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
WhatsappOtpSchema.index({ userId: 1, consumedAt: 1 });
