import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { VerifyCertificateDto } from './dto/verify-certificate.dto';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('symptom-check')
  async checkSymptoms(@Body('history') history: { role: string; content: string }[]) {
    if (!history || !Array.isArray(history) || history.length === 0) {
      throw new BadRequestException('A valid conversation history array is required.');
    }
    if (history.length > 50) {
      throw new BadRequestException('Conversation history exceeds maximum permitted limit (50 messages).');
    }
    return this.aiService.analyzeSymptoms(history);
  }

  @Post('verify-doctor-certificate')
  async verifyDoctorCertificate(@Body() body: VerifyCertificateDto) {
    return this.aiService.verifyDoctorCertificate(body);
  }
}
