import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { OutputFormat } from '@prisma/client';

export class GeneratePreviewDto {
  @IsString()
  @IsOptional()
  caseId?: string;

  @IsOptional()
  customVariables?: Record<string, any>;

  @IsEnum(OutputFormat)
  @IsOptional()
  outputFormat?: OutputFormat;
}
