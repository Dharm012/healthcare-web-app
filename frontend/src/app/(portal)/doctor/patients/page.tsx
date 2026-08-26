"use client";

import React, { useState } from 'react';
import { Search, FileText, Calendar, MessageSquare, User, Loader2, HeartPulse, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function DoctorPatientsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all doctor appointments to build dynamic clinical patient registry
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', 'doctor', 'patients'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/appointments/doctor');
        return res.data || [];
      } catch {
        return [];
      }
    },
    refetchInterval: 10000,
  });

  const allApts: any[] = appointments || [];

  // Group appointments by unique patient
  const patientsMap = new Map<string, any>();

  allApts.forEach(apt => {
    const patientId = apt.patientId || apt.patient?.id || apt.patient?.userId || apt.patient?.user?.email;
    if (!patientId) return;

    const email = apt.patient?.user?.email || 'patient@example.com';
    const rawName = apt.patient?.fullName || apt.patient?.user?.name || email.split('@')[0];
    const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);
    const avatar = name.substring(0, 2).toUpperCase() || 'PT';
    const aptDate = new Date(apt.scheduledAt);

    if (!patientsMap.has(patientId)) {
      patientsMap.set(patientId, {
        id: patientId,
        name,
        email,
        avatar,
        bloodGroup: apt.patient?.bloodGroup ? apt.patient.bloodGroup.replace('_POS', '+').replace('_NEG', '-') : 'O+',
        gender: apt.patient?.gender ? apt.patient.gender.replace('_', ' ') : 'Patient',
        emergencyContact: apt.patient?.emergencyContact || apt.patient?.user?.phone || 'N/A',
        allergies: apt.patient?.allergies || 'None recorded',
        medicalHistory: apt.patient?.medicalHistory || 'Standard clinical history',
        totalAppointments: 1,
        completedAppointments: apt.status === 'COMPLETED' ? 1 : 0,
        lastVisit: aptDate,
        latestReason: apt.reason || 'General Consultation',
        nextAppt: (apt.status === 'CONFIRMED' && aptDate.getTime() > Date.now()) ? aptDate : null,
      });
    } else {
      const existing = patientsMap.get(patientId);
      existing.totalAppointments += 1;
      if (apt.status === 'COMPLETED') existing.completedAppointments += 1;
      if (aptDate > existing.lastVisit) {
        existing.lastVisit = aptDate;
        existing.latestReason = apt.reason || existing.latestReason;
      }
      if (apt.status === 'CONFIRMED' && aptDate.getTime() > Date.now()) {
        if (!existing.nextAppt || aptDate < existing.nextAppt) {
          existing.nextAppt = aptDate;
        }
      }
    }
  });

  const patientsList = Array.from(patientsMap.values());

  const filtered = patientsList.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.latestReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">My Patients</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {patientsList.length} {patientsList.length === 1 ? 'patient' : 'patients'} currently under your clinical care &amp; consultation history.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <Input
          placeholder="Search patients by name, email, or consultation reason..."
          className="pl-9 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Patients List */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Loading patient medical records...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3.5">
          {filtered.map((patient) => (
            <Card key={patient.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-teal-500/50 transition-all rounded-2xl overflow-hidden text-left">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border-2 border-teal-500/40 shrink-0">
                      <AvatarFallback className="bg-teal-600 text-white font-bold text-sm">
                        {patient.avatar}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{patient.name}</h4>
                        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                          {patient.completedAppointments > 0 ? `${patient.completedAppointments} Completed Sessions` : 'Active Patient'}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Email: <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">{patient.email}</span> • Blood Group: <span className="font-bold text-teal-600 dark:text-teal-400">{patient.bloodGroup}</span> • Allergies: <span className="text-slate-700 dark:text-slate-300">{patient.allergies}</span>
                      </p>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Last consultation: <strong>{patient.lastVisit.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</strong> • Focus: <span className="text-slate-700 dark:text-slate-300 italic">{patient.latestReason}</span>
                        {patient.nextAppt && (
                          <> • Next appointment: <span className="text-teal-600 dark:text-teal-400 font-bold">{patient.nextAppt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} at {patient.nextAppt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></>
                        )}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <Link href="/doctor/prescriptions">
                      <Button variant="outline" size="sm" className="h-8 text-xs border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer">
                        <FileText className="h-3.5 w-3.5 mr-1" /> Prescribe
                      </Button>
                    </Link>
                    <Link href="/doctor/messages">
                      <Button variant="outline" size="sm" className="h-8 text-xs border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 cursor-pointer">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" /> Message
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Registered Patients Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Patients who book or complete consultations with you will automatically appear in this registry.</p>
        </div>
      )}

    </div>
  );
}
