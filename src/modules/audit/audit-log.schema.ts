import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { schemaOptions } from '../../common/schemas/schema-options';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema(schemaOptions('audit_logs'))
export class AuditLog {
  createdAt: Date;
  updatedAt: Date;
  @Prop({ type: String, default: null, index: true })
  businessId: string | null;

  @Prop({ type: String, default: null, index: true })
  actorId: string | null;

  @Prop({ type: String, default: 'system' })
  actorType: string;

  @Prop({ type: String, required: true, index: true })
  action: string;

  @Prop({ type: String, default: null })
  entity: string | null;

  @Prop({ type: String, default: null })
  entityId: string | null;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, unknown>;

  @Prop({ type: String, default: null })
  ip: string | null;

  @Prop({ type: String, default: null })
  userAgent: string | null;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
