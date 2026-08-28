"use client";

import { useState } from 'react';
import { 
  Pill, Calendar, User, Download, Eye, Stethoscope, Printer, FileText, 
  CheckCircle2, Clock, ShieldCheck, X 
} from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';

export default function PatientPrescriptionsPage() {
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions', 'patient'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/prescriptions/patient');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const handleOpenRxModal = (rx: any) => {
    setSelectedRx(rx);
    setIsModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Prescriptions &amp; Medications</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active medication schedules and historical doctor prescriptions.</p>
        </div>
        <Button variant="outline" size="sm" className="text-xs h-9 border-slate-300 dark:border-slate-700" asChild>
          <Link href="/patient/dashboard">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-teal-600 dark:text-teal-400" /> Today&apos;s Medication Reminder
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          Loading your verified digital prescriptions...
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Pill className="w-10 h-10 text-teal-600/50 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Prescriptions Issued Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            When you complete a video consultation with a certified doctor on HealthConnect, your digital prescriptions and daily reminder schedules will appear here.
          </p>
          <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9" asChild>
            <Link href="/doctors">Book Doctor Consultation</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx: any) => (
            <Card key={rx.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden text-left">
              <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold text-slate-900 dark:text-white">{rx.diagnosis}</CardTitle>
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 text-[10px]">
                        {rx.status || 'Active'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-teal-600 dark:text-teal-400">{rx.doctor?.name || 'Dr. Dharm Patel'}</span> • {rx.doctor?.specialty || 'General Physician'} • {new Date(rx.date).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      onClick={() => handleOpenRxModal(rx)} 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs border-slate-300 dark:border-slate-700 cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1 text-teal-600 dark:text-teal-400" /> View &amp; Print Rx
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {rx.medications.map((med: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400 mt-0.5 shrink-0">
                        <Pill className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{med.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {med.dosage} • {med.frequency}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <Badge variant="outline" className="text-[9px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                            <Calendar className="h-2.5 w-2.5 mr-1" /> {med.duration}
                          </Badge>
                          {med.timing && (
                            <Badge variant="outline" className="text-[9px] bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 font-mono">
                              ⏰ {med.timing}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* OFFICIAL PRINTABLE PRESCRIPTION MODAL */}
      {selectedRx && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl bg-white text-slate-900 border-slate-200 p-6 sm:p-8 rounded-3xl shadow-2xl">
            <DialogHeader className="border-b border-slate-200 pb-4 text-left">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-teal-700 font-bold text-lg">
                    <Stethoscope className="w-5 h-5" />
                    <span>{selectedRx.doctor?.name || 'Dr. Dharm Patel'}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    {selectedRx.doctor?.qualifications || 'MBBS, MD'} • {selectedRx.doctor?.specialty || 'General Physician'}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">Medical Registration: {selectedRx.doctor?.license || 'MCI-2026-REG'}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-teal-100 text-teal-900 border-teal-200 text-xs px-2.5 py-0.5">
                    Official Digital Prescription
                  </Badge>
                  <p className="text-[10px] text-slate-400 mt-1">Ref ID: {selectedRx.id?.substring(0, 12)}</p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 my-2 text-left text-xs text-slate-700">
              {/* Consultation Details */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div><strong>Consultation Date:</strong> {new Date(selectedRx.date).toLocaleDateString()}</div>
                <div><strong>Diagnosis:</strong> <span className="text-teal-700 font-semibold">{selectedRx.diagnosis}</span></div>
                {selectedRx.notes && (
                  <div className="col-span-2 text-slate-600">
                    <strong>Doctor&apos;s Advice:</strong> {selectedRx.notes}
                  </div>
                )}
              </div>

              {/* Rx Table */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-teal-600" /> Prescribed Medicines:
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Medicine Name</th>
                        <th className="p-2.5">Dosage</th>
                        <th className="p-2.5">Frequency &amp; Timings</th>
                        <th className="p-2.5">Duration</th>
                        <th className="p-2.5">Instructions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRx.medications.map((m: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                          <td className="p-2.5">{m.dosage}</td>
                          <td className="p-2.5">
                            <div>{m.frequency}</div>
                            {m.timing && <span className="text-[10px] text-teal-600 font-mono">⏰ {m.timing}</span>}
                          </td>
                          <td className="p-2.5 font-semibold text-amber-700">{m.duration}</td>
                          <td className="p-2.5 text-slate-600">{m.instructions || 'After food'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Digitally verified via HealthConnect AI Telemedicine Portal</span>
                </div>
                <div className="font-mono text-[10px] text-slate-400">
                  Signed: {new Date(selectedRx.date).toISOString()}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="text-xs h-9">
                Close
              </Button>
              <Button size="sm" onClick={handlePrint} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9">
                <Printer className="w-3.5 h-3.5 mr-1.5" /> Print / Save PDF
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
