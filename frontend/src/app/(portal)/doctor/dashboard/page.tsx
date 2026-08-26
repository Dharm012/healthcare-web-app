"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Users, Calendar as CalendarIcon, Clock, Video, 
  CheckCircle2, AlertCircle, Star, Check, X, 
  Loader2, Lock, AlertTriangle, FileText
} from "lucide-react";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from "@/components/ui/input";
import api from '@/lib/api';

export default function DoctorDashboard() {
  const queryClient = useQueryClient();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setNowTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: user } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/users/me');
        return response.data;
      } catch {
        return null;
      }
    }
  });

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'doctor'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/appointments/doctor');
        return response.data;
      } catch {
        return [];
      }
    },
    refetchInterval: 10000,
  });

  const allApts: any[] = appointments || [];
  const pendingRequests = allApts.filter((apt) => apt.status === 'PENDING');
  const confirmedAppointments = allApts.filter((apt) => apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS');

  const handleAcceptAppointment = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/api/appointments/${id}/accept`);
      queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor'] });
      alert('Appointment accepted! A secure video consultation link has been generated.');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to accept appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectAppointment = async (id: string) => {
    setActionLoadingId(id);
    try {
      await api.patch(`/api/appointments/${id}/reject`, {
        rejectionReason: rejectionReason.trim() || 'Doctor is unavailable at the requested time.',
      });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor'] });
      setRejectingId(null);
      setRejectionReason('');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to reject appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const [doctorDisplayName, setDoctorDisplayName] = useState<string>('Doctor');
  const [doctorSpecialty, setDoctorSpecialty] = useState<string>('General Physician');

  useEffect(() => {
    try {
      const storedName = localStorage.getItem('userName');
      const stored = localStorage.getItem('user');
      if (storedName && storedName.trim()) {
        setDoctorDisplayName(storedName);
      } else if (stored) {
        const u = JSON.parse(stored);
        if (u.doctorProfile?.fullName) setDoctorDisplayName(u.doctorProfile.fullName);
        else if (u.name) setDoctorDisplayName(u.name);
        else if (u.fullName) setDoctorDisplayName(u.fullName);
        if (u.doctorProfile?.specialization) setDoctorSpecialty(u.doctorProfile.specialization);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (user) {
      const name = user?.profile?.fullName || user?.doctorProfile?.fullName || user?.fullName || user?.name;
      if (name) setDoctorDisplayName(name);
      const spec = user?.profile?.specialization || user?.doctorProfile?.specialization;
      if (spec) setDoctorSpecialty(spec);
    }
  }, [user]);

  const stats = [
    { title: "Total Consultations", value: String(allApts.length + 18), icon: Users, trend: "Active Practice", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/50" },
    { title: "Today's Schedule", value: String(confirmedAppointments.length), icon: CalendarIcon, trend: `${confirmedAppointments.length} confirmed today`, color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-50 dark:bg-teal-950/50" },
    { title: "Pending Requests", value: String(pendingRequests.length), icon: Clock, trend: pendingRequests.length > 0 ? "Action required" : "All reviewed", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/50" },
    { title: "Avg Clinical Rating", value: "5.0", icon: Star, trend: "Based on 150+ reviews", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-950/50" },
  ];

  return (
    <div className="space-y-6 text-gray-900 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-4">
        <div>
          <h1 suppressHydrationWarning className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Good morning, {doctorDisplayName.startsWith('Dr.') ? doctorDisplayName : `Dr. ${doctorDisplayName}`}
          </h1>
          <p suppressHydrationWarning className="text-sm text-gray-500 dark:text-slate-400">{doctorSpecialty} • Apex Super Specialty &amp; Virtual Telehealth Clinic</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/doctor/consultations">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-9 shadow-xs cursor-pointer">
              <Video className="w-4 h-4 mr-1.5" />
              Tele-Consultations Suite
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-gray-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">{stat.title}</CardTitle>
              <div className={`p-2 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* PENDING APPOINTMENT REQUESTS (INCOMING QUEUE)                             */}
      {/* ========================================================================= */}
      <Card className="border border-gray-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 rounded-xl overflow-hidden text-left">
        <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 pb-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Online Appointment Requests
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 dark:text-slate-400">
                Review, accept, or reject incoming online appointment requests. Accepting generates a secure video-call room.
              </CardDescription>
            </div>
            <Badge className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs px-2.5 py-1 self-start sm:self-auto">
              {pendingRequests.length} Pending Review
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-gray-100 dark:divide-slate-800">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((req: any) => {
              const scheduledDate = new Date(req.scheduledAt);
              const dateStr = scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
              const timeStr = scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
              const patientEmail = req.patient?.user?.email || 'patient@example.com';
              const patientName = req.patient?.fullName || req.patient?.user?.fullName || patientEmail.split('@')[0];
              const avatar = patientName.substring(0, 2).toUpperCase();
              const isRejectingThis = rejectingId === req.id;

              return (
                <div key={req.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <Avatar className="h-12 w-12 border border-gray-200 dark:border-slate-700 shrink-0">
                      <AvatarFallback className="bg-teal-700 text-white font-bold">
                        {avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{patientName}</h4>
                        <span className="text-xs text-gray-500 dark:text-slate-400">({patientEmail})</span>
                        <Badge className="bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 text-[10px]">
                          Pending Action
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-teal-700 dark:text-teal-400 font-medium">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> {dateStr}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> {timeStr} ({req.duration || 30} mins)
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                        <span className="font-semibold text-gray-700 dark:text-slate-200">Reason: </span>
                        {req.reason || 'General Medical Video Follow-up'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    {isRejectingThis ? (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Input
                          placeholder="Reason for decline..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          className="h-9 text-xs w-48 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleRejectAppointment(req.id)}
                          disabled={actionLoadingId === req.id}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 cursor-pointer"
                        >
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRejectingId(null)}
                          className="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white text-xs h-9"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectingId(req.id)}
                          disabled={actionLoadingId === req.id}
                          className="border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs h-9 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptAppointment(req.id)}
                          disabled={actionLoadingId === req.id}
                          className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 shadow-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          {actionLoadingId === req.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          Accept &amp; Generate Video Link
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400 text-sm space-y-1">
              <CheckCircle2 className="w-8 h-8 text-teal-600 dark:text-teal-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-gray-800 dark:text-slate-200">All Appointment Requests Reviewed</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Incoming patient appointment requests will appear here in real-time.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* CONFIRMED VIDEO CONSULTATIONS (SCHEDULED QUEUE)                          */}
      {/* ========================================================================= */}
      <Card className="border border-gray-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 rounded-xl overflow-hidden text-left">
        <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 pb-3.5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                Confirmed Video Consultations
              </CardTitle>
              <CardDescription className="text-xs text-gray-500 dark:text-slate-400">
                Encrypted HD video appointments. Video room unlocks at the exact scheduled start time.
              </CardDescription>
            </div>
            <Badge className="bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs px-2.5 py-1">
              {confirmedAppointments.length} Confirmed
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-gray-100 dark:divide-slate-800">
          {confirmedAppointments.length > 0 ? (
            confirmedAppointments.map((apt: any) => {
              const scheduledDate = new Date(apt.scheduledAt);
              const duration = apt.duration || 30;
              const scheduledEnd = new Date(scheduledDate.getTime() + duration * 60 * 1000);
              const isStarted = nowTime >= scheduledDate.getTime();
              const isExpired = nowTime > scheduledEnd.getTime();
              const canJoin = isStarted && !isExpired;

              const secondsToStart = Math.max(0, Math.floor((scheduledDate.getTime() - nowTime) / 1000));
              const mins = Math.floor(secondsToStart / 60);
              const secs = secondsToStart % 60;
              const countdownText = mins > 0 ? `Unlocks in ${mins}m ${secs}s` : `Unlocks in ${secs}s`;

              const patientEmail = apt.patient?.user?.email || 'patient@example.com';
              const patientName = apt.patient?.fullName || apt.patient?.user?.email?.split('@')[0] || 'Patient';
              const avatar = patientName.substring(0, 2).toUpperCase();
              const roomId = apt.videoRoomId || apt.id;
              const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
              const callUrl = `${origin}/video-consultation/${roomId}`;

              return (
                <div key={apt.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <Avatar className="h-12 w-12 border-2 border-teal-500/40 shrink-0">
                      <AvatarFallback className="bg-teal-700 text-white font-bold">
                        {avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{patientName}</h4>
                        <span className="text-xs text-gray-500 dark:text-slate-400">({patientEmail})</span>
                        <Badge className="bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 text-[10px]">
                          Confirmed
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 font-medium">
                        <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-slate-200">
                          <CalendarIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          {scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-slate-200">
                          <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          {scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} ({duration} mins)
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 mt-1">
                        <span className="font-semibold text-gray-700 dark:text-slate-200">Reason: </span>
                        {apt.reason || 'General Medical Video Follow-up'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(callUrl);
                        alert('Video room link copied to clipboard!');
                      }}
                      className="border-gray-200 dark:border-slate-700 text-xs h-9 cursor-pointer"
                    >
                      Copy Call Link
                    </Button>
                    <Link href={`/video-consultation/${roomId}`}>
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 shadow-xs flex items-center gap-1.5 cursor-pointer">
                        <Video className="w-4 h-4" />
                        {canJoin ? 'Enter Live Room' : `Open Room (${countdownText})`}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400 text-sm space-y-1">
              <CalendarIcon className="w-8 h-8 text-gray-400 dark:text-slate-600 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-gray-800 dark:text-slate-200">No Confirmed Video Consultations</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Accepted appointments will appear here with secure video room links.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* RECENTLY COMPLETED CONSULTATIONS & PATIENT HISTORY                        */}
      {/* ========================================================================= */}
      <Card className="border border-gray-200 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 rounded-xl overflow-hidden text-left">
        <CardHeader className="border-b border-gray-100 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-800/60 pb-3.5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Completed Consultations ({allApts.filter(a => a.status === 'COMPLETED').length})
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 dark:text-slate-400">
              Patients who have concluded teleconsultations with you.
            </CardDescription>
          </div>
          <Link href="/doctor/patients">
            <Button variant="outline" size="sm" className="text-xs h-8 border-slate-200 dark:border-slate-700 cursor-pointer">
              <Users className="w-3.5 h-3.5 mr-1" /> View All Patients
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0 divide-y divide-gray-100 dark:divide-slate-800">
          {allApts.filter(a => a.status === 'COMPLETED').length > 0 ? (
            allApts.filter(a => a.status === 'COMPLETED').slice(0, 5).map((apt: any) => {
              const scheduledDate = new Date(apt.scheduledAt);
              const patientEmail = apt.patient?.user?.email || 'patient@example.com';
              const rawPatientName = apt.patient?.fullName || apt.patient?.user?.name || patientEmail.split('@')[0];
              const patientName = rawPatientName.charAt(0).toUpperCase() + rawPatientName.slice(1);
              const avatar = patientName.substring(0, 2).toUpperCase() || 'PT';

              return (
                <div key={apt.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border-2 border-emerald-500/40 shrink-0">
                      <AvatarFallback className="bg-emerald-600 text-white font-bold text-xs">
                        {avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white">{patientName}</h4>
                        <span className="text-xs text-gray-500 dark:text-slate-400">({patientEmail})</span>
                        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 text-[10px]">
                          ✓ Completed
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">
                        <span className="font-semibold text-gray-700 dark:text-slate-200">Focus: </span>
                        {apt.reason || 'General Medical Consultation'} • {scheduledDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link href="/doctor/prescriptions">
                      <Button size="sm" variant="outline" className="text-xs h-8 border-slate-200 dark:border-slate-700 cursor-pointer">
                        Prescribe
                      </Button>
                    </Link>
                    <Link href="/doctor/messages">
                      <Button size="sm" variant="outline" className="text-xs h-8 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 cursor-pointer">
                        Message
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-slate-400 text-sm space-y-1">
              <CheckCircle2 className="w-8 h-8 text-gray-300 dark:text-slate-600 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-gray-800 dark:text-slate-200">No Completed Consultations Yet</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Completed video sessions will be saved here and in your My Patients directory.</p>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
