import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';
import { IS_RAW_RESPONSE } from '../decorators/auth.decorators';

export interface Envelope<T> {
  success: true;
  data: T;
  requestId?: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Envelope<T> | T> {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<Envelope<T> | T> {
    const raw = this.reflector.getAllAndOverride<boolean>(IS_RAW_RESPONSE, [
      context.getHandler(),
      context.getClass(),
    ]);
    const res = context.switchToHttp().getResponse<Response>();
    if (raw) return next.handle();
    const req = context.switchToHttp().getRequest<{ requestId?: string }>();
    return next.handle().pipe(
      map((data) => {
        if (res.headersSent) return data;
        return { success: true, data: normalizeIds(data) as T, requestId: req.requestId };
      }),
    );
  }
}


/** Give every document a stable `id` and strip Mongo internals — lean or hydrated. */
function normalizeIds(value: unknown, depth = 0): unknown {
  if (depth > 12 || value == null) return value;
  if (value instanceof Date) return value;
  if (Buffer.isBuffer(value)) return value;
  if (Array.isArray(value)) return value.map((item) => normalizeIds(item, depth + 1));
  if (typeof value === 'object') {
    const candidate = value as { toObject?: () => unknown };
    if (typeof candidate.toObject === 'function') {
      return normalizeIds(candidate.toObject(), depth + 1);
    }
    const source = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(source)) {
      if (key === '__v') continue;
      if (key === '_id') continue;
      result[key] = normalizeIds(val, depth + 1);
    }
    if (source._id !== undefined) result.id = String(source._id);
    if (source.id !== undefined) result.id = String(source.id);
    return result;
  }
  return value;
}
