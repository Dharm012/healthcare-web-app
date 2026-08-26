import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('symptom-check')
  async checkSymptoms(@Body('history') history: { role: string; content: string }[]) {
    return this.aiService.analyzeSymptoms(history);
  }

  @Post('verify-doctor-certificate')
  async verifyDoctorCertificate(@Body() body: VerifyCertificateDto) {
    return this.aiService.verifyDoctorCertificate(body);
  }
}
