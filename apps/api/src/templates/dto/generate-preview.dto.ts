import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { OutputFormat } from '@prisma/client';

export class GeneratePreviewDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsEnum(OutputFormat)
  @IsOptional()
  outputFormat?: OutputFormat;
}
