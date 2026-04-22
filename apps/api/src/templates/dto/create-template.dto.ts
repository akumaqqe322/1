import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateStatus } from '@prisma/client';

export class CreateTemplateDto {
  @ApiProperty({ example: 'Power of Attorney', description: 'Display name of the template' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'POW-ATT-001', description: 'Unique symbolic code for the template' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Legal', description: 'Broad grouping for the template' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 'POA', description: 'The type of case this template applies to' })
  @IsString()
  @IsNotEmpty()
  caseType: string;

  @ApiPropertyOptional({ enum: TemplateStatus, default: TemplateStatus.ACTIVE })
  @IsEnum(TemplateStatus)
  @IsOptional()
  status?: TemplateStatus;
}
