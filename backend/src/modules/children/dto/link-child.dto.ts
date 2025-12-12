import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class LinkChildDto {
  @IsString()
  @IsNotEmpty()
  uniqueCode: string;

  @IsNumber()
  @IsOptional()
  homeLatitude?: number;

  @IsNumber()
  @IsOptional()
  homeLongitude?: number;

  @IsString()
  @IsOptional()
  homeAddress?: string;
}

export class UpdateChildGradeDto {
  @IsString()
  @IsNotEmpty()
  childId: string;

  @IsString()
  @IsNotEmpty()
  newGrade: string;
}

export class BulkUpdateGradesDto {
  @IsString()
  @IsNotEmpty()
  action: 'PROMOTE' | 'CUSTOM'; // PROMOTE: Move all up one grade, CUSTOM: Specific updates

  children?: UpdateChildGradeDto[]; // For custom updates
  
  @IsString({ each: true })
  @IsOptional()
  repeatedStudentIds?: string[]; // IDs of students who repeated
}
