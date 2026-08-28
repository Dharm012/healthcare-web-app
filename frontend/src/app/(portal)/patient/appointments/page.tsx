"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, Clock, Video, MapPin, Phone, MessageSquare, Plus, 
  Lock, AlertCircle, CheckCircle2, X, Loader2, AlertTriangle, Info,
  Copy, Check, ExternalLink, Sparkles
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'patient'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/appointments/patient');
        return response.data;
      } catch {
        return [];
      }
    },
    refetchInterval: 5000,
  });

  const allApts: any[] = appointments || [];
  const upcomingApts = allApts.filter(a => a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');
  const pastApts = allApts.filter(a => a.status === 'COMPLETED' || a.status === 'CANCELED' || a.status === 'REJECTED');

  const handleCancelAppointment = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/api/appointments/${id}/cancel`, {
        cancellationReason: cancelReason.trim() || 'Patient canceled appointment.',
      });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });
      setCancelingId(null);
      setCancelReason('');
    } catch (err: any) {
      console.error(err);
      toast.add({ title: 'Error', description: err.response?.data?.message || 'Failed to cancel appointment.', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyCallLink = (roomId: string, aptId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/video-consultation/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(aptId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold text-xs">🟡 Pending Doctor Review</Badge>;
      case 'CONFIRMED':
        return <Badge className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold text-xs">🟢 Accepted &amp; Confirmed</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700 font-bold text-xs animate-pulse">🔵 Call In Progress</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-slate-200 border-gray-200 dark:border-slate-700 font-medium text-xs">✓ Completed</Badge>;
      case 'CANCELED':
        return <Badge className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 font-medium text-xs">✕ Canceled</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 font-medium text-xs">✕ Request Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderAppointmentCard = (apt: any) => {
    const scheduledDate = new Date(apt.scheduledAt);
    const duration = apt.duration || 30;
    const scheduledEnd = new Date(scheduledDate.getTime() + duration * 60 * 1000);
    const isStarted = nowTime >= scheduledDate.getTime();
    const isExpired = nowTime > scheduledEnd.getTime();
    const canJoinNow = (apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS') && isStarted && !isExpired;

    const secondsToStart = Math.max(0, Math.floor((scheduledDate.getTime() - nowTime) / 1000));
    const mins = Math.floor(secondsToStart / 60);
    const secs = secondsToStart % 60;
    const countdownText = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    const doctorEmail = apt.doctor?.user?.email || '';
    const rawDoctorName = apt.doctor?.fullName || doctorEmail.split('@')[0] || 'Doctor';
    const doctorName = rawDoctorName.startsWith('Dr.') ? rawDoctorName : `Dr. ${rawDoctorName}`;
    const avatar = doctorName.replace(/^Dr\.?\s*/i, '').substring(0, 2).toUpperCase() || 'DR';
    const roomId = apt.videoRoomId || apt.id;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const callUrl = `${origin}/video-consultation/${roomId}`;

    const isConfirmed = apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS';

    return (
      <Card 
        key={apt.id} 
        className={`mb-5 border transition-all duration-200 shadow-sm rounded-2xl overflow-hidden text-left ${
          isConfirmed 
            ? 'border-emerald-500/40 dark:border-emerald-500/30 bg-white dark:bg-slate-900 ring-1 ring-emerald-500/20' 
            : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900'
        }`}
      >
        {/* Card Top Header */}
        <CardHeader className={`pb-3 border-b ${isConfirmed ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40' : 'bg-gray-50/70 dark:bg-slate-800/60 border-gray-100 dark:border-slate-800'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border-2 border-teal-500/40 shrink-0 shadow-xs">
                <AvatarFallback className="bg-teal-600 text-white font-bold">
                  {avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {doctorName}
                  <Badge variant="outline" className="text-[10px] text-teal-700 dark:text-teal-400 border-teal-300 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/60">
                    {apt.doctor?.specialization || 'General Physician'}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{doctorEmail || 'Verified Practitioner'}</p>
              </div>
            </div>
            <div>{getStatusBadge(apt.status)}</div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 space-y-4">
          
          {/* Time & Logistics Badges */}
          <div className="flex flex-wrap gap-2.5 text-xs text-gray-600 dark:text-slate-300">
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white">
              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                {scheduledDate.toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 font-semibold text-gray-900 dark:text-white">
              <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                {scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} –{' '}
                {scheduledEnd.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({duration} mins)
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-teal-800 font-semibold">
              <Video className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Encrypted 256-Bit 3D Telehealth Room</span>
            </div>
          </div>

          {/* Reason */}
          <div className="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
            <span className="font-bold text-gray-800 dark:text-slate-200">Consultation Focus: </span>
            {apt.reason || 'Virtual General Health Consultation & Tele-diagnosis'}
          </div>

          {/* ========================================================================= */}
          {/* CONFIRMED APPOINTMENT: DEDICATED VIDEO CALL ACCESS BOX                    */}
          {/* ========================================================================= */}
          {isConfirmed && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-300 dark:border-emerald-500/40 p-4 sm:p-5 rounded-2xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Video className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
                      Doctor Accepted — Live Video Room Ready
                    </h4>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-400">
                      Both you and {doctorName} will connect in this private video room at the scheduled time.
                    </p>
                  </div>
                </div>

                {canJoinNow ? (
                  <Badge className="bg-emerald-600 text-white font-bold text-xs px-2.5 py-1 animate-pulse">
                    🟢 Live Now
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-emerald-500/50 text-emerald-800 dark:text-emerald-300 font-mono text-[11px]">
                    Unlocks in: {countdownText}
                  </Badge>
                )}
              </div>

              {/* Video Call Link Input + Copy Button */}
              <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] font-mono text-gray-700 dark:text-slate-300 truncate flex-1 px-2 select-all">
                  {callUrl}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyCallLink(roomId, apt.id)}
                  className="h-8 text-xs border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedId === apt.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Link
                    </>
                  )}
                </Button>
              </div>

              {/* Time guidance banner */}
              {!isStarted && (
                <div className="flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300/90 font-medium">
                  <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>
                    Your consultation is booked for <strong>{scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</strong>. The server unlocks live audio/video right at the start time.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* COMPLETED CONSULTATION SUCCESS SUMMARY BANNER */}
          {apt.status === 'COMPLETED' && (
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-200 text-xs sm:text-sm">
                    Consultation Concluded Successfully
                  </h4>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                    Both doctor and patient connected. Consultation history and prescribed medicines are archived in your records vault.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href="/patient/records">
                  <Button size="sm" variant="outline" className="border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs h-8 cursor-pointer">
                    View Records
                  </Button>
                </Link>
                <Link href="/patient/prescriptions">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 cursor-pointer">
                    Prescriptions
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Cancellation or Rejection Reason Banner */}
          {(apt.status === 'CANCELED' || apt.status === 'REJECTED') && apt.cancellationReason && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div>
                <span className="font-bold block uppercase text-[10px]">
                  {apt.status === 'REJECTED' ? 'Decline Reason' : 'Cancellation Reason'}
                </span>
                <p className="mt-0.5">{apt.cancellationReason}</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3.5 sm:px-5 sm:py-3.5 bg-gray-50/50 dark:bg-slate-800/40 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-slate-400 font-medium">
            {apt.status === 'PENDING' && 'Waiting for doctor to review and accept'}
            {apt.status === 'CONFIRMED' && (canJoinNow ? '🟢 Live Now — You may join' : `🟡 Scheduled for ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`)}
            {apt.status === 'IN_PROGRESS' && '🔵 Both doctor & patient connected — In Progress'}
            {apt.status === 'COMPLETED' && '✓ Consultation completed successfully'}
            {apt.status === 'CANCELED' && '✕ Consultation canceled'}
            {apt.status === 'REJECTED' && '✕ Appointment request declined'}
          </div>

          <div className="flex items-center gap-2">
            {(apt.status === 'PENDING' || apt.status === 'CONFIRMED') && (
              <>
                {cancelingId !== apt.id ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelingId(apt.id)}
                    className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs h-9 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Cancel
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Reason for cancellation..."
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="h-9 text-xs px-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCancelAppointment(apt.id)}
                      disabled={actionLoadingId === apt.id}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 cursor-pointer"
                    >
                      Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setCancelingId(null)}
                      className="text-xs h-9 text-gray-500 dark:text-slate-400 cursor-pointer"
                    >
                      Dismiss
                    </Button>
                  </div>
                )}
              </>
            )}

            {isConfirmed && (
              <>
                {canJoinNow ? (
                  <Link href={`/video-consultation/${roomId}`}>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      Join Live Video Call Now
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/video-consultation/${roomId}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-teal-500/50 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 text-xs h-9 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Open Video Room ({countdownText})
                    </Button>
                  </Link>
                )}
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-gray-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">My Appointments</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Manage consultations, video rooms, and appointment schedules</p>
        </div>
        <Link href="/doctors">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-10 shadow-xs cursor-pointer">
            <Plus className="w-4 h-4 mr-1.5" />
            Book New Consultation
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-xs mb-6 bg-gray-100 dark:bg-slate-800">
          <TabsTrigger value="upcoming" className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">
            Upcoming ({upcomingApts.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-white">
            Past &amp; Archive ({pastApts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin mx-auto" />
            </div>
          ) : upcomingApts.length > 0 ? (
            upcomingApts.map(renderAppointmentCard)
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400 text-sm space-y-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
              <Calendar className="w-10 h-10 text-teal-600/40 mx-auto" />
              <p className="font-semibold text-gray-800 dark:text-slate-200 text-base">No Upcoming Appointments</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                Select an available slot with your doctor to schedule an HD video consultation.
              </p>
              <Link href="/doctors">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs mt-2 cursor-pointer">
                  Browse Doctors &amp; Book
                </Button>
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin mx-auto" />
            </div>
          ) : pastApts.length > 0 ? (
            pastApts.map(renderAppointmentCard)
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400 text-sm space-y-2 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
              <Clock className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto" />
              <p className="font-semibold text-gray-800 dark:text-slate-200">No Past Appointments Found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
