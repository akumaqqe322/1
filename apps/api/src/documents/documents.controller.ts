import { Controller, Get, Param, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('documents')
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }
}
