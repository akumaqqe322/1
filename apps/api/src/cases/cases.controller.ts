import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { DocumentsService } from '../documents/documents.service';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('Legal Matters')
@ApiSecurity('x-user-id')
@Controller('cases')
@UseGuards(RolesGuard)
export class CasesController {
  constructor(
    private readonly casesService: CasesService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all legal cases from Project 2.0 source' })
  @ApiResponse({ status: 200, description: 'List of cases' })
  findAll() {
    return this.casesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case details by ID' })
  @ApiParam({ name: 'id', description: 'Internal case ID (e.g., case-123)' })
  @ApiResponse({ status: 200, description: 'Case data' })
  findOne(@Param('id') id: string) {
    return this.casesService.getCaseData(id);
  }

  @Get(':id/documents')
  @ApiOperation({ summary: 'List all documents generated for this case' })
  @ApiParam({ name: 'id', description: 'Internal case ID' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  findDocuments(@Param('id') id: string) {
    return this.documentsService.findByCaseId(id);
  }

  @Get(':id/context')
  @ApiOperation({ summary: 'Get normalized generation context for a case' })
  @ApiParam({ name: 'id', description: 'Internal case ID' })
  @ApiResponse({ status: 200, description: 'Normalized variable context for templates' })
  getGenerationContext(@Param('id') id: string) {
    return this.casesService.getGenerationContext(id);
  }
}
