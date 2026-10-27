import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type MailLogDocument = HydratedDocument<MailLog>;

@Schema(schemaOptions('mail_logs'))
export class MailLog {
  @Prop({ type: String, default: null, index: true })
  businessId: string | null;

  @Prop({ type: String, required: true })
  to: string;

  @Prop({ type: String, required: true })
  template: string;

  @Prop({ type: String, required: true })
  subject: string;

  @Prop({ type: String, enum: ['sent', 'failed', 'skipped'], default: 'sent' })
  status: 'sent' | 'failed' | 'skipped';

  @Prop({ type: String, default: null })
  providerMessageId: string | null;

  @Prop({ type: String, default: null })
  error: string | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;
}

export const MailLogSchema = SchemaFactory.createForClass(MailLog);
MailLogSchema.index({ createdAt: -1 });
