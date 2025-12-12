import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UpdateFareDto {
  @IsNumber()
  @Min(0)
  newFare: number;

  @IsString()
  @IsOptional()
  reason?: string;
}
