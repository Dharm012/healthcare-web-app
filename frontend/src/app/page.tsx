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
  Menu, X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Interactive3DBackground } from '@/components/Interactive3DBackground';
import { ScrollReveal } from '@/components/ScrollReveal';

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
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        alert(result.message || 'Login failed. Please check your credentials.');
        setIsLoggingIn(false);
        return;
      }

      localStorage.setItem('accessToken', result.accessToken);
      localStorage.setItem('user', JSON.stringify(result.user));
      localStorage.setItem('userRole', result.user?.role || (loginRole === 'doctor' ? 'DOCTOR' : 'PATIENT'));
      localStorage.setItem('userEmail', result.user?.email || '');

      const role = result.user?.role || (loginRole === 'doctor' ? 'DOCTOR' : 'PATIENT');
      if (role === 'ADMIN') window.location.href = '/admin/dashboard';
      else if (role === 'DOCTOR') window.location.href = '/doctor/dashboard';
      else window.location.href = '/patient/dashboard';
      
    } catch (error) {
      console.error(error);
      alert('Network error. Please make sure the backend server is running.');
      setIsLoggingIn(false);
    }
  };

  const isDoctor = loginRole === 'doctor';

  const stats = [
    { value: "50,000+", label: "Verified Patient Consultations", icon: Users, color: "text-teal-400", bg: "bg-teal-950/60" },
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
      color: "text-teal-400",
      bg: "bg-teal-950/60",
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
    <div className="relative min-h-screen bg-[#05080d] text-slate-100 overflow-x-hidden selection:bg-teal-500 selection:text-black">
      
      {/* 1. INTERACTIVE 3D THREE.JS BACKGROUND THAT RESPONDS TO MOUSE SENSITIVITY */}
      <Interactive3DBackground />

      {/* ========================================================================= */}
      {/* 2. STICKY NAVBAR                                                          */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 w-full border-b border-teal-500/20 bg-[#05080d]/85 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8 max-w-7xl">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 shadow-md shadow-teal-500/30 group-hover:scale-105 transition-transform">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              HealthConnect <span className="text-teal-400">AI 3D</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link href="#features" className="hover:text-teal-400 transition-colors">Features</Link>
            <Link href="/symptom-checker" className="hover:text-teal-400 transition-colors">3D Body Explorer</Link>
            <Link href="/doctors" className="hover:text-teal-400 transition-colors">Find a Doctor</Link>
            <Link href="#telehealth" className="hover:text-teal-400 transition-colors">Virtual Clinic</Link>
            <Link href="#faqs" className="hover:text-teal-400 transition-colors">FAQs</Link>
          </nav>

          {/* Right CTA / Auth */}
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 text-slate-300 hover:text-teal-400 focus:outline-none transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link href="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800/60 text-xs sm:text-sm font-semibold">
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
          <div className="md:hidden border-t border-teal-500/20 bg-[#05080d]/95 backdrop-blur-xl absolute top-full left-0 w-full shadow-2xl z-40">
            <nav className="flex flex-col py-4 px-4 sm:px-8 gap-2">
              <Link href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-teal-400 font-medium py-3 border-b border-slate-800/50 transition-colors">Features</Link>
              <Link href="/symptom-checker" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-teal-400 font-medium py-3 border-b border-slate-800/50 transition-colors">3D Body Explorer</Link>
              <Link href="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-teal-400 font-medium py-3 border-b border-slate-800/50 transition-colors">Find a Doctor</Link>
              <Link href="#telehealth" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-teal-400 font-medium py-3 border-b border-slate-800/50 transition-colors">Virtual Clinic</Link>
              <Link href="#faqs" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-teal-400 font-medium py-3 transition-colors">FAQs</Link>
            </nav>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 3. HERO SECTION (WITH EMBEDDED LOGIN & FLOATING TELEMETRY CARDS)          */}
      {/* ========================================================================= */}
      <main className="relative z-10">
        
        <section className="relative w-full pt-10 pb-20 md:pt-16 md:pb-28 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="grid gap-10 lg:grid-cols-12 items-center">
            
            {/* Left Hero Column: Headline, Description & CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center space-y-6 text-left">
              
              <div>
                <Badge className="bg-teal-950/80 text-teal-300 border border-teal-500/40 px-3.5 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-2 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Next-Gen 3D Healthcare &amp; Clinical Telehealth
                </Badge>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white leading-tight">
                Intelligent Care, <br />
                <span className="bg-gradient-to-r from-teal-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
                  Anytime, in High-<br />Definition 3D.
                </span>
              </h1>

              <p className="max-w-xl text-slate-300 text-sm sm:text-base leading-relaxed">
                Experience the ultimate fusion of artificial intelligence and clinical medicine. Triage symptoms, consult top-rated board-certified doctors in encrypted video rooms, and explore your personal health telemetry in 3D.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link href="/doctors">
                  <Button size="lg" className="w-full sm:w-auto bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold text-sm h-12 px-7 shadow-lg shadow-teal-500/30 flex items-center gap-2 cursor-pointer">
                    <Video className="w-4 h-4" />
                    Book 3D Video Visit →
                  </Button>
                </Link>
                <Link href="/symptom-checker">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-teal-500/40 bg-slate-900/60 hover:bg-teal-950/40 text-white font-bold text-sm h-12 px-7 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-teal-400" />
                    Launch 3D Explorer
                  </Button>
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs text-slate-400 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-400" />
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>100% Medical Council Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-teal-400" />
                  <span>256-Bit Encrypted Rooms</span>
                </div>
              </div>

            </div>

            {/* Right Hero Column: Embedded Login Card */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center">

              {/* Prominent Login Box (Exact replica from Screenshot) */}
              <div className="w-full max-w-md bg-slate-900/80 border border-teal-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md relative z-10 text-left space-y-4">
                
                <div className="text-center space-y-1">
                  <h3 className="text-xl font-extrabold text-white">Welcome back</h3>
                  <p className="text-xs text-slate-400">Sign in to access your healthcare portal</p>
                </div>

                {/* Role Pill Switcher */}
                <div className="grid grid-cols-2 p-1.5 bg-slate-950 border border-teal-500/30 rounded-2xl gap-1">
                  <button
                    type="button"
                    onClick={() => setLoginRole('patient')}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      !isDoctor
                        ? 'bg-teal-400 text-slate-950 shadow-md'
                        : 'text-slate-400 hover:text-white'
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
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    Doctor Login
                  </button>
                </div>

                <p className="text-[11px] text-teal-300 flex items-center justify-center gap-1.5 font-medium">
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
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
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
                      className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs h-10 shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
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

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. METRICS & STATS BAR (WITH SCROLL REVEAL)                               */}
        {/* ========================================================================= */}
        <ScrollReveal>
          <section className="w-full border-y border-teal-500/20 bg-slate-950/60 py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="flex flex-col items-center sm:items-start p-4 rounded-2xl bg-slate-900/80 border border-teal-500/30 shadow-sm">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">{stat.value}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium text-center sm:text-left">{stat.label}</span>
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
                <Badge className="bg-teal-950/80 text-teal-300 border border-teal-500/40 text-xs px-3 py-1">
                  Platform Capabilities
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Engineered for Complete Clinical Precision
                </h2>
                <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400">
                  Every feature is designed to connect patients with board-certified doctors in real time with security and clinical ease.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feat, i) => (
                  <Card key={i} className="border border-teal-500/30 bg-slate-900/80 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-400/60 transition-all flex flex-col justify-between">
                    <div className="space-y-4 text-left">
                      <div className="flex items-center justify-between">
                        <div className={`w-12 h-12 rounded-xl ${feat.bg} ${feat.color} flex items-center justify-center shadow-xs`}>
                          <feat.icon className="w-6 h-6" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-mono text-slate-400 border-slate-800">
                          {feat.tag}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold text-white">
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
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
          <section id="telehealth" className="w-full py-16 md:py-24 px-4 md:px-8 max-w-7xl mx-auto bg-slate-900/60 rounded-3xl border border-teal-500/30 my-8">
            <div className="grid lg:grid-cols-12 gap-10 items-center text-left">
              
              <div className="lg:col-span-6 space-y-6">
                <Badge className="bg-teal-950/80 text-teal-300 border border-teal-500/40 text-xs px-3 py-1">
                  Virtual Consultation Suite
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Hospital Quality Video Care, <br />
                  <span className="text-teal-400">Locked to the Exact Second.</span>
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Our custom WebRTC telehealth engine guarantees that both the doctor and patient are authenticated before a call begins. Strict server-side start-time locks prevent premature entries, while background sweepers ensure active consultations run smoothly.
                </p>

                <div className="space-y-3.5 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-teal-500/30">
                    <div className="p-2 rounded-lg bg-teal-950/80 text-teal-400 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Server-Side Time Locks</h4>
                      <p className="text-xs text-slate-400">Calls strictly unlock at the scheduled start time to respect doctor availability.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-teal-500/30">
                    <div className="p-2 rounded-lg bg-blue-950/80 text-blue-400 mt-0.5">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Automated Status Progression</h4>
                      <p className="text-xs text-slate-400">Transitions from CONFIRMED to IN_PROGRESS when both participants join, and COMPLETED when concluded.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Telehealth Mockup */}
              <div className="lg:col-span-6">
                <Card className="bg-slate-950 text-white rounded-2xl p-4 shadow-xl border border-teal-500/40 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-xs font-mono text-slate-400 ml-2 font-bold">room-vcon-encrypted.live</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 text-[10px] px-2">● Live HD Stream</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 aspect-video rounded-xl bg-slate-900 p-2 border border-slate-800 relative">
                    <div className="rounded-lg bg-gradient-to-br from-slate-900 to-teal-950 flex flex-col items-center justify-center p-3 relative border border-slate-800">
                      <div className="w-14 h-14 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        DP
                      </div>
                      <p className="text-xs font-bold text-white mt-2">Dr. Dharm Patel</p>
                      <p className="text-[10px] text-teal-400">General Physician</p>
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-green-400">
                        ● Audio Live
                      </div>
                    </div>

                    <div className="rounded-lg bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-3 relative border border-slate-800">
                      <div className="w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        PT
                      </div>
                      <p className="text-xs font-bold text-white mt-2">John Doe</p>
                      <p className="text-[10px] text-slate-400">Verified Patient</p>
                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-teal-400">
                        ● HD Connected
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span>Session: <strong className="text-white font-mono">Confirmed &amp; Live</strong></span>
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
              <Badge className="bg-teal-950/80 text-teal-300 border border-teal-500/40 text-xs px-3 py-1">
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Everything You Need to Know
              </h2>
            </div>

            <div className="space-y-3 text-left">
              {faqs.map((faq, i) => (
                <div 
                  key={i}
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="bg-slate-900/80 border border-teal-500/30 hover:border-teal-400 rounded-xl p-4 sm:p-5 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="font-bold text-sm sm:text-base text-white">{faq.q}</h4>
                    <span className="text-teal-400 text-lg font-bold">{activeFaq === i ? "−" : "+"}</span>
                  </div>
                  {activeFaq === i && (
                    <p className="text-xs sm:text-sm text-slate-300 mt-3 pt-3 border-t border-slate-800 leading-relaxed">
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
            <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 border border-teal-400/40 p-8 sm:p-14 rounded-3xl text-center space-y-6 shadow-2xl text-white">
              
              <div className="space-y-2">
                <Badge className="bg-white/20 text-white border-0 text-xs px-3 py-1">
                  Start Your 3D Consultation Today
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                  Your Health, in Expert Hands.
                </h2>
                <p className="max-w-xl mx-auto text-xs sm:text-sm text-teal-100">
                  Join thousands of patients receiving fast, certified care from top specialists. Book a video appointment in under a minute.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link href="/doctors">
                  <Button size="lg" className="w-full sm:w-auto bg-teal-400 text-slate-950 hover:bg-teal-300 font-extrabold text-sm h-12 px-8 shadow-md">
                    <Video className="w-4 h-4 mr-2 text-slate-950" />
                    Book 3D Video Consultation Now
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/40 bg-teal-950/60 hover:bg-teal-900 text-white font-bold text-sm h-12 px-8">
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
      <footer className="w-full border-t border-teal-500/20 bg-slate-950/90 py-12 px-4 md:px-8 text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-5 w-5 text-teal-400" />
              <span className="font-bold text-white text-sm">HealthConnect AI 3D</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Empowering patients and clinicians with intelligent telehealth, 3D bio-telemetry, and secure medical records.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Telehealth Portal</h4>
            <ul className="space-y-2">
              <li><Link href="/doctors" className="hover:text-teal-400">Find a Doctor</Link></li>
              <li><Link href="/patient/appointments" className="hover:text-teal-400">My Appointments</Link></li>
              <li><Link href="/patient/consultations" className="hover:text-teal-400">Tele-Consultations</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Specialists</h4>
            <ul className="space-y-2">
              <li><Link href="/doctors?specialty=General%20Physician" className="hover:text-teal-400">General Physicians</Link></li>
              <li><Link href="/doctors?specialty=Cardiologist" className="hover:text-teal-400">Cardiologists</Link></li>
              <li><Link href="/doctors?specialty=Dermatologist" className="hover:text-teal-400">Dermatologists</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-3">Compliance &amp; Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="hover:text-teal-400">HIPAA Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-teal-400">Terms of Medical Service</Link></li>
              <li><Link href="/consent" className="hover:text-teal-400">Telehealth Consent</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 text-center text-slate-500">
          © 2026 HealthConnect AI 3D Platform. All rights reserved. Encrypted 256-bit Healthcare Infrastructure.
        </div>
      </footer>

    </div>
  );
}
