import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from './audit-log.schema';
import { RequestContextService } from '../../common/context/request-context.service';

export interface AuditInput {
  businessId?: string | null;
  actorId?: string | null;
  actorType?: string;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private readonly logs: Model<AuditLogDocument>,
    private readonly requestContext: RequestContextService,
  ) {}

  async record(input: AuditInput): Promise<void> {
    try {
      await this.logs.create({
        businessId: input.businessId ?? null,
        actorId: input.actorId ?? null,
        actorType: input.actorType ?? 'user',
        action: input.action,
        entity: input.entity ?? null,
        entityId: input.entityId ?? null,
        metadata: {
          ...(input.metadata ?? {}),
          ...(this.requestContext.get()?.impersonatorId
            ? { impersonatedBy: this.requestContext.get()?.impersonatorId }
            : {}),
        },
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
      });
    } catch {
      // Audit must never break the user's action. Failures are surfaced by monitoring.
    }
  }
}
