import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class RequestLocationChangeDto {
  @IsString()
  @IsNotEmpty()
  childId: string;

  @IsNumber()
  @IsNotEmpty()
  newLatitude: number;

  @IsNumber()
  @IsNotEmpty()
  newLongitude: number;

  @IsString()
  @IsOptional()
  newAddress?: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

export class ReviewLocationChangeDto {
  @IsEnum(['APPROVED', 'REJECTED'])
  @IsNotEmpty()
  status: 'APPROVED' | 'REJECTED';

  @IsString()
  @IsOptional()
  reviewNotes?: string;
}
