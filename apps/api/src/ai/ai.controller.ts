import { Controller, Post, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ExtractionService } from './extraction.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('ai')
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class AIController {
  constructor(private readonly extractionService: ExtractionService) {}

  @Post('extract')
  @Roles('admin', 'lawyer')
  extract(@Body('text') text: string) {
    return this.extractionService.extractFromText(text);
  }
}
