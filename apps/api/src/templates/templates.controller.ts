import { Controller, Get, Post, Body, Patch, Param, Query, UsePipes, ValidationPipe, UseGuards, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiSecurity, ApiParam } from '@nestjs/swagger';
import { TemplatesService } from './templates.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateQueryDto } from './dto/template-query.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../auth/user.decorator';

@ApiTags('Templates')
@ApiSecurity('x-user-id')
@Controller('templates')
@UseGuards(RolesGuard)
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Post()
  @Roles('admin', 'lawyer')
  @ApiOperation({ summary: 'Create a new document template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Insufficient permissions' })
  create(@Body() dto: CreateTemplateDto, @User() user: any) {
    return this.templatesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List all templates with optional filtering' })
  @ApiResponse({ status: 200, description: 'List of templates' })
  findAll(@Query() query: TemplateQueryDto) {
    return this.templatesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get template by ID' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template data' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  findOne(@Param('id') id: string) {
    return this.templatesService.findById(id);
  }

  @Patch(':id')
  @Roles('admin', 'lawyer')
  @ApiOperation({ summary: 'Update an existing template' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateTemplateDto, @User() user: any) {
    return this.templatesService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete a template (Admin only)' })
  @ApiParam({ name: 'id', description: 'Template UUID' })
  @ApiResponse({ status: 200, description: 'Template deleted successfully' })
  delete(@Param('id') id: string, @User() user: any) {
    return this.templatesService.delete(id, user.id);
  }
}
