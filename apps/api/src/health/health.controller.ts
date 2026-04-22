import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('System')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and internal services health' })
  @ApiResponse({ status: 200, description: 'System health status' })
  async check() {
    const dbStatus = await this.prisma.$queryRaw`SELECT 1`.then(() => 'up').catch(() => 'down');
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: 'up',
      },
    };
  }
}
