"use client";

import { useState } from 'react';
import { 
  Pill, Plus, Search, User, Calendar, Send, Stethoscope, 
  CheckCircle2, Clock, Trash2, Eye, ShieldCheck, X 
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';

interface NewMedItem {
  medicineName: string;
  medicineType: string;
  dosage: string;
  frequency: string;
  timing: string[];
  durationDays: number;
  instructions: string;
}

export default function DoctorPrescriptionsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [selectedRx, setSelectedRx] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Write Form State
  const [patientEmail, setPatientEmail] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [newMeds, setNewMeds] = useState<NewMedItem[]>([
    {
      medicineName: 'Paracetamol 500mg',
      medicineType: 'TABLET',
      dosage: '1 tablet',
      frequency: 'Twice daily',
      timing: ['08:00 AM', '08:00 PM'],
      durationDays: 5,
      instructions: 'Take after food',
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ['prescriptions', 'doctor'],
    queryFn: async () => {
      try {
        const res = await api.get('/api/prescriptions/doctor');
        return res.data;
      } catch {
        return [];
      }
    },
  });

  const handleAddMedRow = () => {
    setNewMeds([
      ...newMeds,
      {
        medicineName: '',
        medicineType: 'TABLET',
        dosage: '1 tablet',
        frequency: 'Twice daily',
        timing: ['08:00 AM', '08:00 PM'],
        durationDays: 5,
        instructions: 'Take after food',
      }
    ]);
  };

  const handleRemoveMedRow = (idx: number) => {
    if (newMeds.length > 1) {
      setNewMeds(newMeds.filter((_, i) => i !== idx));
    }
  };

  const handleMedChange = (idx: number, field: keyof NewMedItem, value: any) => {
    const updated = [...newMeds];
    updated[idx] = { ...updated[idx], [field]: value };
    setNewMeds(updated);
  };

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosis.trim()) {
      toast.add({ title: 'Validation Error', description: 'Clinical diagnosis is required.', type: 'error' });
      return;
    }

    const invalid = newMeds.some(m => !m.medicineName.trim() || !m.dosage.trim());
    if (invalid) {
      toast.add({ title: 'Validation Error', description: 'Please enter medicine name and dosage for all rows.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/api/prescriptions/doctor/create', {
        patientEmail: patientEmail.trim() || undefined,
        diagnosis: diagnosis.trim(),
        notes: clinicalNotes.trim() || undefined,
        medicines: newMeds.map(m => ({
          medicineName: m.medicineName.trim(),
          medicineType: m.medicineType,
          dosage: m.dosage.trim(),
          frequency: m.frequency,
          timing: m.timing,
          durationDays: m.durationDays,
          duration: `${m.durationDays} days`,
          instructions: m.instructions.trim(),
        })),
      });

      queryClient.invalidateQueries({ queryKey: ['prescriptions', 'doctor'] });
      setIsWriteDialogOpen(false);
      setDiagnosis('');
      setClinicalNotes('');
      setPatientEmail('');
      setNewMeds([
        {
          medicineName: 'Paracetamol 500mg',
          medicineType: 'TABLET',
          dosage: '1 tablet',
          frequency: 'Twice daily',
          timing: ['08:00 AM', '08:00 PM'],
          durationDays: 5,
          instructions: 'Take after food',
        }
      ]);

      toast.add({
        title: 'Prescription Issued',
        description: 'Digital prescription sent & medication reminders generated for patient.',
        type: 'success',
      });
    } catch (err: any) {
      toast.add({
        title: 'Failed to Create',
        description: err.response?.data?.message || 'Error creating prescription.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = prescriptions.filter((rx: any) =>
    (rx.patient || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (rx.diagnosis || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Doctor Prescriptions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Issue, sign, and manage digital prescriptions with automatic patient reminder tracking.</p>
        </div>
        
        <div>
          <Button onClick={() => setIsWriteDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 shadow-xs cursor-pointer">
            <Plus className="h-4 w-4 mr-1.5" /> Write Prescription
          </Button>
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

      {isLoading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading prescription archives...</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Pill className="w-10 h-10 text-teal-600/40 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Prescriptions Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prescriptions issued during video consultations or created manually will be archived here with full medication details.
          </p>
          <Button onClick={() => setIsWriteDialogOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9">
            <Plus className="h-4 w-4 mr-1.5" /> Write New Prescription
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((rx: any) => (
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
                          {rx.status || 'Active'}
                        </Badge>
                      </div>
                      <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{rx.diagnosis}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {(rx.medications || []).map((m: any, i: number) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {m.name} ({m.dosage}) — {m.frequency}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[11px] text-slate-400">Issued on {new Date(rx.date).toLocaleDateString()}</p>
                    <Button 
                      onClick={() => {
                        setSelectedRx(rx);
                        setIsViewModalOpen(true);
                      }} 
                      size="sm" 
                      variant="outline" 
                      className="mt-2 text-xs h-8 border-slate-200 dark:border-slate-700 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Full Rx
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* WRITE PRESCRIPTION DIALOG */}
      <Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-left p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" /> Write New Digital Prescription
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Generates digital Rx and automatically creates daily adherence reminders for the patient.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePrescription} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Patient Email (Optional if default)</Label>
                <Input 
                  value={patientEmail} 
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="e.g. patient@example.com" 
                  className="bg-slate-50 dark:bg-slate-800 text-xs h-8"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Clinical Diagnosis *</Label>
                <Input 
                  value={diagnosis} 
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="e.g. Essential Hypertension" 
                  className="bg-slate-50 dark:bg-slate-800 text-xs h-8"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Special Advice / Notes</Label>
              <Input 
                value={clinicalNotes} 
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="e.g. Drink 2L water, low sodium diet" 
                className="bg-slate-50 dark:bg-slate-800 text-xs h-8"
              />
            </div>

            {/* Medicines List */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Prescribed Medications ({newMeds.length})</h4>
                <Button type="button" size="sm" onClick={handleAddMedRow} className="h-7 text-[11px] bg-teal-600 hover:bg-teal-700 text-white">
                  <Plus className="w-3 h-3 mr-1" /> Add Row
                </Button>
              </div>

              {newMeds.map((med, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-600">Medicine #{idx + 1}</span>
                    {newMeds.length > 1 && (
                      <button type="button" onClick={() => handleRemoveMedRow(idx)} className="text-slate-400 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px]">Medicine Name *</Label>
                      <Input 
                        value={med.medicineName} 
                        onChange={(e) => handleMedChange(idx, 'medicineName', e.target.value)}
                        placeholder="e.g. Atorvastatin 20mg" 
                        className="h-7 text-xs bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Dosage *</Label>
                      <Input 
                        value={med.dosage} 
                        onChange={(e) => handleMedChange(idx, 'dosage', e.target.value)}
                        placeholder="e.g. 1 tablet" 
                        className="h-7 text-xs bg-white dark:bg-slate-900"
                        required
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Frequency</Label>
                      <select 
                        value={med.frequency}
                        onChange={(e) => handleMedChange(idx, 'frequency', e.target.value)}
                        className="w-full h-7 px-2 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                        <option value="As needed (SOS)">As needed (SOS)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Duration (Days)</Label>
                      <Input 
                        type="number"
                        min="1"
                        value={med.durationDays} 
                        onChange={(e) => handleMedChange(idx, 'durationDays', parseInt(e.target.value) || 1)}
                        className="h-7 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px]">Instructions</Label>
                      <Input 
                        value={med.instructions} 
                        onChange={(e) => handleMedChange(idx, 'instructions', e.target.value)}
                        placeholder="e.g. After food" 
                        className="h-7 text-xs bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsWriteDialogOpen(false)} className="text-xs h-9">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9">
                <Send className="h-3.5 w-3.5 mr-1.5" /> Issue &amp; Activate Reminders
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW FULL RX MODAL */}
      {selectedRx && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-6 rounded-3xl text-left">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-teal-600" /> Digital Prescription Details
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Patient: <strong>{selectedRx.patient}</strong> • Issued on {new Date(selectedRx.date).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 mt-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <p><strong>Clinical Diagnosis:</strong> {selectedRx.diagnosis}</p>
                {selectedRx.notes && <p className="mt-1 text-slate-600 dark:text-slate-300"><strong>Notes:</strong> {selectedRx.notes}</p>}
              </div>

              <div className="space-y-2">
                <p className="font-bold text-slate-900 dark:text-white">Medications:</p>
                {selectedRx.medications.map((m: any, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-900 dark:text-white">{idx + 1}. {m.name} ({m.dosage})</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {m.frequency} • {m.timing} • {m.duration}
                    </p>
                    {m.instructions && <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-0.5">🍽 {m.instructions}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button size="sm" onClick={() => setIsViewModalOpen(false)} className="text-xs h-8">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
