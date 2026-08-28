"use client";

import { useState } from 'react';
import { Pill, Plus, Search, User, Calendar, Send } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';

const recentPrescriptions = [
  {
    id: 1, patient: 'John Doe', avatar: 'JD', date: 'Aug 20, 2026',
    diagnosis: 'Hyperlipidemia',
    meds: ['Atorvastatin 20mg - Once daily', 'Omega-3 1000mg - Twice daily'],
    status: 'Active',
  },
  {
    id: 2, patient: 'Arjun Mehta', avatar: 'AM', date: 'Aug 18, 2026',
    diagnosis: 'Atrial Fibrillation',
    meds: ['Rivaroxaban 20mg - Once daily', 'Metoprolol 50mg - Twice daily'],
    status: 'Active',
  },
  {
    id: 3, patient: 'Meera Nair', avatar: 'MN', date: 'Aug 15, 2026',
    diagnosis: 'Chronic Heart Failure',
    meds: ['Sacubitril/Valsartan 50mg - Twice daily', 'Furosemide 40mg - Once daily', 'Spironolactone 25mg - Once daily'],
    status: 'Active',
  },
  {
    id: 4, patient: 'Priya Sharma', avatar: 'PS', date: 'Aug 10, 2026',
    diagnosis: 'Gestational Diabetes',
    meds: ['Metformin 500mg - Twice daily with meals'],
    status: 'Active',
  },
];

export default function DoctorPrescriptionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleComingSoon = () => toast.add({ title: 'Coming Soon', description: 'This feature will be available soon.', type: 'info' });

  const filtered = recentPrescriptions.filter(rx =>
    rx.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Doctor Prescriptions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Issue, sign, and manage digital prescriptions for your patients.</p>
        </div>
        
        <div>
          <Button onClick={() => setIsDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 shadow-xs cursor-pointer">
            <Plus className="h-4 w-4 mr-1.5" /> Write Prescription
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-left">
              <DialogHeader>
                <DialogTitle>Write New Digital Prescription</DialogTitle>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                  Authorized under Medical Council of India (MCI) Digital Health Regulations.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3.5 mt-3 text-left">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Patient Name</Label>
                  <Input placeholder="Search patient (e.g. John Doe)..." className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Clinical Diagnosis</Label>
                  <Input placeholder="e.g., Essential Hypertension (Stage 1)" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Medication &amp; Dosage</Label>
                  <Input placeholder="e.g., Atorvastatin 20mg - 1 tab at bedtime" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Duration &amp; Refills</Label>
                  <Input placeholder="e.g., 3 months (90 tablets)" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-9" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Special Instructions</Label>
                  <textarea
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs min-h-[70px] focus:outline-none focus:border-teal-500"
                    placeholder="Take with water after dinner..."
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="text-xs h-9 border-slate-200 dark:border-slate-700">Cancel</Button>
                  <Button onClick={() => { alert('Prescription sent to patient dashboard successfully!'); setIsDialogOpen(false); }} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9">
                    <Send className="h-4 w-4 mr-1.5" /> Send Prescription
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
        <Input
          placeholder="Search by patient or diagnosis..."
          className="pl-9 h-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.map((rx) => (
          <Card key={rx.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden text-left">
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-11 w-11 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <Pill className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rx.patient}</h4>
                      <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                        {rx.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{rx.diagnosis}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rx.meds.map((m, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[11px] text-slate-400">Issued on {rx.date}</p>
                  <Button onClick={handleComingSoon} size="sm" variant="outline" className="mt-2 text-xs h-8 border-slate-200 dark:border-slate-700">
                    View Full Rx
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
