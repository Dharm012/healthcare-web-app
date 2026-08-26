"use client";

import { useState } from 'react';
import { FileText, Upload, Search, Download, Eye, Filter, Plus, FileImage, FlaskConical, Loader2 } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

const diagnoses = [
  { id: 1, condition: 'Hyperlipidemia (Elevated LDL)', date: 'Aug 20, 2026', doctor: 'Dr. Dharm Patel', severity: 'Moderate' },
  { id: 2, condition: 'Essential Hypertension (Stage 1)', date: 'Mar 10, 2026', doctor: 'Dr. Dharm Patel', severity: 'Mild' },
  { id: 3, condition: 'Vitamin D Deficiency', date: 'Jan 05, 2026', doctor: 'Dr. Jane Smith', severity: 'Mild' },
];

export default function PatientRecordsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', type: 'LAB_RESULT' });
  const queryClient = useQueryClient();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['medical-records', 'patient'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/medical-records/patient');
        return response.data;
      } catch {
        return [];
      }
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/api/medical-records/upload', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records', 'patient'] });
      setIsUploadOpen(false);
      setUploadForm({ title: '', description: '', type: 'LAB_RESULT' });
    }
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.title) return;
    uploadMutation.mutate(uploadForm);
  };

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Medical Records &amp; Reports</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Secure clinical documents, laboratory profiles, and imaging reports.</p>
        </div>
        
        <div>
          <Button onClick={() => setIsUploadOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 shadow-xs cursor-pointer">
            <Upload className="h-4 w-4 mr-1.5" /> Upload Document
          </Button>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <DialogHeader>
                <DialogTitle>Upload Health Document</DialogTitle>
                <DialogDescription className="text-slate-500 dark:text-slate-400 text-xs">
                  Add a new lab result, imaging report, or prescription to your permanent encrypted record.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4 mt-4 text-left">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-semibold">Document Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Comprehensive Lipid Panel Q3" 
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-xs font-semibold">Document Type</Label>
                  <select 
                    id="type"
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({...uploadForm, type: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500"
                  >
                    <option value="LAB_RESULT">Laboratory Blood / Urine Test</option>
                    <option value="IMAGING">Diagnostic Imaging (X-Ray / MRI / USG)</option>
                    <option value="PRESCRIPTION">Doctor Prescription Note</option>
                    <option value="DISCHARGE_SUMMARY">Hospital Discharge Summary</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-semibold">Notes / Summary</Label>
                  <Input 
                    id="description" 
                    placeholder="e.g., Prescribed by Dr. Dharm Patel at Apex Labs" 
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10"
                  />
                </div>
                <Button type="submit" disabled={uploadMutation.isPending} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10">
                  {uploadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Document
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 mb-4">
          <TabsTrigger value="all" className="text-xs font-semibold">All Records ({records.length + diagnoses.length})</TabsTrigger>
          <TabsTrigger value="diagnoses" className="text-xs font-semibold">Clinical Diagnoses ({diagnoses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3">
          {diagnoses.map((diag) => (
            <Card key={diag.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-xl overflow-hidden text-left">
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{diag.condition}</h4>
                      <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800 text-[10px]">
                        {diag.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Diagnosed on {diag.date} • {diag.doctor}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs h-8 border-slate-200 dark:border-slate-700">
                  <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="diagnoses" className="space-y-3">
          {diagnoses.map((diag) => (
            <Card key={diag.id} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-xl text-left">
              <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{diag.condition}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{diag.date} • Attending: {diag.doctor}</p>
                </div>
                <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs">
                  Active Care Plan
                </Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

    </div>
  );
}
