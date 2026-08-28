import { IsString, IsOptional, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MedicineItemDto {
  @IsString()
  medicineName: string;

  @IsOptional()
  @IsString()
  medicineType?: string; // TABLET, CAPSULE, SYRUP, INJECTION, CREAM, OTHER

  @IsString()
  dosage: string; // e.g. "500 mg", "1 tablet", "5 ml"

  @IsOptional()
  @IsString()
  route?: string;

  @IsString()
  frequency: string; // "Once daily", "Twice daily", "Three times daily", "Four times daily", "Every X hours", "As needed"

  @IsOptional()
  timing?: string[] | string; // ["08:00 AM", "08:00 PM"] or string

  @IsOptional()
  @IsNumber()
  durationDays?: number; // e.g. 5

  @IsOptional()
  @IsString()
  duration?: string; // e.g. "5 days"

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  instructions?: string; // e.g. "Take after food"
}

export class SavePrescriptionDraftDto {
  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineItemDto)
  medicines: MedicineItemDto[];
}

export class CreateDirectPrescriptionDto {
  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  patientName?: string;

  @IsOptional()
  @IsString()
  patientEmail?: string;

  @IsOptional()
  @IsString()
  diagnosis?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicineItemDto)
  medicines: MedicineItemDto[];
}

export class SkipReminderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
