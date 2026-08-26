import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordType } from '@prisma/client';

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

  async uploadRecord(userId: string, data: any) {
    const patientProfile = await this.prisma.patientProfile.findUnique({
      where: { userId },
    });
    
    if (!patientProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    return this.prisma.medicalRecord.create({
      data: {
        patientId: patientProfile.id,
        type: data.type as RecordType,
        title: data.title,
        description: data.description,
        source: 'UPLOADED',
      },
    });
  }
}
