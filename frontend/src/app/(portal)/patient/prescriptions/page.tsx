"use client";

import { Pill, Calendar, User, Download, Eye } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { toast } from '@/components/ui/toast';

const activePrescriptions = [
  {
    id: 1,
    doctor: 'Dr. Dharm Patel',
    specialty: 'General Physician',
    date: 'Aug 20, 2026',
    diagnosis: 'Hyperlipidemia',
    medications: [
      { name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily at bedtime', duration: '3 months' },
      { name: 'Omega-3 Fatty Acids', dosage: '1000mg', frequency: 'Twice daily with meals', duration: '3 months' },
    ],
  },
  {
    id: 2,
    doctor: 'Dr. Dharm Patel',
    specialty: 'General Physician',
    date: 'Jul 15, 2026',
    diagnosis: 'Essential Hypertension',
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily in the morning', duration: 'Ongoing' },
    ],
  },
];

const pastPrescriptions = [
  {
    id: 3,
    doctor: 'Dr. Jane Smith',
    specialty: 'Cardiologist',
    date: 'Jun 01, 2026',
    diagnosis: 'Upper Respiratory Infection',
    medications: [
      { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '7 days' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', duration: '5 days' },
    ],
  },
  {
    id: 4,
    doctor: 'Dr. Jane Smith',
    specialty: 'Cardiologist',
    date: 'Jan 05, 2026',
    diagnosis: 'Vitamin D Deficiency',
    medications: [
      { name: 'Cholecalciferol (Vitamin D3)', dosage: '60,000 IU', frequency: 'Once weekly', duration: '8 weeks' },
    ],
  },
];

function PrescriptionCard({ rx, showActions = true }: { rx: typeof activePrescriptions[0]; showActions?: boolean }) {
  const handleComingSoon = () => toast.add({ title: 'Coming Soon', description: 'This feature will be available soon.', type: 'info' });

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden text-left">
      <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">{rx.diagnosis}</CardTitle>
            <CardDescription className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-teal-600 dark:text-teal-400">{rx.doctor}</span> • {rx.specialty} • {rx.date}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleComingSoon} variant="outline" size="icon" className="h-8 w-8 border-slate-200 dark:border-slate-700">
              <Eye className="h-4 w-4" />
            </Button>
            <Button onClick={handleComingSoon} variant="outline" size="icon" className="h-8 w-8 border-slate-200 dark:border-slate-700">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {rx.medications.map((med, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="h-9 w-9 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-400 mt-0.5 shrink-0">
                <Pill className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{med.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {med.dosage} • {med.frequency}
                </p>
                <Badge variant="outline" className="mt-1.5 text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                  <Calendar className="h-2.5 w-2.5 mr-1" /> {med.duration}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientPrescriptionsPage() {
  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Prescriptions &amp; Medications</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Active medication schedules and historical doctor prescriptions.</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 mb-4">
          <TabsTrigger value="active" className="text-xs font-semibold">Active Medications ({activePrescriptions.length})</TabsTrigger>
          <TabsTrigger value="past" className="text-xs font-semibold">Past Prescriptions ({pastPrescriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePrescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} rx={rx} />
          ))}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastPrescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} rx={rx} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
