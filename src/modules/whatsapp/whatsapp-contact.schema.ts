import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type WhatsappContactDocument = HydratedDocument<WhatsappContact>;

@Schema(schemaOptions('whatsapp_contacts'))
export class WhatsappContact {
  @Prop({ type: String, required: true, unique: true, index: true })
  phone: string;

  @Prop({ type: String, default: null, index: true })
  businessId: string | null;

  @Prop({ type: String, default: null })
  userId: string | null;

  @Prop({ type: String, default: null })
  displayName: string | null;

  @Prop({ type: Date, default: null })
  verifiedAt: Date | null;

  @Prop({ type: Date, default: null })
  lastInboundAt: Date | null;

  @Prop({ type: Date, default: null })
  lastOutboundAt: Date | null;

  @Prop({ type: Object, default: null })
  pendingAction: Record<string, unknown> | null;

  @Prop({ type: Object, default: null })
  lastUndo: Record<string, unknown> | null;

  @Prop({ type: Number, default: 0 })
  failedAttempts: number;

  @Prop({ type: Boolean, default: false })
  alertsOptOut: boolean;
}

export const WhatsappContactSchema = SchemaFactory.createForClass(WhatsappContact);
WhatsappContactSchema.index({ businessId: 1, verifiedAt: 1 });
