import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { RecordType } from '@prisma/client';

export class UploadRecordDto {
  @IsEnum(RecordType, { message: 'type must be a valid RecordType (DIAGNOSIS, PRESCRIPTION, LAB_RESULT, IMAGING, CLINICAL_NOTE)' })
  @IsNotEmpty()
  type: RecordType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;
}
