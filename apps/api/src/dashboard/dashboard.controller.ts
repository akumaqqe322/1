import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('System')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get high-level system usage statistics' })
  @ApiResponse({ status: 200, description: 'Aggregate counts for templates, documents, and users' })
  getStats() {
    return this.dashboardService.getStats();
  }
}
