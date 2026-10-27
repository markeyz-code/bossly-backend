import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type WebhookEventDocument = HydratedDocument<WebhookEvent>;

@Schema(schemaOptions('webhook_events'))
export class WebhookEvent {
  @Prop({ type: String, required: true, index: true })
  provider: string;

  @Prop({ type: String, required: true })
  eventId: string;

  @Prop({ type: String, required: true })
  eventType: string;

  @Prop({ type: String, enum: ['received', 'processed', 'failed', 'ignored'], default: 'received' })
  status: 'received' | 'processed' | 'failed' | 'ignored';

  @Prop({ type: Number, default: 0 })
  attempts: number;

  @Prop({ type: String, default: null })
  error: string | null;

  @Prop({ type: Object, default: {} })
  payload: Record<string, unknown>;

  @Prop({ type: Date, default: null })
  processedAt: Date | null;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);
WebhookEventSchema.index({ provider: 1, eventId: 1 }, { unique: true });
WebhookEventSchema.index({ status: 1, createdAt: 1 });
