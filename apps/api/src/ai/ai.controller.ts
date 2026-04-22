import { Controller, Post, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiBody } from '@nestjs/swagger';
import { ExtractionService } from './extraction.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('AI - Intelligent Assistance')
@ApiSecurity('x-user-id')
@Controller('ai')
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AIController {
  constructor(private readonly extractionService: ExtractionService) {}

  @Post('extract')
  @Roles('admin', 'lawyer')
  @ApiOperation({ summary: 'Extract structured legal entity data from raw text using LLM' })
  @ApiBody({ schema: { type: 'object', properties: { text: { type: 'string', example: 'Plaintiff is John Doe...' } } } })
  @ApiResponse({ status: 200, description: 'Structured JSON representation of extracted entities' })
  extract(@Body('text') text: string) {
    return this.extractionService.extractFromText(text);
  }
}
