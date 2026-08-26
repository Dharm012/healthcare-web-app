import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MedicalRecordsService } from './medical-records.service';

@Controller('api/medical-records')
@UseGuards(AuthGuard('jwt'))
export class MedicalRecordsController {
  constructor(private readonly recordsService: MedicalRecordsService) {}

  @Get('patient')
  async getPatientRecords(@Request() req: any) {
    return this.recordsService.getPatientRecords(req.user.id);
  }

  @Post('upload')
  async uploadRecord(@Request() req: any, @Body() data: any) {
    return this.recordsService.uploadRecord(req.user.id, data);
  }
}
