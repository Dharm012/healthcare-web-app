import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class VerifyCertificateDto {
  @IsString()
  @IsNotEmpty()
  doctorName: string;

  @IsOptional()
  @IsString()
  certificateImageBase64?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsString()
  certificateText?: string;

  @IsOptional()
  @IsString()
  fileName?: string;
}
