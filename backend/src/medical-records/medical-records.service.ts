import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadRecordDto } from './dto/upload-record.dto';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async getPatientRecords(userId: string) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });
    
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.prisma.medicalRecord.findMany({
      where: { patientId: patientProfile.id },
      orderBy: { date: 'desc' },
    });
  }

  async uploadRecord(userId: string, dto: UploadRecordDto) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });
    
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.prisma.medicalRecord.create({
      data: {
        patientId: patientProfile.id,
        type: dto.type,
        title: dto.title.trim(),
        description: dto.description?.trim(),
        source: 'UPLOADED',
      },
    });
  }
}
