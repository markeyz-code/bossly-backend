import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';
import type { BusinessRole } from '../../common/types/auth.types';

export type MembershipDocument = HydratedDocument<Membership>;

@Schema(schemaOptions('memberships'))
export class Membership {
  @Prop({ type: String, required: true, index: true })
  businessId: string;

  @Prop({ type: String, required: true, index: true })
  userId: string;

  @Prop({ type: String, enum: ['owner', 'staff'], required: true })
  role: BusinessRole;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ type: String, enum: ['active', 'disabled'], default: 'active' })
  status: 'active' | 'disabled';

  @Prop({ type: String, default: null })
  invitedBy: string | null;

  @Prop({ type: Date, default: () => new Date() })
  joinedAt: Date;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
MembershipSchema.index({ businessId: 1, userId: 1 }, { unique: true });
MembershipSchema.index({ userId: 1, status: 1 });
