"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  HeartPulse, Video, Sparkles, ShieldCheck, Lock, CheckCircle2, 
  ArrowRight, Activity, Clock, Users, Award, Star, Mail, 
  User, Stethoscope, ChevronRight, Loader2, Globe, Heart,
  Menu, X, Brain, Zap
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import dynamic from 'next/dynamic';
import { ScrollReveal } from '@/components/ScrollReveal';

const Interactive3DBackground = dynamic(
  () => import('@/components/Interactive3DBackground').then((mod) => mod.Interactive3DBackground),
  { ssr: false }
);
import { toast } from '@/components/ui/toast';
import api from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [loginRole, setLoginRole] = useState<'patient' | 'doctor'>('patient');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const onLoginSubmit = async (data: z.infer<typeof loginSchema>) => {
    setIsLoggingIn(true);
    try {
      const response = await api.post('/api/auth/login', data);
      const result = response.data;

      const role = result.user?.role || 'PATIENT';
      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('userRole', role);
      localStorage.setItem('userEmail', result.user?.email || '');

      document.cookie = `accessToken=${result.accessToken}; path=/; max-age=604800; SameSite=Lax`;
      document.cookie = `userRole=${role}; path=/; max-age=604800; SameSite=Lax`;

      if (role === 'ADMIN') window.location.href = '/admin/dashboard';
      else if (role === 'DOCTOR') window.location.href = '/doctor/dashboard';
      else window.location.href = '/patient/dashboard';
      
    } catch (error: any) {
      console.error(error);
      if (error.response) {
        toast.add({ title: 'Error', description: error.response.data.message || 'Login failed. Please check your credentials.', type: 'error' });
      } else {
        toast.add({ title: 'Error', description: 'Network error. Please make sure the backend server is running.', type: 'error' });
      }
      setIsLoggingIn(false);
    }
  };

  const isDoctor = loginRole === 'doctor';

  const stats = [
    { value: "50,000+", label: "Verified Patient Consultations", icon: Users, color: "text-teal-700", bg: "bg-teal-50" },
    { value: "99.4%", label: "AI Clinical Diagnostic Precision", icon: Sparkles, color: "text-cyan-400", bg: "bg-cyan-950/60" },
    { value: "< 2 Mins", label: "Average Virtual Queue Time", icon: Clock, color: "text-emerald-400", bg: "bg-emerald-950/60" },
    { value: "500+", label: "Specialist Doctors Online", icon: Award, color: "text-blue-400", bg: "bg-blue-950/60" },
  ];

  const features = [
    {
      icon: Sparkles,
      title: "AI Medical Diagnostic Engine",
      description: "Analyze symptoms, triage urgency, and receive immediate preliminary medical insights powered by Gemini 3.7 clinical models.",
      tag: "Neural Clinical AI",
      color: "text-teal-700",
      bg: "bg-teal-50",
    },
    {
      icon: Video,
      title: "Encrypted HD Teleconsultations",
      description: "HD WebRTC video rooms with server-side start-time locks, join tracking, clinical notes, and private in-call prescription delivery.",
      tag: "256-Bit WebRTC",
      color: "text-cyan-400",
      bg: "bg-cyan-950/60",
    },
    {
      icon: Stethoscope,
      title: "Top-Tier Verified Specialists",
      description: "Connect with board-certified general physicians like Dr. Dharm Patel. Review real ratings and book instantly.",
      tag: "100% Medical Council Verified",
      color: "text-emerald-400",
      bg: "bg-emerald-950/60",
    },
    {
      icon: Activity,
      title: "Smart Bio-Vitals Tracking",
      description: "Track ECG rhythm, blood pressure, blood glucose, and oxygen saturation over time with interactive analytics and alerts.",
      tag: "Live Bio-Telemetry",
      color: "text-rose-400",
      bg: "bg-rose-950/60",
    },
    {
      icon: Globe,
      title: "3D Anatomical Telemetry",
      description: "Visualize biological symptoms and physiological markers interactively in real-time 3D space.",
      tag: "WebGL 3D Bio-Engine",
      color: "text-purple-400",
      bg: "bg-purple-950/60",
    },
    {
      icon: ShieldCheck,
      title: "Zero-Trust Privacy & Security",
      description: "Your health records belong exclusively to you. End-to-end encrypted storage with role-based clinical consent verification.",
      tag: "HIPAA Compliant",
      color: "text-blue-400",
      bg: "bg-blue-950/60",
    },
  ];

  const faqs = [
    {
      q: "How does the online 3D video consultation work?",
      a: "You select a verified doctor (such as Dr. Dharm Patel), choose an available date and time slot, and send an appointment request. Once the doctor accepts, an encrypted video call link is generated. The video room unlocks strictly at the scheduled start time.",
    },
    {
      q: "Is my personal medical data safe and HIPAA compliant?",
      a: "Yes. HealthConnect AI 3D uses 256-bit AES encryption in transit and at rest. Consultations and medical records comply with HIPAA and international digital health standards.",
    },
    {
      q: "How accurate is the AI Symptom Assistant?",
      a: "Our AI assistant uses state-of-the-art medical reasoning models trained on peer-reviewed clinical knowledge to help triage symptoms and guide you to the right specialist.",
    },
    {
      q: "Can doctors issue digital prescriptions during video calls?",
      a: "Yes. Doctors can prescribe medications, dosage instructions, and diagnostics directly inside the video consultation room. Prescriptions are saved automatically to your Patient Health Records vault.",
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#F7F1E7] text-slate-800 overflow-x-hidden selection:bg-teal-500 selection:text-white">
      
      {/* 1. INTERACTIVE 3D THREE.JS BACKGROUND THAT RESPONDS TO MOUSE SENSITIVITY */}
      <Interactive3DBackground />

      {/* ========================================================================= */}
      {/* 2. STICKY NAVBAR                                                          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-[#F7F1E7]/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/30 group-hover:scale-105 transition-transform">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              HealthConnect <span className="text-teal-700">AI 3D</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
            <Link href="#features" className="hover:text-teal-700 transition-colors">Features</Link>
            <Link href="/symptom-checker" className="hover:text-teal-700 transition-colors">3D Body Explorer</Link>
            <Link href="/doctors" className="hover:text-teal-700 transition-colors">Find a Doctor</Link>
            <Link href="#telehealth" className="hover:text-teal-700 transition-colors">Virtual Clinic</Link>
            <Link href="#faqs" className="hover:text-teal-700 transition-colors">FAQs</Link>
          </nav>

          {/* Right CTA / Auth */}
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-slate-700 hover:text-teal-700 focus:outline-none transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link href="/login">
              <Button variant="ghost" className="text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 text-xs sm:text-sm font-semibold">
                Sign In
              </Button>
            </Link>
            <Link href="/doctors">
              <Button className="bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-teal-500/20">
                Book Video Call
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 bg-[#F7F1E7]/95 backdrop-blur-xl absolute top-full left-0 w-full shadow-2xl z-40">
            <nav className="flex flex-col py-4 px-4 sm:px-8 gap-2">
              <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-teal-700 font-medium py-3 border-b border-slate-200/50 transition-colors">Features</Link>
              <Link href="/symptom-checker" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-teal-700 font-medium py-3 border-b border-slate-200/50 transition-colors">3D Body Explorer</Link>
              <Link href="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-teal-700 font-medium py-3 border-b border-slate-200/50 transition-colors">Find a Doctor</Link>
              <Link href="#telehealth" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-teal-700 font-medium py-3 border-b border-slate-200/50 transition-colors">Virtual Clinic</Link>
              <Link href="#faqs" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-700 hover:text-teal-700 font-medium py-3 transition-colors">FAQs</Link>
            </nav>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (WITH EMBEDDED LOGIN & FLOATING TELEMETRY CARDS)          */}
      {/* ========================================================================= */}
      <main className="relative z-10">
        
        <section className="relative w-full pt-10 pb-20 md:pt-16 md:pb-28 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            
            {/* Left Column: Headline, Description, CTAs & Login */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-left">
              
              <div>
                <Badge className="bg-teal-100 text-teal-800 border border-teal-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-xs">
                  <HeartPulse className="w-3.5 h-3.5 text-teal-700" />
                  Trusted Healthcare Platform
                </Badge>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-slate-900 leading-tight">
                Intelligent Healthcare. <br />
                <span className="bg-gradient-to-r from-teal-700 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Human at Heart.
                </span>
              </h1>

              <p className="max-w-xl text-slate-700 text-sm sm:text-base leading-relaxed">
                Connect with trusted doctors, understand your health with intelligent AI, and manage your care from one secure platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link href="/doctors">
                  <Button size="lg" className="w-full sm:w-auto bg-teal-500 hover:bg-teal-400 text-white font-bold text-sm h-12 px-7 shadow-lg shadow-teal-500/30 flex items-center gap-2 cursor-pointer">
                    <Video className="w-4 h-4" />
                    Book a Video Consultation
                  </Button>
                </Link>
                <Link href="/doctors">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 bg-white/60 hover:bg-white text-slate-800 font-bold text-sm h-12 px-7 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-teal-600" />
                    Find a Doctor
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-600 border-t border-slate-200/80">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  <span>100% Medical Council Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-teal-700" />
                  <span>256-Bit Encrypted Rooms</span>
                </div>
              </div>

              {/* Login Card — below hero text */}
              <div className="w-full max-w-md bg-white/80 border border-teal-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative z-10 text-left space-y-4 mt-4">
                
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-extrabold text-slate-900">Welcome back</h3>
                  <p className="text-xs text-slate-600">Sign in to access your healthcare portal</p>
                </div>

                {/* Role Pill Switcher */}
                <div className="grid grid-cols-2 p-1.5 bg-[#F7F1E7] border border-teal-500/20 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => setLoginRole('patient')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !isDoctor
                        ? 'bg-teal-400 text-slate-950 shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Patient Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole('doctor')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDoctor
                        ? 'bg-teal-400 text-slate-950 shadow-md'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Doctor Login
                  </button>
                </div>

                <p className="text-[11px] text-teal-800 flex items-center justify-center gap-1.5 font-medium">
                  {isDoctor ? (
                    <>
                      <Stethoscope className="w-3.5 h-3.5" />
                      Sign in as a Doctor to manage clinical practice
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5" />
                      Sign in as a Patient to manage your health records
                    </>
                  )}
                </p>

                {/* Clean Form Card Inside */}
                <div className="bg-white rounded-2xl p-5 text-slate-900 space-y-3.5 shadow-lg">
                  <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-3">
                    
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                        <Input
                          type="email"
                          placeholder={isDoctor ? "healthcareantigravity1@gmail.com" : "john.doe@example.com"}
                          className="pl-9 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 focus:border-teal-600"
                          {...register('email')}
                        />
                      </div>
                      {errors.email && <p className="text-[10px] text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-slate-700">Password</Label>
                        <Link href="/forgot-password" className="text-[11px] text-teal-600 hover:underline font-medium">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-600" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-9 h-10 bg-slate-50 border-slate-200 text-xs text-slate-900 focus:border-teal-600"
                          {...register('password')}
                        />
                      </div>
                      {errors.password && <p className="text-[10px] text-red-500">{errors.password.message}</p>}
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoggingIn}
                      className="w-full bg-teal-500 hover:bg-teal-400 text-white font-extrabold text-xs h-10 shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in as {isDoctor ? 'Doctor' : 'Patient'} →
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="pt-2 border-t border-slate-100 text-center space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                      Secure Healthcare Access
                    </span>
                    <p className="text-xs text-slate-600">
                      Don&apos;t have an account?{' '}
                      <Link 
                        href={isDoctor ? "/register?role=doctor" : "/register"} 
                        className="font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer inline-flex items-center gap-1"
                      >
                        Register here {isDoctor ? "(Doctor Form)" : "(Patient)"} →
                      </Link>
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: 3D Bio-Digital Health Nexus Telemetry View */}
            <div className="hidden lg:flex lg:col-span-6 flex-col justify-between min-h-[580px] relative pointer-events-none select-none py-2">
              
              {/* Top Floating Telemetry Card — AI Diagnostic Engine */}
              <div className="self-end pointer-events-auto bg-white/80 backdrop-blur-md border border-teal-500/30 rounded-2xl p-3.5 shadow-xl max-w-xs transition-all hover:scale-105 hover:border-teal-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center shadow-xs">
                    <Brain className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-900 block">AI Clinical Diagnostic Engine</span>
                    <span className="text-[10px] text-teal-700 font-medium">Gemini 3.7 Medical • 99.4% Precision</span>
                  </div>
                </div>
              </div>

              {/* Middle Floating Telemetry Card — Smart Bio-Vitals */}
              <div className="self-start pointer-events-auto bg-white/80 backdrop-blur-md border border-rose-500/30 rounded-2xl p-3.5 shadow-xl max-w-xs transition-all hover:scale-105 hover:border-rose-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-900 block">Smart Bio-Vitals Telemetry</span>
                    <span className="text-[10px] text-rose-600 font-medium">72 BPM • Active ECG & SpO2 Stream</span>
                  </div>
                </div>
              </div>

              {/* Lower Floating Telemetry Card — Encrypted Telehealth */}
              <div className="self-end pointer-events-auto bg-white/80 backdrop-blur-md border border-teal-500/30 rounded-2xl p-3.5 shadow-xl max-w-xs transition-all hover:scale-105 hover:border-teal-400">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-900 block">Encrypted Telehealth Network</span>
                    <span className="text-[10px] text-teal-700 font-medium">256-Bit WebRTC • Verified Doctors</span>
                  </div>
                </div>
              </div>

              {/* Bottom Interactive HUD Pill */}
              <div className="self-center pointer-events-auto bg-[#F7F1E7]/95 backdrop-blur-lg border border-teal-500/40 rounded-full px-4 py-2 shadow-lg flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                <span className="text-xs font-semibold text-slate-800">
                  3D Bio-Digital Health Nexus • Interactive Telemetry • Scroll to Explore
                </span>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. METRICS & STATS BAR (WITH SCROLL REVEAL)                               */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section className="w-full border-y border-teal-500/20 bg-[#FFFBF5]/60 py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-white/80 border border-teal-500/20 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{stat.value}</span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium text-center sm:text-left">{stat.label}</span>
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* 5. FEATURE CARDS GRID (WITH SCROLL REVEAL)                                */}
        {/* ========================================================================= */}
        <ScrollReveal delay={100}>
          <section id="features" className="w-full py-16 md:py-24 px-4 md:px-8">
            <div className="max-w-7xl mx-auto space-y-12">
              
              <div className="text-center space-y-3">
                <Badge className="bg-teal-100 text-teal-800 border border-teal-500/40 text-xs px-3 py-1">
                  Platform Capabilities
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Engineered for Complete Clinical Precision
                </h2>
                <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600">
                  Every feature is designed to connect patients with board-certified doctors in real time with security and clinical ease.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feat, i) => (
                  <Card key={i} className="border border-teal-500/20 bg-white/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-400/60 transition-all flex flex-col justify-between">
                    <div className="space-y-4 text-left">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center shadow-xs`}>
                          <feat.icon className="w-6 h-6" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono text-slate-600 border-slate-200">
                          {feat.tag}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {feat.description}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>

            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* 6. VIRTUAL CLINIC TELEHEALTH SHOWCASE (WITH SCROLL REVEAL)                */}
        {/* ========================================================================= */}
        <ScrollReveal delay={150}>
          <section id="telehealth" className="w-full py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto bg-white/60 rounded-3xl border border-teal-500/20 my-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center text-left">
              
              <div className="lg:col-span-6 space-y-6">
                <Badge className="bg-teal-100 text-teal-800 border border-teal-500/40 text-xs px-3 py-1">
                  Virtual Consultation Suite
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Hospital Quality Video Care, <br />
                  <span className="text-teal-700">Locked to the Exact Second.</span>
                </h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Our custom WebRTC telehealth engine guarantees that both the doctor and patient are authenticated before a call begins. Strict server-side start-time locks prevent premature entries, while background sweepers ensure active consultations run smoothly.
                </p>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-teal-500/20">
                    <div className="p-2 rounded-lg bg-teal-100 text-teal-700 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Server-Side Time Locks</h4>
                      <p className="text-xs text-slate-600">Calls strictly unlock at the scheduled start time to respect doctor availability.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-teal-500/20">
                    <div className="p-2 rounded-lg bg-blue-950/80 text-blue-400 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Automated Status Progression</h4>
                      <p className="text-xs text-slate-600">Transitions from CONFIRMED to IN_PROGRESS when both participants join, and COMPLETED when concluded.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telehealth Mockup */}
              <div className="lg:col-span-6">
                <Card className="bg-[#FFFBF5] text-slate-900 rounded-2xl p-4 shadow-xl border border-teal-500/40 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs font-mono text-slate-600 ml-2 font-bold">room-vcon-encrypted.live</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 text-[10px] px-2">● Live HD Stream</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 aspect-video rounded-xl bg-white p-2 border border-slate-200 relative">
                    <div className="rounded-lg bg-gradient-to-br from-slate-900 to-teal-950 flex flex-col items-center justify-center p-3 relative border border-slate-200">
                      <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                        DP
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-2">Dr. Dharm Patel</p>
                      <p className="text-[10px] text-teal-700">General Physician</p>
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-green-400">
                        ● Audio Live
                      </div>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 relative border border-slate-200">
                      <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-slate-900 font-bold text-lg shadow-lg">
                        PT
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-2">John Doe</p>
                      <p className="text-[10px] text-slate-600">Verified Patient</p>
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-teal-700">
                        ● HD Connected
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-200">
                    <span>Session: <strong className="text-slate-900 font-mono">Confirmed &amp; Live</strong></span>
                    <Link href="/doctors">
                      <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-8">
                        Book Doctor Now
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>

            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* 7. FREQUENTLY ASKED QUESTIONS (WITH SCROLL REVEAL)                        */}
        {/* ========================================================================= */}
        <ScrollReveal delay={200}>
          <section id="faqs" className="w-full py-16 md:py-24 px-4 md:px-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3 mb-10">
              <Badge className="bg-teal-100 text-teal-800 border border-teal-500/40 text-xs px-3 py-1">
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Everything You Need to Know
              </h2>
            </div>

            <div className="space-y-3 text-left">
              {faqs.map((faq, i) => (
                <div 
                  key={i}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="bg-white/80 border border-teal-500/20 hover:border-teal-400 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">{faq.q}</h4>
                    <span className="text-teal-700 text-lg font-bold">{activeFaq === i ? "−" : "+"}</span>
                  </div>
                  {activeFaq === i && (
                    <p className="text-xs sm:text-sm text-slate-700 mt-3 pt-3 border-t border-slate-200 leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* ========================================================================= */}
        {/* 8. MASTER CALL TO ACTION (WITH SCROLL REVEAL)                             */}
        {/* ========================================================================= */}
        <ScrollReveal delay={250}>
          <section className="w-full py-12 md:py-20 px-4 md:px-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-red-900 via-rose-800 to-red-900 border border-red-400/30 p-8 sm:p-14 rounded-3xl text-center space-y-6 shadow-2xl text-white">
              
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white border-0 text-xs px-3 py-1">
                  Start Your Healthcare Journey
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  Your Health, Connected.
                </h2>
                <p className="max-w-xl mx-auto text-xs sm:text-sm text-red-100">
                  Get the care you need from trusted doctors, wherever you are. Book a video consultation in under a minute.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link href="/doctors">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-red-900 hover:bg-red-50 font-extrabold text-sm h-12 px-8 shadow-md">
                    <Video className="w-4 h-4 mr-2 text-red-900" />
                    Book a Consultation
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 bg-white/10 hover:bg-white/20 text-white font-bold text-sm h-12 px-8">
                    Create Patient Account
                  </Button>
                </Link>
              </div>

            </div>
          </section>
        </ScrollReveal>

      </main>

      {/* ========================================================================= */}
      {/* 9. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="w-full border-t border-teal-500/20 bg-[#FFFBF5]/90 py-12 px-4 md:px-8 text-xs text-slate-600 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-teal-700" />
              <span className="font-bold text-slate-900 text-sm">HealthConnect AI 3D</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Empowering patients and clinicians with intelligent telehealth, 3D bio-telemetry, and secure medical records.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Telehealth Portal</h4>
            <ul className="space-y-2">
              <li><Link href="/doctors" className="hover:text-teal-700">Find a Doctor</Link></li>
              <li><Link href="/patient/appointments" className="hover:text-teal-700">My Appointments</Link></li>
              <li><Link href="/patient/consultations" className="hover:text-teal-700">Tele-Consultations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Specialists</h4>
            <ul className="space-y-2">
              <li><Link href="/doctors?specialty=General%20Physician" className="hover:text-teal-700">General Physicians</Link></li>
              <li><Link href="/doctors?specialty=Cardiologist" className="hover:text-teal-700">Cardiologists</Link></li>
              <li><Link href="/doctors?specialty=Dermatologist" className="hover:text-teal-700">Dermatologists</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-3">Compliance &amp; Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-teal-700">HIPAA Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-700">Terms of Medical Service</Link></li>
              <li><Link href="/consent" className="hover:text-teal-700">Telehealth Consent</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-200 text-center text-slate-500">
          © 2026 HealthConnect AI 3D Platform. All rights reserved. Encrypted 256-bit Healthcare Infrastructure.
        </div>
      </footer>

    </div>
  );
}
