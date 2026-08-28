"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  HeartPulse, Mail, Lock, User, Phone, Calendar, 
  Droplet, AlertTriangle, ShieldCheck, Stethoscope, 
  Upload, Camera, CheckCircle2, XCircle, RefreshCw, 
  Loader2, ArrowRight, Building, Globe, Award, 
  FileCheck, Sparkles, UserCheck, Check
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';

const SPECIALIZATIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Neurologist",
  "Pediatrician",
  "Orthopedic Surgeon",
  "Psychiatrist",
  "Gastroenterologist",
  "Endocrinologist",
  "Pulmonologist",
  "Gynecologist",
  "Ophthalmologist",
  "ENT Specialist",
];

interface AiVerificationResult {
  isValidCertificate: boolean;
  confidenceScore: number;
  extractedName: string;
  extractedLicenseNumber?: string;
  extractedQualification?: string;
  issuingAuthority?: string;
  nameMatch: boolean;
  similarityScore: number;
  verificationStatus: 'APPROVED' | 'NAME_MISMATCH' | 'INVALID_CERTIFICATE' | 'REJECTED';
  message: string;
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';
  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>(initialRole);

  // --- PATIENT FORM STATE ---
  const [patientData, setPatientData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O_POS',
    emergencyContact: '',
    allergies: 'None',
  });
  const [isPatientSubmitting, setIsPatientSubmitting] = useState(false);

  // --- DOCTOR FORM STATE ---
  const [doctorData, setDoctorData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'General Physician',
    licenseNumber: '',
    qualifications: 'MBBS, MD',
    experience: '8',
    consultationFee: '600',
    languages: 'English, Hindi',
    hospitalAffiliation: 'Apex Super Specialty Hospital',
    bio: '',
  });
  const [doctorPhoto, setDoctorPhoto] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [certFile, setCertFile] = useState<{
    name: string;
    size: string;
    dataUrl: string;
    mimeType: string;
  } | null>(null);
  const certInputRef = useRef<HTMLInputElement>(null);
  const [isVerifyingAi, setIsVerifyingAi] = useState(false);
  const [aiResult, setAiResult] = useState<AiVerificationResult | null>(null);
  const [isDoctorSubmitting, setIsDoctorSubmitting] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'doctor') setActiveTab('doctor');
    else if (roleParam === 'patient') setActiveTab('patient');
  }, [searchParams]);

  // Handle Patient Inputs
  const handlePatientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPatientData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Doctor Inputs
  const handleDoctorChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDoctorData(prev => ({ ...prev, [name]: value }));
    if (name === 'fullName' && aiResult) {
      setAiResult(null); // Invalidate certificate OCR match if doctor modifies legal name
    }
  };

  // Doctor Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.add({ title: 'Error', description: 'Please upload a valid image file (PNG, JPG, or WebP).', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setDoctorPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Doctor Certificate Upload
  const handleCertUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    const reader = new FileReader();
    reader.onload = () => {
      setCertFile({
        name: file.name,
        size: `${sizeMb} MB`,
        dataUrl: reader.result as string,
        mimeType: file.type || 'image/jpeg',
      });
      setAiResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI Certificate Verification
  const handleVerifyWithAi = async () => {
    if (!doctorData.fullName.trim()) {
      toast.add({ title: 'Error', description: 'Please enter your Legal Doctor Full Name first.', type: 'error' });
      return;
    }
    if (!certFile) {
      toast.add({ title: 'Error', description: 'Please upload your Medical Certificate or License document first.', type: 'error' });
      return;
    }

    setIsVerifyingAi(true);
    try {
      const response = await api.post('/api/ai/verify-doctor-certificate', {
        doctorName: doctorData.fullName.trim(),
        certificateImageBase64: certFile.dataUrl,
        mimeType: certFile.mimeType,
        fileName: certFile.name,
      });

      const resData: AiVerificationResult = response.data;
      setAiResult(resData);

      if (resData.verificationStatus === 'APPROVED') {
        setDoctorData(prev => ({
          ...prev,
          licenseNumber: resData.extractedLicenseNumber || prev.licenseNumber || `MCI-${Math.floor(10000 + Math.random() * 90000)}`,
          qualifications: resData.extractedQualification || prev.qualifications || 'MBBS, MD',
        }));
      }
    } catch (err: any) {
      console.error(err);
      toast.add({ title: 'Error', description: err.response?.data?.message || 'AI Verification encountered an issue. Please try again.', type: 'error' });
    } finally {
      setIsVerifyingAi(false);
    }
  };

  // Submit Patient Registration
  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientData.fullName.trim() || !patientData.email.trim() || !patientData.password.trim() || !patientData.phone.trim() || !patientData.dateOfBirth.trim() || !patientData.emergencyContact.trim()) {
      toast.add({ title: 'Error', description: 'Please complete all required personal and emergency contact fields.', type: 'error' });
      return;
    }
    if (patientData.password.length < 8) {
      toast.add({ title: 'Error', description: 'Password must be at least 8 characters long.', type: 'error' });
      return;
    }

    setIsPatientSubmitting(true);
    try {
      const response = await api.post('/api/auth/register', {
        fullName: patientData.fullName.trim(),
        email: patientData.email.trim(),
        password: patientData.password,
        phone: patientData.phone.trim(),
        role: 'PATIENT',
      });

      const result = response.data;
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('userName', result.user?.fullName || result.user?.name || patientData.fullName);
      localStorage.setItem('userRole', 'PATIENT');
      localStorage.setItem('userEmail', result.user?.email || patientData.email);

      window.location.href = '/patient/dashboard';
    } catch (err: any) {
      console.error(err);
      toast.add({ title: 'Error', description: err.response?.data?.message || 'Registration failed. Please check your inputs.', type: 'error' });
      setIsPatientSubmitting(false);
    }
  };

  // Submit Doctor Registration
  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorData.fullName.trim() || !doctorData.email.trim() || !doctorData.password.trim() || !doctorData.phone.trim() || !doctorData.licenseNumber.trim() || !doctorData.bio.trim()) {
      toast.add({ title: 'Error', description: 'Please complete all personal credentials, medical license, and clinical bio fields.', type: 'error' });
      return;
    }
    if (doctorData.password.length < 8) {
      toast.add({ title: 'Error', description: 'Password must be at least 8 characters long.', type: 'error' });
      return;
    }
    if (!aiResult || aiResult.verificationStatus !== 'APPROVED') {
      toast.add({ title: 'Error', description: 'Please upload your Medical Certificate and run the AI Verification check before submitting.', type: 'error' });
      return;
    }

    setIsDoctorSubmitting(true);
    try {
      const response = await api.post('/api/auth/register', {
        fullName: doctorData.fullName.trim(),
        email: doctorData.email.trim(),
        password: doctorData.password,
        phone: doctorData.phone.trim(),
        role: 'DOCTOR',
        specialization: doctorData.specialization,
        licenseNumber: doctorData.licenseNumber || aiResult.extractedLicenseNumber || `MCI-${Math.floor(10000 + Math.random() * 90000)}`,
        qualifications: doctorData.qualifications || aiResult.extractedQualification || 'MBBS, MD',
        experience: parseInt(doctorData.experience, 10) || 8,
        consultationFee: parseFloat(doctorData.consultationFee) || 600,
        languages: doctorData.languages,
        hospitalAffiliation: doctorData.hospitalAffiliation,
        bio: doctorData.bio,
        profilePhoto: doctorPhoto || null,
        certificateUrl: certFile?.name || null,
        verificationStatus: 'APPROVED',
      });

      const result = response.data;
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('userName', result.user?.fullName || result.user?.name || doctorData.fullName);
      localStorage.setItem('userRole', 'DOCTOR');
      localStorage.setItem('userEmail', result.user?.email || doctorData.email);

      window.location.href = '/doctor/dashboard';
    } catch (err: any) {
      console.error(err);
      toast.add({ title: 'Error', description: err.response?.data?.message || 'Doctor registration failed. Please verify your details.', type: 'error' });
      setIsDoctorSubmitting(false);
    }
  };

  const isVerifiedAndReady = aiResult?.verificationStatus === 'APPROVED';

  return (
    <div className="min-h-screen bg-[#05080d] text-slate-100 py-10 px-4 sm:px-6 lg:px-8 selection:bg-teal-500 selection:text-black">
      
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/20">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              HealthConnect <span className="text-teal-400">AI 3D</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Create your Unified Account</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign up as a verified healthcare provider or a patient seeking care.
          </p>
        </div>

        {/* Tab Selector */}
        <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="w-full">
          
          <TabsList className="grid w-full grid-cols-2 bg-slate-950/90 border border-teal-500/30 p-1.5 rounded-2xl h-12">
            <TabsTrigger 
              value="patient" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-slate-950 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              Patient Registration
            </TabsTrigger>
            <TabsTrigger 
              value="doctor" 
              className="data-[state=active]:bg-teal-500 data-[state=active]:text-slate-950 font-bold text-xs sm:text-sm rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              Doctor Registration &amp; AI Verification
            </TabsTrigger>
          </TabsList>

          {/* ========================================================================= */}
          {/* TAB 1: PATIENT REGISTRATION FORM                                          */}
          {/* ========================================================================= */}
          <TabsContent value="patient" className="mt-6">
            <Card className="border border-teal-500/30 bg-slate-900/90 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-md">
              <CardHeader className="border-b border-slate-800/80 bg-slate-950/60 p-6 text-left">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 text-teal-400" /> Patient Demographics &amp; Health Baseline
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Please fill out all required fields to generate your encrypted medical record.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handlePatientSubmit}>
                <CardContent className="p-6 sm:p-8 space-y-6 text-left">
                  
                  {/* Account Basics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Full Legal Name *</Label>
                      <Input
                        name="fullName"
                        value={patientData.fullName}
                        onChange={handlePatientChange}
                        placeholder="e.g. Rahul Sharma"
                        required
                        className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Email Address *</Label>
                      <Input
                        type="email"
                        name="email"
                        value={patientData.email}
                        onChange={handlePatientChange}
                        placeholder="name@example.com"
                        required
                        className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Password (min 8 chars) *</Label>
                      <Input
                        type="password"
                        name="password"
                        value={patientData.password}
                        onChange={handlePatientChange}
                        placeholder="••••••••"
                        required
                        minLength={8}
                        className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Phone Number *</Label>
                      <Input
                        name="phone"
                        value={patientData.phone}
                        onChange={handlePatientChange}
                        placeholder="+91 98765 43210"
                        required
                        className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Medical Demographics */}
                  <div className="pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-4">Medical Demographics</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Date of Birth *</Label>
                        <Input
                          type="date"
                          name="dateOfBirth"
                          value={patientData.dateOfBirth}
                          onChange={handlePatientChange}
                          required
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Gender *</Label>
                        <select
                          name="gender"
                          value={patientData.gender}
                          onChange={handlePatientChange}
                          className="w-full bg-slate-950 border border-teal-500/30 text-white text-xs h-10 rounded-xl px-3 focus:outline-none focus:border-teal-400"
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="OTHER">Other</option>
                          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Blood Group *</Label>
                        <select
                          name="bloodGroup"
                          value={patientData.bloodGroup}
                          onChange={handlePatientChange}
                          className="w-full bg-slate-950 border border-teal-500/30 text-white text-xs h-10 rounded-xl px-3 focus:outline-none focus:border-teal-400"
                        >
                          <option value="O_POS">O Positive (O+)</option>
                          <option value="O_NEG">O Negative (O-)</option>
                          <option value="A_POS">A Positive (A+)</option>
                          <option value="A_NEG">A Negative (A-)</option>
                          <option value="B_POS">B Positive (B+)</option>
                          <option value="B_NEG">B Negative (B-)</option>
                          <option value="AB_POS">AB Positive (AB+)</option>
                          <option value="AB_NEG">AB Negative (AB-)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Emergency & Baseline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Emergency Contact (Name &amp; Phone) *</Label>
                      <Input
                        name="emergencyContact"
                        value={patientData.emergencyContact}
                        onChange={handlePatientChange}
                        placeholder="e.g. Pooja Sharma (Spouse) - +91 98765 00000"
                        required
                        className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Known Allergies / Pre-existing Conditions *</Label>
                      <Input
                        name="allergies"
                        value={patientData.allergies}
                        onChange={handlePatientChange}
                        placeholder="e.g. None, Penicillin, Asthmatic"
                        required
                        className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                      />
                    </div>
                  </div>

                </CardContent>

                <CardFooter className="p-6 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400">
                    Already registered? <Link href="/login" className="text-teal-400 font-bold hover:underline">Sign in</Link>
                  </p>
                  <Button
                    type="submit"
                    disabled={isPatientSubmitting}
                    className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10 px-8 rounded-xl shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    {isPatientSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Patient Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: DOCTOR REGISTRATION & AI CERTIFICATE OCR FORM                       */}
          {/* ========================================================================= */}
          <TabsContent value="doctor" className="mt-6">
            <Card className="border border-teal-500/30 bg-slate-900/90 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-md">
              <CardHeader className="border-b border-slate-800/80 bg-slate-950/60 p-6 text-left">
                <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-teal-400" /> Practitioner Registration &amp; Medical Verification
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Provide your clinical qualifications and upload your medical certificate for real-time AI authenticity verification.
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleDoctorSubmit}>
                <CardContent className="p-6 sm:p-8 space-y-8 text-left">

                  {/* 1. Profile Photo & Doctor Legal Name */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-5 rounded-2xl bg-slate-950/60 border border-teal-500/20">
                    <div className="relative">
                      <Avatar className="h-20 w-20 border-2 border-teal-500/40">
                        {doctorPhoto ? (
                          <AvatarImage src={doctorPhoto} className="object-cover" />
                        ) : (
                          <AvatarFallback className="bg-slate-800 text-teal-400 font-bold text-2xl">
                            {doctorData.fullName ? doctorData.fullName.replace(/^Dr\.?\s*/i, '').substring(0, 2).toUpperCase() : 'DR'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <input 
                        type="file" 
                        ref={photoInputRef} 
                        onChange={handlePhotoUpload} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="outline"
                        onClick={() => photoInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-teal-500 text-slate-950 border-0 hover:bg-teal-400 shadow-md cursor-pointer"
                        title="Upload profile photo"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-bold text-white">Practitioner Profile Photo</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Upload a clear professional photo displayed on your consultation profile. (PNG, JPG up to 5MB).
                      </p>
                      {doctorPhoto && (
                        <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1 mt-1">
                          <Check className="w-3 h-3" /> Photo Attached
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Account & Login Credentials */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">1. Account &amp; Identity Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Legal Doctor Full Name *</Label>
                        <Input
                          name="fullName"
                          value={doctorData.fullName}
                          onChange={handleDoctorChange}
                          placeholder="e.g. Dr. Dharm Patel"
                          required
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                        <p className="text-[10px] text-slate-500">Must exactly match the name printed on your certificate.</p>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Professional Email Address *</Label>
                        <Input
                          type="email"
                          name="email"
                          value={doctorData.email}
                          onChange={handleDoctorChange}
                          placeholder="doctor@hospital.com"
                          required
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Password (min 8 chars) *</Label>
                        <Input
                          type="password"
                          name="password"
                          value={doctorData.password}
                          onChange={handleDoctorChange}
                          placeholder="••••••••"
                          required
                          minLength={8}
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Contact Phone Number *</Label>
                        <Input
                          name="phone"
                          value={doctorData.phone}
                          onChange={handleDoctorChange}
                          placeholder="+91 98765 43210"
                          required
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Clinical Qualifications & Practice */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider">2. Clinical Practice &amp; Pricing</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Medical Specialization *</Label>
                        <select
                          name="specialization"
                          value={doctorData.specialization}
                          onChange={handleDoctorChange}
                          className="w-full bg-slate-950 border border-teal-500/30 text-white text-xs h-10 rounded-xl px-3 focus:outline-none focus:border-teal-400"
                        >
                          {SPECIALIZATIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Clinical Experience (Years) *</Label>
                        <Input
                          type="number"
                          name="experience"
                          value={doctorData.experience}
                          onChange={handleDoctorChange}
                          placeholder="8"
                          required
                          min={1}
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Virtual Consultation Fee (₹) *</Label>
                        <Input
                          type="number"
                          name="consultationFee"
                          value={doctorData.consultationFee}
                          onChange={handleDoctorChange}
                          placeholder="600"
                          required
                          min={100}
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Practicing Hospital / Clinic *</Label>
                        <Input
                          name="hospitalAffiliation"
                          value={doctorData.hospitalAffiliation}
                          onChange={handleDoctorChange}
                          placeholder="e.g. Apex Super Specialty Hospital"
                          required
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-300">Languages Spoken *</Label>
                        <Input
                          name="languages"
                          value={doctorData.languages}
                          onChange={handleDoctorChange}
                          placeholder="e.g. English, Hindi, Gujarati"
                          required
                          className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-300">Professional Bio &amp; Clinical Summary *</Label>
                      <textarea
                        name="bio"
                        value={doctorData.bio}
                        onChange={handleDoctorChange}
                        placeholder="Write a brief overview of your clinical background, specialized treatments, and patient care philosophy..."
                        required
                        rows={3}
                        className="w-full bg-slate-950 border border-teal-500/30 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-teal-400"
                      />
                    </div>
                  </div>

                  {/* 4. Medical Certificate Upload & AI OCR Validation */}
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4" /> 3. Medical Certificate &amp; License Verification *
                      </h3>
                      <Badge className="bg-teal-950 border-teal-500/40 text-teal-300 text-[10px]">
                        AI Verification Required
                      </Badge>
                    </div>

                    <input 
                      type="file" 
                      ref={certInputRef} 
                      onChange={handleCertUpload} 
                      accept="image/*,.pdf" 
                      className="hidden" 
                    />

                    {/* Drag-and-Drop / File Upload Zone */}
                    <div
                      onClick={() => certInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                        certFile 
                          ? 'border-teal-400/80 bg-teal-950/20' 
                          : 'border-teal-500/30 hover:border-teal-400 bg-slate-950/40 hover:bg-slate-950/80'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="h-12 w-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                          {certFile ? <FileCheck className="h-6 w-6 text-teal-300" /> : <Upload className="h-6 w-6" />}
                        </div>
                        {certFile ? (
                          <div>
                            <p className="font-bold text-xs text-white">{certFile.name}</p>
                            <p className="text-[11px] text-teal-400 mt-0.5">{certFile.size} • Click to change document</p>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-xs text-white">Upload Medical Council Certificate / MBBS License</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP, or PDF up to 10MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AI Verification Button */}
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <Button
                        type="button"
                        onClick={handleVerifyWithAi}
                        disabled={isVerifyingAi || !certFile || !doctorData.fullName.trim()}
                        className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10 px-6 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isVerifyingAi ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            AI Analyzing Certificate...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Run AI Certificate Verification
                          </>
                        )}
                      </Button>

                      {aiResult && (
                        <div className="flex-1 text-xs">
                          {aiResult.verificationStatus === 'APPROVED' ? (
                            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span><strong>Verified &amp; Approved:</strong> Name matched accurately ({aiResult.similarityScore}% confidence). License: <strong>{aiResult.extractedLicenseNumber || 'MCI-VERIFIED'}</strong></span>
                            </div>
                          ) : (
                            <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-300 flex items-center gap-2">
                              <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                              <span><strong>Verification Incomplete:</strong> {aiResult.message}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 pt-2">
                      <Label className="text-xs font-semibold text-slate-300">Verified Medical License / Registration Number *</Label>
                      <Input
                        name="licenseNumber"
                        value={doctorData.licenseNumber}
                        onChange={handleDoctorChange}
                        placeholder="e.g. MCI-DP-78421"
                        required
                        className="bg-slate-950 border-teal-500/30 text-white text-xs h-10 rounded-xl font-mono"
                      />
                    </div>

                  </div>

                </CardContent>

                <CardFooter className="p-6 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-400">
                    Already registered? <Link href="/login" className="text-teal-400 font-bold hover:underline">Sign in</Link>
                  </p>
                  <Button
                    type="submit"
                    disabled={isDoctorSubmitting || !isVerifiedAndReady}
                    className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10 px-8 rounded-xl shadow-lg cursor-pointer flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDoctorSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting Registration...
                      </>
                    ) : (
                      <>
                        Complete Doctor Registration
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

        </Tabs>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#05080d] flex items-center justify-center text-teal-400 text-sm">Loading Registration Portal...</div>}>
      <RegisterContent />
    </Suspense>
  );
}
