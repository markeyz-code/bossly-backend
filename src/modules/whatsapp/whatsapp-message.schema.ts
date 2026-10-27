import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type WhatsappMessageDocument = HydratedDocument<WhatsappMessage>;

@Schema(schemaOptions('whatsapp_messages'))
export class WhatsappMessage {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, default: null, index: true })
  businessId: string | null;

  @Prop({ type: String, required: true, enum: ['inbound', 'outbound'] })
  direction: 'inbound' | 'outbound';

  @Prop({ type: String, required: true, index: true })
  phone: string;

  @Prop({ type: String, default: '' })
  body: string;

  @Prop({ type: String, default: 'text' })
  messageType: string;

  @Prop({ type: String, default: null })
  templateName: string | null;

  @Prop({ type: String, default: undefined, unique: true, sparse: true })
  metaMessageId?: string | null;

  @Prop({ type: String, enum: ['received', 'queued', 'sent', 'delivered', 'read', 'failed', 'skipped'], default: 'queued' })
  status: 'received' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'skipped';

  @Prop({ type: String, default: null })
  error: string | null;

  @Prop({ type: Date, default: null })
  whatsappTimestamp: Date | null;

  @Prop({ type: Date, default: null })
  botProcessedAt: Date | null;
}

export const WhatsappMessageSchema = SchemaFactory.createForClass(WhatsappMessage);
WhatsappMessageSchema.index({ createdAt: -1 });
WhatsappMessageSchema.index({ businessId: 1, createdAt: -1 });
WhatsappMessageSchema.index({ direction: 1, status: 1 });
