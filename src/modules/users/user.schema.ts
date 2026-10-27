import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';
import type { PlatformRole } from '../../common/types/auth.types';

export type UserDocument = HydratedDocument<User>;

@Schema(schemaOptions('users'))
export class User {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true, index: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  passwordHash: string;

  @Prop({ type: String, required: true, trim: true })
  name: string;

  @Prop({ type: String, default: null })
  phone: string | null;

  @Prop({ type: String, default: null })
  avatarUrl: string | null;

  @Prop({ type: String, enum: ['super_admin', 'support', null], default: null, index: true })
  platformRole: PlatformRole | null;

  @Prop({ type: Date, default: null })
  emailVerifiedAt: Date | null;

  @Prop({ type: String, select: false, default: null })
  emailVerificationTokenHash: string | null;

  @Prop({ type: Date, select: false, default: null })
  emailVerificationExpiresAt: Date | null;

  @Prop({ type: String, select: false, default: null })
  passwordResetTokenHash: string | null;

  @Prop({ type: Date, select: false, default: null })
  passwordResetExpiresAt: Date | null;

  @Prop({ type: Date, default: null })
  lastLoginAt: Date | null;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: Object, default: { emailReceipts: true, lowStock: true, weeklySummary: true, debtReminders: true } })
  notificationPrefs: Record<string, boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ createdAt: -1 });
