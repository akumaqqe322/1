import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateFinalDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;
}
