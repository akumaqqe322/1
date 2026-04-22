import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplateVersionsService } from './template-versions.service';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto';
import { GeneratePreviewDto } from './dto/generate-preview.dto';
import { GenerateFinalDto } from './dto/generate-final.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/user.decorator';

@ApiTags('Templates')
@ApiSecurity('x-user-id')
@Controller('templates/:templateId/versions')
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TemplateVersionsController {
  constructor(private readonly versionsService: TemplateVersionsService) {}

  @Post()
  @Roles('admin', 'lawyer')
  @ApiOperation({ summary: 'Create a new version for a template' })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiResponse({ status: 201, description: 'Version draft created' })
  create(
    @Param('templateId') templateId: string,
    @Body() dto: CreateTemplateVersionDto,
    @User() user: any,
  ) {
    return this.versionsService.create(templateId, dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all versions of a specific template' })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'List of versions' })
  findAll(@Param('templateId') templateId: string) {
    return this.versionsService.findAll(templateId);
  }

  @Get(':versionId')
  @ApiOperation({ summary: 'Get details of a specific version' })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiParam({ name: 'versionId', description: 'Version UUID' })
  @ApiResponse({ status: 200, description: 'Version details' })
  findOne(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.findById(templateId, versionId);
  }

  @Post(':versionId/file')
  @Roles('admin', 'lawyer')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a DOCX file to a version' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary', description: 'DOCX file' }
      }
    }
  })
  @ApiParam({ name: 'templateId', description: 'Template UUID' })
  @ApiParam({ name: 'versionId', description: 'Version UUID' })
  uploadFile(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /application\/vnd.openxmlformats-officedocument.wordprocessingml.document/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @User() user: any,
  ) {
    return this.versionsService.uploadFile(templateId, versionId, file, user.id);
  }

  @Post(':versionId/preview')
  @Roles('admin', 'lawyer')
  @ApiOperation({ summary: 'Generate a preview document' })
  @ApiResponse({ status: 202, description: 'Preview generation job queued' })
  generatePreview(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @Body() dto: GeneratePreviewDto,
    @User() user: any,
  ) {
    return this.versionsService.generatePreview(templateId, versionId, dto.caseId || null, user.id, dto.outputFormat, dto.customVariables);
  }

  @Post(':versionId/generate')
  @Roles('admin', 'lawyer')
  @ApiOperation({ summary: 'Generate a final document' })
  @ApiResponse({ status: 202, description: 'Document generation job queued' })
  generateFinal(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @Body() dto: GenerateFinalDto,
    @User() user: any,
  ) {
    return this.versionsService.generateFinal(templateId, versionId, dto.caseId || null, user.id, dto.outputFormat, dto.customVariables);
  }

  @Post(':versionId/publish')
  @Roles('admin', 'lawyer')
  @ApiOperation({ summary: 'Publish a version' })
  @ApiResponse({ status: 200, description: 'Version published successfully' })
  publish(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @User() user: any,
  ) {
    return this.versionsService.publish(templateId, versionId, user.id);
  }

  @Post(':versionId/archive')
  @Roles('admin', 'lawyer')
  @ApiOperation({ summary: 'Archive a version' })
  @ApiResponse({ status: 200, description: 'Version archived successfully' })
  archive(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @User() user: any,
  ) {
    return this.versionsService.archive(templateId, versionId, user.id);
  }

  @Get(':versionId/documents')
  @ApiOperation({ summary: 'List all documents generated from this version' })
  @ApiResponse({ status: 200, description: 'List of generation results' })
  findDocuments(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.findDocuments(templateId, versionId);
  }
}
