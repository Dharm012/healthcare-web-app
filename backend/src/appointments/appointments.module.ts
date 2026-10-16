import { Module } from '@nestjs/common';
import { AppointmentsController } from './appointments.controller';
import { AppointmentsService } from './appointments.service';
import { ConsultationGateway } from './consultation.gateway';
import { PrescriptionsModule } from '../prescriptions/prescriptions.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrescriptionsModule, AuthModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, ConsultationGateway],
  exports: [AppointmentsService, ConsultationGateway],
})
export class AppointmentsModule {}
