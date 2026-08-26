import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { ConsultationGateway } from './consultation.gateway';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, ConsultationGateway],
})
export class AppointmentsModule {}
