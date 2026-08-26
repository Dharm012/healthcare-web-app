import { 
  Controller, Get, Post, Patch, Param, Body, UseGuards, Request 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppointmentsService } from './appointments.service';
import { 
  CreateAppointmentDto, RejectAppointmentDto, CancelAppointmentDto 
} from './dto/appointment.dto';

@Controller('api/appointments')
@UseGuards(AuthGuard('jwt'))
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * Request a new online appointment (Patient)
   */
  @Post('request')
  createAppointmentRequest(@Request() req: any, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointmentRequest(req.user.id, dto);
  }

  @Post()
  createAppointment(@Request() req: any, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.createAppointmentRequest(req.user.id, dto);
  }

  /**
   * Get appointments for logged-in Patient
   */
  @Get('patient')
  getPatientAppointments(@Request() req: any) {
    return this.appointmentsService.getPatientAppointments(req.user.id);
  }

  /**
   * Get appointments for logged-in Doctor
   */
  @Get('doctor')
  getDoctorAppointments(@Request() req: any) {
    return this.appointmentsService.getDoctorAppointments(req.user.id);
  }

  /**
   * Doctor accepts appointment request & generates unique secure video link
   */
  @Patch(':id/accept')
  acceptAppointment(@Request() req: any, @Param('id') id: string) {
    return this.appointmentsService.acceptAppointment(req.user.id, id);
  }

  /**
   * Doctor declines appointment request with reason
   */
  @Patch(':id/reject')
  rejectAppointment(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() dto: RejectAppointmentDto
  ) {
    return this.appointmentsService.rejectAppointment(req.user.id, id, dto);
  }

  /**
   * Patient or Doctor cancels appointment with reason
   */
  @Patch(':id/cancel')
  cancelAppointment(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() dto: CancelAppointmentDto
  ) {
    return this.appointmentsService.cancelAppointment(req.user.id, id, dto);
  }

  /**
   * Server-Enforced Join & Authorization for Video Room
   */
  @Get('room/:roomId/auth')
  authorizeRoom(@Request() req: any, @Param('roomId') roomId: string) {
    return this.appointmentsService.authorizeAndJoinVideoRoom(req.user.id, roomId);
  }

  @Post('room/:roomId/join')
  joinRoom(@Request() req: any, @Param('roomId') roomId: string) {
    return this.appointmentsService.authorizeAndJoinVideoRoom(req.user.id, roomId);
  }

  /**
   * Conclude Video Consultation
   */
  @Post('room/:roomId/end')
  endConsultation(@Request() req: any, @Param('roomId') roomId: string) {
    return this.appointmentsService.endConsultation(req.user.id, roomId);
  }
}
