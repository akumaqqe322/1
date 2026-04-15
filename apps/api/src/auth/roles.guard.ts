import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';

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

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];

    if (!userId) {
      throw new UnauthorizedException('User ID header missing');
    }

    // Support both UUID and email for mock auth stability
    const user = await this.prisma.user.findFirst({
      where: userId.includes('@') ? { email: userId } : { id: userId },
      include: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException(`User not found: ${userId}`);
    }

    // Attach user to request for use in controllers if needed
    request.user = user;

    const hasRole = requiredRoles.includes(user.role.code);
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
