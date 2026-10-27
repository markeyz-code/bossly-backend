import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema(schemaOptions('notifications'))
export class Notification {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, default: null })
  userId: string | null;

  @Prop({ type: String, required: true })
  type: string;

  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: String, default: 'info', enum: ['info', 'success', 'warning', 'danger'] })
  tone: 'info' | 'success' | 'warning' | 'danger';

  @Prop({ type: Object, default: {} })
  data: Record<string, unknown>;

  @Prop({ type: [String], default: ['in_app'] })
  channels: string[];

  @Prop({ type: String, default: null })
  dedupeKey: string | null;

  @Prop({ type: Date, default: null })
  readAt: Date | null;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ businessId: 1, createdAt: -1 });
NotificationSchema.index({ businessId: 1, readAt: 1 });
NotificationSchema.index({ businessId: 1, dedupeKey: 1 }, { unique: true, sparse: true });
