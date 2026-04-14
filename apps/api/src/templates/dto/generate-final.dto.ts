import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { OutputFormat } from '@prisma/client';

export class GenerateFinalDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsEnum(OutputFormat)
  @IsOptional()
  outputFormat?: OutputFormat;
}
