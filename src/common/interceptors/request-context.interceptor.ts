import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import { RequestContextService } from '../context/request-context.service';
import type { AuthenticatedUser } from '../types/auth.types';

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
  constructor(private readonly context: RequestContextService) {}

  intercept(executionContext: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = executionContext.switchToHttp().getRequest<Request & { user?: AuthenticatedUser }>();
    const user = req.user;
    if (!user?.impersonatorId) return next.handle();
    return new Observable((subscriber) =>
      this.context.run({ actorId: user.id, impersonatorId: user.impersonatorId }, () =>
        next.handle().subscribe(subscriber),
      ),
    );
  }
}
