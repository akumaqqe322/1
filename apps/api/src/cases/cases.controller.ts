import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CasesService } from './cases.service';
import { DocumentsService } from '../documents/documents.service';
import { RolesGuard } from '../auth/roles.guard';

@Controller('cases')
@UseGuards(RolesGuard)
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Get()
  findAll() {
    return this.casesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.casesService.getCaseData(id);
  }

  @Get(':id/documents')
  findDocuments(@Param('id') id: string) {
    return this.documentsService.findByCaseId(id);
  }

  @Get(':id/context')
  getGenerationContext(@Param('id') id: string) {
    return this.casesService.getGenerationContext(id);
  }
}
