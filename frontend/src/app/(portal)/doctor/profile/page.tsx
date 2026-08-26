"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Stethoscope, ShieldCheck, CheckCircle2, Save, User, Award, Building, DollarSign } from 'lucide-react';

export default function DoctorProfilePage() {
  const [name, setName] = useState('Doctor');
  const [specialty, setSpecialty] = useState('General Physician');
  const [fee, setFee] = useState('600');
  const [license, setLicense] = useState('MCI-VERIFIED');
  const [experience, setExperience] = useState('8');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      const stored = localStorage.getItem("user");

      if (storedName && storedName.trim()) setName(storedName);
      if (storedEmail && storedEmail.trim()) setEmail(storedEmail);

      if (stored) {
        const u = JSON.parse(stored);
        const doc = u.doctorProfile;
        if (doc?.fullName) setName(doc.fullName);
        else if (u.name) setName(u.name);
        else if (u.fullName) setName(u.fullName);

        if (doc?.specialization) setSpecialty(doc.specialization);
        if (doc?.consultationFee) setFee(String(doc.consultationFee));
        if (doc?.licenseNumber) setLicense(doc.licenseNumber);
        if (doc?.experience) setExperience(String(doc.experience));
      }
    } catch {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("userName", name);
      const stored = localStorage.getItem("user");
      if (stored) {
        const u = JSON.parse(stored);
        if (u.doctorProfile) {
          u.doctorProfile.fullName = name;
          u.doctorProfile.specialization = specialty;
          u.doctorProfile.consultationFee = parseFloat(fee) || 600;
          u.doctorProfile.licenseNumber = license;
          u.doctorProfile.experience = parseInt(experience, 10) || 5;
        }
        u.name = name;
        u.fullName = name;
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = name
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'DR';

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-900 dark:text-slate-100 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Doctor Profile &amp; Clinical Credentials</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your public consultation listing, license verification, and consultation fees.</p>
        </div>
        <Badge className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-xs px-3 py-1">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          MCI Verified &amp; Approved
        </Badge>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-teal-500/50">
                <AvatarFallback className="bg-teal-600 text-white font-bold text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{name}</CardTitle>
                <CardDescription className="text-xs text-teal-600 dark:text-teal-400 font-semibold">{specialty} • {experience} Years Exp</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Practitioner Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Primary Medical Specialization</Label>
                <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Medical License Number</Label>
                <Input value={license} onChange={(e) => setLicense(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10 font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Clinical Experience (Years)</Label>
                <Input type="number" value={experience} onChange={(e) => setExperience(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Virtual Consultation Fee (₹)</Label>
                <Input type="number" value={fee} onChange={(e) => setFee(e.target.value)} className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Registered Email Address</Label>
                <Input value={email} disabled className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 text-xs h-10 cursor-not-allowed" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 flex items-center justify-between">
            {saved ? (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Doctor credentials updated successfully!
              </span>
            ) : <span />}
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-xs cursor-pointer">
              <Save className="h-4 w-4 mr-1.5" /> Save Credentials
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
