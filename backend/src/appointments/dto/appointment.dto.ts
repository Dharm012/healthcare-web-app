import { IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export enum ConsultationTypeDto {
  IN_PERSON = 'IN_PERSON',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  CHAT = 'CHAT',
}

export class CreateAppointmentDto {
  @IsString()
  @IsNotEmpty()
  doctorId: string;

  @IsISO8601()
  @IsNotEmpty()
  scheduledAt: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsEnum(ConsultationTypeDto)
  consultationType?: ConsultationTypeDto;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class RejectAppointmentDto {
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

export class CancelAppointmentDto {
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
