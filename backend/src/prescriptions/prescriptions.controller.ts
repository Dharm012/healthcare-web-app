import { 
  Controller, Get, Post, Patch, Param, Body, UseGuards, Request 
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrescriptionsService } from './prescriptions.service';
import { 
  SavePrescriptionDraftDto, CreateDirectPrescriptionDto, SkipReminderDto 
} from './dto/prescriptions.dto';

@Controller('api/prescriptions')
@UseGuards(AuthGuard('jwt'))
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  /**
   * Get or initialize prescription draft for a video consultation room
   */
  @Get('room/:roomId')
  getRoomPrescription(@Request() req: any, @Param('roomId') roomId: string) {
    return this.prescriptionsService.getOrCreateDraftForRoom(req.user.id, roomId);
  }

  /**
   * Autosave / update prescription draft for room
   */
  @Post('room/:roomId/save-draft')
  saveRoomDraft(
    @Request() req: any, 
    @Param('roomId') roomId: string, 
    @Body() dto: SavePrescriptionDraftDto
  ) {
    return this.prescriptionsService.saveDraft(req.user.id, roomId, dto);
  }

  /**
   * Finalize prescription in call
   */
  @Post('room/:roomId/finalize')
  finalizeRoomPrescription(@Request() req: any, @Param('roomId') roomId: string) {
    return this.prescriptionsService.finalizePrescription(req.user.id, roomId);
  }

  /**
   * Reopen finalized prescription before call ends
   */
  @Post('room/:roomId/reopen')
  reopenRoomPrescription(@Request() req: any, @Param('roomId') roomId: string) {
    return this.prescriptionsService.reopenPrescription(req.user.id, roomId);
  }

  /**
   * Get today's medication reminders for logged-in Patient
   */
  @Get('patient/reminders/today')
  getPatientTodayReminders(@Request() req: any) {
    return this.prescriptionsService.getPatientTodayReminders(req.user.id);
  }

  /**
   * Get all medication reminders / history for Patient
   */
  @Get('patient/reminders/all')
  getPatientAllReminders(@Request() req: any) {
    return this.prescriptionsService.getPatientAllReminders(req.user.id);
  }

  /**
   * Mark a medicine reminder as TAKEN
   */
  @Patch('reminders/:id/taken')
  markReminderTaken(@Request() req: any, @Param('id') id: string) {
    return this.prescriptionsService.markReminderTaken(req.user.id, id);
  }

  /**
   * Skip a medicine reminder
   */
  @Patch('reminders/:id/skip')
  skipReminder(
    @Request() req: any, 
    @Param('id') id: string, 
    @Body() dto: SkipReminderDto
  ) {
    return this.prescriptionsService.skipReminder(req.user.id, id, dto);
  }

  /**
   * Get all finalized/active prescriptions for logged-in Patient
   */
  @Get('patient')
  getPatientPrescriptions(@Request() req: any) {
    return this.prescriptionsService.getPatientPrescriptions(req.user.id);
  }

  /**
   * Get all issued prescriptions for logged-in Doctor
   */
  @Get('doctor')
  getDoctorPrescriptions(@Request() req: any) {
    return this.prescriptionsService.getDoctorPrescriptions(req.user.id);
  }

  /**
   * Create direct standalone prescription from Doctor dashboard
   */
  @Post('doctor/create')
  createDirectPrescription(@Request() req: any, @Body() dto: CreateDirectPrescriptionDto) {
    return this.prescriptionsService.createDirectPrescription(req.user.id, dto);
  }

  /**
   * Get single prescription by ID
   */
  @Get(':id')
  getPrescriptionById(@Request() req: any, @Param('id') id: string) {
    return this.prescriptionsService.getPrescriptionById(req.user.id, id);
  }
}
