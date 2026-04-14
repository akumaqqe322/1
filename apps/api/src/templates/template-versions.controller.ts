import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TemplateVersionsService } from './template-versions.service';
import { CreateTemplateVersionDto } from './dto/create-template-version.dto';
import { GeneratePreviewDto } from './dto/generate-preview.dto';
import { GenerateFinalDto } from './dto/generate-final.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/user.decorator';

@Controller('templates/:templateId/versions')
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TemplateVersionsController {
  constructor(private readonly versionsService: TemplateVersionsService) {}

  @Post()
  @Roles('admin', 'lawyer')
  create(
    @Param('templateId') templateId: string,
    @Body() dto: CreateTemplateVersionDto,
    @User() user: any,
  ) {
    return this.versionsService.create(templateId, dto, user.id);
  }

  @Get()
  findAll(@Param('templateId') templateId: string) {
    return this.versionsService.findAll(templateId);
  }

  @Get(':versionId')
  findOne(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
  ) {
    return this.versionsService.findById(templateId, versionId);
  }

  @Post(':versionId/file')
  @Roles('admin', 'lawyer')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }),
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
  generatePreview(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @Body() dto: GeneratePreviewDto,
    @User() user: any,
  ) {
    return this.versionsService.generatePreview(templateId, versionId, dto.caseId, user.id);
  }

  @Post(':versionId/generate')
  @Roles('admin', 'lawyer')
  generateFinal(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @Body() dto: GenerateFinalDto,
    @User() user: any,
  ) {
    return this.versionsService.generateFinal(templateId, versionId, dto.caseId, user.id);
  }

  @Post(':versionId/publish')
  @Roles('admin', 'lawyer')
  publish(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @User() user: any,
  ) {
    return this.versionsService.publish(templateId, versionId, user.id);
  }

  @Post(':versionId/archive')
  @Roles('admin', 'lawyer')
  archive(
    @Param('templateId') templateId: string,
    @Param('versionId') versionId: string,
    @User() user: any,
  ) {
    return this.versionsService.archive(templateId, versionId, user.id);
  }
}
