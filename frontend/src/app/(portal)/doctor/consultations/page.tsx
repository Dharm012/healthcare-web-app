"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, Calendar, Clock, Lock, CheckCircle2, 
  ArrowRight, ShieldCheck, Loader2, Check, X, Copy,
  AlertTriangle, User, MessageSquare, FileText
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function DoctorConsultationsPage() {
  const queryClient = useQueryClient();
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'doctor'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/appointments/doctor');
        return response.data || [];
      } catch {
        return [];
      }
    },
    refetchInterval: 5000,
  });

  const allApts: any[] = appointments || [];

  // Filter queues
  const pendingRequests = allApts.filter(a => a.status === 'PENDING');
  const confirmedSessions = allApts.filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');
  const completedConsultations = allApts.filter(a => a.status === 'COMPLETED');
  const canceledConsultations = allApts.filter(a => a.status === 'CANCELED' || a.status === 'REJECTED');

  const copyCallLink = (roomId: string, aptId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/video-consultation/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(aptId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const handleAccept = async (id: string) => {
    try {
      setActionLoadingId(id);
      await api.patch(`/api/appointments/${id}/accept`);
      queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor'] });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor', 'patients'] });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to accept appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert('Please state a reason for declining this request.');
      return;
    }
    try {
      setActionLoadingId(id);
      await api.patch(`/api/appointments/${id}/reject`, {
        reason: rejectionReason,
      });
      queryClient.invalidateQueries({ queryKey: ['appointments', 'doctor'] });
      setRejectingId(null);
      setRejectionReason('');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to decline appointment.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tele-Consultations Suite</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage pending appointment requests, live WebRTC video consultations, and completed session history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/doctor/patients">
            <Button variant="outline" className="text-xs h-9 border-slate-200 dark:border-slate-700 cursor-pointer">
              <User className="w-4 h-4 mr-1.5" />
              My Patients
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-5">
        <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
          <TabsTrigger value="upcoming" className="text-xs font-semibold px-4 cursor-pointer">
            Confirmed Video Calls ({confirmedSessions.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-xs font-semibold px-4 cursor-pointer relative">
            Pending Requests ({pendingRequests.length})
            {pendingRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="text-xs font-semibold px-4 cursor-pointer">
            Past &amp; Completed ({completedConsultations.length})
          </TabsTrigger>
        </TabsList>

        {/* 1. CONFIRMED & UPCOMING SESSIONS TAB */}
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
            </div>
          ) : confirmedSessions.length > 0 ? (
            confirmedSessions.map((apt: any) => {
              const scheduledDate = new Date(apt.scheduledAt);
              const duration = apt.duration || 30;
              const scheduledEnd = new Date(scheduledDate.getTime() + duration * 60 * 1000);
              const isStarted = nowTime >= scheduledDate.getTime();
              const isExpired = nowTime > scheduledEnd.getTime();
              const canJoinNow = isStarted && !isExpired;

              const secondsToStart = Math.max(0, Math.floor((scheduledDate.getTime() - nowTime) / 1000));
              const mins = Math.floor(secondsToStart / 60);
              const secs = secondsToStart % 60;
              const countdownText = mins > 0 ? `Unlocks in ${mins}m ${secs}s` : `Unlocks in ${secs}s`;

              const patientEmail = apt.patient?.user?.email || 'patient@example.com';
              const rawPatientName = apt.patient?.fullName || apt.patient?.user?.name || patientEmail.split('@')[0];
              const patientName = rawPatientName.charAt(0).toUpperCase() + rawPatientName.slice(1);
              const roomId = apt.videoRoomId || apt.id;

              return (
                <Card key={apt.id} className="border border-emerald-500/40 dark:border-emerald-500/30 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden text-left">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-teal-500/40 shrink-0">
                        <AvatarFallback className="bg-teal-600 text-white font-bold text-sm">
                          {patientName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{patientName}</h4>
                          <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                            {apt.status === 'IN_PROGRESS' ? '🔵 Call In Progress' : '🟢 Confirmed Video Session'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({duration} mins)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Consultation Focus: </span>
                          {apt.reason || 'General Medical Consultation'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyCallLink(roomId, apt.id)}
                          className="h-9 text-xs border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                        >
                          {copiedId === apt.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" /> Copy Call Link
                            </>
                          )}
                        </Button>

                        {canJoinNow ? (
                          <Link href={`/video-consultation/${roomId}`}>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer">
                              <Video className="w-4 h-4 animate-pulse" />
                              Enter Video Room
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/video-consultation/${roomId}`}>
                            <Button variant="outline" className="border-teal-500/40 text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 text-xs h-9 cursor-pointer">
                              <Lock className="w-3.5 h-3.5 mr-1 text-amber-500" />
                              Video Room ({countdownText})
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Video className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Confirmed Video Calls</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Accept pending patient requests to schedule encrypted teleconsultations.</p>
            </div>
          )}
        </TabsContent>

        {/* 2. PENDING REQUESTS QUEUE TAB */}
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((apt: any) => {
              const scheduledDate = new Date(apt.scheduledAt);
              const patientEmail = apt.patient?.user?.email || 'patient@example.com';
              const rawPatientName = apt.patient?.fullName || apt.patient?.user?.name || patientEmail.split('@')[0];
              const patientName = rawPatientName.charAt(0).toUpperCase() + rawPatientName.slice(1);

              return (
                <Card key={apt.id} className="border border-amber-300 dark:border-amber-700/60 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden text-left">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-amber-400 shrink-0">
                        <AvatarFallback className="bg-amber-600 text-white font-bold text-sm">
                          {patientName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{patientName}</h4>
                          <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800 text-[10px]">
                            🟡 Action Required
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({apt.duration || 30} mins)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Requested Focus: </span>
                          {apt.reason || 'General Consultation'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {rejectingId === apt.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Reason for declining..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="h-9 text-xs px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleReject(apt.id)}
                            disabled={actionLoadingId === apt.id}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 cursor-pointer"
                          >
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setRejectingId(null)}
                            className="text-xs h-9 text-slate-500 cursor-pointer"
                          >
                            Dismiss
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRejectingId(apt.id)}
                            disabled={actionLoadingId === apt.id}
                            className="border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs h-9 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5 mr-1" />
                            Decline
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleAccept(apt.id)}
                            disabled={actionLoadingId === apt.id}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 px-4 shadow-sm flex items-center gap-1.5 cursor-pointer"
                          >
                            {actionLoadingId === apt.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Accept &amp; Generate Video Room
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">All Caught Up</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">No pending appointment requests waiting for review.</p>
            </div>
          )}
        </TabsContent>

        {/* 3. PAST & COMPLETED CONSULTATIONS TAB */}
        <TabsContent value="completed" className="space-y-4">
          {completedConsultations.length > 0 ? (
            completedConsultations.map((apt: any) => {
              const scheduledDate = new Date(apt.scheduledAt);
              const patientEmail = apt.patient?.user?.email || 'patient@example.com';
              const rawPatientName = apt.patient?.fullName || apt.patient?.user?.name || patientEmail.split('@')[0];
              const patientName = rawPatientName.charAt(0).toUpperCase() + rawPatientName.slice(1);

              return (
                <Card key={apt.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden text-left">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12 border-2 border-emerald-500/40 shrink-0">
                        <AvatarFallback className="bg-emerald-700 text-white font-bold text-sm">
                          {patientName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{patientName}</h4>
                          <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 font-bold text-[10px]">
                            ✓ Completed
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({apt.duration || 30} mins)
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Consultation Focus: </span>
                          {apt.reason || 'General Medical Review'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link href="/doctor/prescriptions">
                        <Button size="sm" variant="outline" className="text-xs h-8 border-slate-200 dark:border-slate-700 cursor-pointer">
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Prescriptions
                        </Button>
                      </Link>
                      <Link href="/doctor/messages">
                        <Button size="sm" variant="outline" className="text-xs h-8 border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 cursor-pointer">
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Follow-up Message
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Completed Consultations Yet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">When video consultations conclude, they will be archived here.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

    </div>
  );
}
