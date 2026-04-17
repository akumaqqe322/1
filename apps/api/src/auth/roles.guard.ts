import { Injectable, CanActivate, ExecutionContext, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';
import { DomainException, ErrorCode } from '../common/exceptions/domain-exception';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // If no roles are required, we still want to resolve the user if the header is present
      // but we don't block access if it's missing or invalid
      const request = context.switchToHttp().getRequest();
      const rawUserId = request.headers['x-user-id'];
      const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
      
      if (userId) {
        try {
          const user = await this.prisma.user.findFirst({
            where: userId.includes('@') ? { email: userId } : { id: userId },
            include: { role: true },
          });
          if (user) {
            request.user = user;
          }
        } catch (e) {
          // Ignore errors for optional user resolution
        }
      }
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const rawUserId = request.headers['x-user-id'];
    const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;

    if (!userId) {
      throw new DomainException(
        'User ID header (x-user-id) is missing',
        ErrorCode.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED
      );
    }

    // Support both UUID and email for mock auth stability
    const user = await this.prisma.user.findFirst({
      where: userId.includes('@') ? { email: userId } : { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new DomainException(
        `Identity verification failed: User not found (${userId})`,
        ErrorCode.UNAUTHORIZED,
        HttpStatus.UNAUTHORIZED
      );
    }

    // Attach user to request for use in controllers if needed
    request.user = user;

    if (!user.role || !user.role.code) {
      throw new DomainException(
        'Access denied: User has no assigned role',
        ErrorCode.FORBIDDEN_ACTION,
        HttpStatus.FORBIDDEN
      );
    }

    const hasRole = requiredRoles.includes(user.role.code);
    if (!hasRole) {
      throw new DomainException(
        `Access denied: Insufficient permissions. Required: [${requiredRoles.join(', ')}], Current: ${user.role.code}`,
        ErrorCode.FORBIDDEN_ACTION,
        HttpStatus.FORBIDDEN
      );
    }

    return true;
  }
}
