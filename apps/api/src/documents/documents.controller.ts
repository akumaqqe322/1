import { Controller, Get, Param, UsePipes, ValidationPipe, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Documents')
@ApiSecurity('x-user-id')
@Controller('documents')
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all generated documents' })
  @ApiResponse({ status: 200, description: 'List of document metadata' })
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata by ID' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 200, description: 'Document metadata' })
  findOne(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get download redirect for document' })
  @ApiParam({ name: 'id', description: 'Document UUID' })
  @ApiResponse({ status: 302, description: 'Redirect to secure download URL' })
  async download(@Param('id') id: string, @Res() res: Response) {
    const url = await this.documentsService.getDownloadUrl(id);
    return res.redirect(url);
  }
}
