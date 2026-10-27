import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type SupportNoteDocument = HydratedDocument<SupportNote>;

@Schema(schemaOptions('support_notes'))
export class SupportNote {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, enum: ['user', 'business'], required: true, index: true })
  targetType: 'user' | 'business';

  @Prop({ type: String, required: true, index: true })
  targetId: string;

  @Prop({ type: String, required: true })
  authorId: string;

  @Prop({ type: String, required: true })
  authorName: string;

  @Prop({ type: String, required: true, maxlength: 2000 })
  body: string;

  @Prop({ type: Boolean, default: false })
  pinned: boolean;
}

export const SupportNoteSchema = SchemaFactory.createForClass(SupportNote);
SupportNoteSchema.index({ targetType: 1, targetId: 1, pinned: -1, createdAt: -1 });
