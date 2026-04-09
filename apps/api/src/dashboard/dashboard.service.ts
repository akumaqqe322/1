import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalTemplates,
      activeTemplates,
      archivedTemplates,
      totalDocuments,
      documentStatusBreakdown,
    ] = await Promise.all([
      this.prisma.template.count(),
      this.prisma.template.count({ where: { status: 'ACTIVE' } }),
      this.prisma.template.count({ where: { status: 'ARCHIVED' } }),
      this.prisma.generatedDocument.count(),
      this.prisma.generatedDocument.groupBy({
        by: ['status'],
        _count: true,
      }),
    ]);

    const statusMap = documentStatusBreakdown.reduce((acc, curr) => {
      acc[curr.status] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    return {
      templates: {
        total: totalTemplates,
        active: activeTemplates,
        archived: archivedTemplates,
      },
      documents: {
        total: totalDocuments,
        queued: statusMap['QUEUED'] || 0,
        processing: statusMap['PROCESSING'] || 0,
        completed: statusMap['COMPLETED'] || 0,
        failed: statusMap['FAILED'] || 0,
      },
    };
  }
}
