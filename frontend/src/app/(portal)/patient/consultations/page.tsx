"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Video, Calendar, Clock, Lock, CheckCircle2, 
  ArrowRight, ShieldCheck, Loader2, Copy, Check, Info 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function PatientConsultationsPage() {
  const [nowTime, setNowTime] = useState<number>(Date.now());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNowTime(Date.now()), 1000);
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
  const activeSessions = allApts.filter(a => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS');

  const copyCallLink = (roomId: string, aptId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/video-consultation/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopiedId(aptId);
    setTimeout(() => setCopiedId(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 sm:p-6 text-gray-900 dark:text-slate-100 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Tele-Consultations</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">Encrypted 1-on-1 WebRTC Video Rooms for Confirmed Appointments</p>
        </div>
        <Link href="/doctors">
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-10 shadow-xs cursor-pointer">
            <Video className="w-4 h-4 mr-1.5" />
            Book Video Consultation
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 text-teal-600 dark:text-teal-400 animate-spin mx-auto" />
          </div>
        ) : activeSessions.length > 0 ? (
          activeSessions.map((apt: any) => {
            const scheduledDate = new Date(apt.scheduledAt);
            const duration = apt.duration || 30;
            const scheduledEnd = new Date(scheduledDate.getTime() + duration * 60 * 1000);
            const isStarted = nowTime >= scheduledDate.getTime();
            const isExpired = nowTime > scheduledEnd.getTime();
            const canJoinNow = isStarted && !isExpired;

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

            return (
              <Card key={apt.id} className="border border-emerald-500/30 bg-white dark:bg-slate-900 shadow-sm rounded-2xl overflow-hidden ring-1 ring-emerald-500/20">
                <CardContent className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <Avatar className="h-12 w-12 border-2 border-teal-500/40 shrink-0">
                        <AvatarFallback className="bg-teal-600 text-white font-bold">{avatar}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-gray-900 dark:text-white">{doctorName}</h4>
                          <Badge className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 text-xs font-bold">
                            🟢 Confirmed Session
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 font-medium">
                          <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-slate-200">
                            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {scheduledDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-gray-800 dark:text-slate-200">
                            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({duration} mins)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {canJoinNow ? (
                        <Link href={`/video-consultation/${roomId}`}>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-5 shadow-sm flex items-center gap-2 cursor-pointer">
                            <Video className="w-4 h-4" />
                            Join Video Call Live
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/video-consultation/${roomId}`}>
                          <Button variant="outline" className="border-teal-500/40 bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300 hover:bg-teal-100 text-xs h-10 px-4 cursor-pointer flex items-center gap-1.5">
                            <Video className="w-4 h-4" />
                            Open Video Room ({countdownText})
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Video Call Link Copy Box */}
                  <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 shrink-0">Call Link:</span>
                      <span className="text-[11px] font-mono text-teal-700 dark:text-teal-300 truncate select-all">{callUrl}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyCallLink(roomId, apt.id)}
                      className="h-7 text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-950/60 shrink-0 cursor-pointer"
                    >
                      {copiedId === apt.id ? (
                        <><Check className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Copied</>
                      ) : (
                        <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="p-12 text-center text-gray-500 dark:text-slate-400 text-sm space-y-3 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
            <Video className="w-10 h-10 text-teal-600/40 mx-auto" />
            <p className="font-semibold text-gray-800 dark:text-slate-200 text-base">No Confirmed Video Calls Active</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
              When a doctor confirms your appointment request, your dedicated 256-bit video consultation room will appear here.
            </p>
            <Link href="/doctors">
              <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs mt-2 cursor-pointer">
                Book Consultation Now
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
