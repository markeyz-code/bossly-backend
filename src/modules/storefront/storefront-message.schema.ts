import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type StorefrontMessageDocument = HydratedDocument<StorefrontMessage>;

@Schema(schemaOptions('storefront_messages'))
export class StorefrontMessage {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String, default: null })
  email: string | null;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Boolean, default: false })
  read: boolean;
}

export const StorefrontMessageSchema = SchemaFactory.createForClass(StorefrontMessage);
StorefrontMessageSchema.index({ businessId: 1, createdAt: -1 });
