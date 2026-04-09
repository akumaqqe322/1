import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    });
  }

  async record(data: {
    entityType: string;
    entityId: string;
    action: string;
    actorId: string;
    metadata?: any;
  }) {
    return this.prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        actorId: data.actorId,
        metadataJson: data.metadata || {},
      },
    });
  }
}
