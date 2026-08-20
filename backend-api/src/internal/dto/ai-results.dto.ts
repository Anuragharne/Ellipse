import { IsArray, IsNumber, IsString, IsOptional } from 'class-validator';

export class AiResultsDto {
  @IsArray()
  @IsString({ each: true })
  wasteTypes: string[];

  @IsNumber()
  tier: number;

  @IsOptional()
  @IsNumber()
  severityScore?: number;

  @IsOptional()
  @IsString()
  weightVersionId?: string;
}
