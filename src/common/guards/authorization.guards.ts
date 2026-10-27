import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PERMISSIONS_KEY, PLATFORM_ROLES_KEY, ROLES_KEY } from '../decorators/auth.decorators';
import type { AuthenticatedUser } from '../types/auth.types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [ctx.getHandler(), ctx.getClass()]);
    if (!roles?.length) return true;
    const user = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>().user;
    if (!user || !user.role || !roles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to do this.');
    }
    return true;
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required?.length) return true;
    const user = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>().user;
    if (!user || !required.every((p) => user.permissions.includes(p))) {
      throw new ForbiddenException('You do not have permission to do this.');
    }
    return true;
  }
}

@Injectable()
export class PlatformRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(ctx: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(PLATFORM_ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!roles?.length) return true;
    const user = ctx.switchToHttp().getRequest<Request & { user: AuthenticatedUser }>().user;
    if (!user?.platformRole || !roles.includes(user.platformRole)) {
      throw new ForbiddenException('Platform access only.');
    }
    return true;
  }
}
