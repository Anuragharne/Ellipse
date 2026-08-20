import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateComplaintDto {
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  latitude: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  longitude: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  compassHeading?: number;

  @IsOptional()
  @IsString()
  address?: string;
}
