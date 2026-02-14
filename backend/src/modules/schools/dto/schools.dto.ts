import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsEmail, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDriverDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  license: string;
}

export class CreateBusDto {
  @IsString()
  plateNumber: string;

  @IsNumber()
  @Min(1)
  @Max(100)
  capacity: number;
}

export class StopDto {
  @IsString()
  name: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}

export class CreateRouteDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  busId?: string;

  @IsString()
  @IsOptional()
  shift?: string; // "MORNING" or "AFTERNOON"

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  stops: StopDto[];
}

export class CreateScheduledRouteDto {
  @IsString()
  routeId: string;

  @IsString()
  driverId: string;

  @IsString()
  busId: string;

  @IsString()
  scheduledTime: string; // "07:00"

  @IsArray()
  recurringDays: string[]; // ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]

  @IsOptional()
  autoAssignChildren?: boolean;

  @IsOptional()
  effectiveFrom?: Date;

  @IsOptional()
  effectiveUntil?: Date;
}

export class ChildDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  parentPhone?: string;

  @IsNumber()
  @IsOptional()
  daysUntilPayment?: number;

  @IsString()
  @IsOptional()
  routeId?: string;
}

export class BulkOnboardDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChildDto)
  children: ChildDto[];
}

export class UpdateFareDto {
  @IsNumber()
  @Min(0)
  newFare: number;

  @IsString()
  @IsOptional()
  reason?: string;
}