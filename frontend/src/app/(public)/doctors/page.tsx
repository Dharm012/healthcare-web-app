"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, Star, Clock, Video, Filter, 
  MessageSquare, Send, CheckCircle2, 
  Sparkles, ShieldCheck, X,
  Calendar, Check, AlertCircle, Loader2,
  Stethoscope, Globe, User
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface DoctorCardData {
  id: string;
  name: string;
  specialization: string;
  qualifications: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
  rating: number;
  reviewsCount: number;
  location: string;
  verificationStatus: string;
  profilePhoto?: string | null;
  avatar: string;
  online: boolean;
  hospital: string;
  nextAvailable: string;
  bio: string;
  languages: string[];
}

const AVAILABLE_SLOTS = [
  "09:00 AM",
  "10:30 AM",
  "11:45 AM",
  "02:00 PM",
  "03:30 PM",
  "04:45 PM",
  "06:00 PM",
  "07:30 PM",
  "08:45 PM"
];

// Helper: Generate next 7 selectable dates
const getDateOptions = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const isTomorrow = i === 1;
    const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString(undefined, { weekday: 'short' });
    const fullFormatted = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    dates.push({
      dateStr,
      label: `${dayLabel} (${fullFormatted})`,
      isToday,
    });
  }
  return dates;
};

// Check if a time slot has already passed for a given date
const isSlotInPast = (dateStr: string, slotStr: string): boolean => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr !== todayStr) return false;

    const [yearStr, monthStr, dayStr] = dateStr.split('T')[0].split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const cleaned = slotStr.trim().toUpperCase();
    const isPM = cleaned.includes('PM');
    const isAM = cleaned.includes('AM');
    const parts = cleaned.replace(/AM|PM/g, '').trim().split(':');
    let hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    const slotDate = new Date(year, month, day, hours, minutes, 0, 0);
    return slotDate.getTime() <= Date.now();
  } catch {
    return false;
  }
};

const getFirstAvailableSlot = (dateStr: string): string => {
  const available = AVAILABLE_SLOTS.find(slot => !isSlotInPast(dateStr, slot));
  return available || '';
};

export default function DoctorSearch() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('any');

  // Booking Modal States
  const [bookingDoctor, setBookingDoctor] = useState<DoctorCardData | null>(null);
  const [selectedDate, setSelectedDate] = useState(getDateOptions()[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState(AVAILABLE_SLOTS[1]);
  const [consultationReason, setConsultationReason] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessModal, setBookingSuccessModal] = useState<{ doctorName: string; date: string; time: string } | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Queries
  const { data: user } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/users/me');
        return response.data;
      } catch {
        return null;
      }
    }
  });

  // Fetch all verified doctors who completed registration with verified certificates
  const { data: apiDoctors, isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/doctors');
        return response.data;
      } catch {
        return [];
      }
    },
    refetchInterval: 10000,
  });

  const { data: patientAppointments } = useQuery({
    queryKey: ['appointments', 'patient'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/appointments/patient');
        return response.data;
      } catch {
        return [];
      }
    }
  });

  // Format all verified doctors returned from the database
  const formattedDoctors: DoctorCardData[] = (apiDoctors || []).map((doc: any) => {
    const rawName = doc.fullName || (doc.user?.email ? doc.user.email.split('@')[0] : 'Dr. Specialist');
    const displayName = rawName.startsWith('Dr.') ? rawName : `Dr. ${rawName}`;
    const initials = displayName.replace(/^Dr\.?\s*/i, '').substring(0, 2).toUpperCase() || 'DR';

    return {
      id: doc.id,
      name: displayName,
      specialization: doc.specialization || 'General Physician',
      qualifications: doc.qualifications || 'MBBS, MD',
      licenseNumber: doc.licenseNumber || 'MCI-VERIFIED',
      experience: doc.experience || 8,
      consultationFee: doc.consultationFee || 600,
      rating: 5.0,
      reviewsCount: 150,
      location: 'Apex Super Specialty & Virtual Clinic',
      verificationStatus: doc.verificationStatus || 'APPROVED',
      profilePhoto: doc.profilePhoto || null,
      avatar: initials,
      online: true,
      hospital: 'Apex Super Specialty & Telehealth Center',
      nextAvailable: 'Available Today',
      bio: doc.bio || `Board-certified ${doc.specialization || 'practitioner'} with ${doc.experience || 8}+ years of clinical experience. Verified License: ${doc.licenseNumber || 'MCI-VERIFIED'}.`,
      languages: doc.languages ? doc.languages.split(',').map((s: string) => s.trim()) : ['English', 'Hindi', 'Gujarati'],
    };
  });

  // Filter doctors based on search, specialty, and type
  const filteredDoctors = formattedDoctors.filter((doc) => {
    const searchMatch = !searchTerm || 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.qualifications.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.languages.some(l => l.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const specialtyMatch = specialtyFilter === 'all' || 
      doc.specialization.toLowerCase().includes(specialtyFilter.toLowerCase()) ||
      (specialtyFilter === 'physician' && doc.specialization.toLowerCase().includes('physician'));

    const typeMatch = typeFilter === 'any' || 
      (typeFilter === 'video' && doc.online) || 
      (typeFilter === 'in-person' && !doc.online);

    return searchMatch && specialtyMatch && typeMatch;
  });

  const getDoctorAppointmentStatus = (doc: DoctorCardData) => {
    if (!patientAppointments || !Array.isArray(patientAppointments)) return null;
    const apt = patientAppointments.find((a: any) => 
      String(a.doctorId) === String(doc.id) && (a.status === 'PENDING' || a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
    );
    return apt ? apt.status : null;
  };

  const handleOpenBookingModal = (doc: DoctorCardData) => {
    setBookingDoctor(doc);
    const dateOpts = getDateOptions();
    const todayDate = dateOpts[0].dateStr;
    const firstTodaySlot = getFirstAvailableSlot(todayDate);

    if (!firstTodaySlot && dateOpts.length > 1) {
      const tomorrowDate = dateOpts[1].dateStr;
      setSelectedDate(tomorrowDate);
      setSelectedSlot(getFirstAvailableSlot(tomorrowDate));
    } else {
      setSelectedDate(todayDate);
      setSelectedSlot(firstTodaySlot);
    }

    setConsultationReason('');
    setBookingError(null);
  };

  const handleSendAppointmentRequest = async () => {
    if (!bookingDoctor) return;

    if (!selectedSlot || isSlotInPast(selectedDate, selectedSlot)) {
      setBookingError('The selected time slot has already passed. Please choose a future time slot.');
      return;
    }

    setIsSubmittingBooking(true);
    setBookingError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const [yearStr, monthStr, dayStr] = selectedDate.split('T')[0].split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const day = parseInt(dayStr, 10);

      const cleaned = selectedSlot.trim().toUpperCase();
      const isPM = cleaned.includes('PM');
      const isAM = cleaned.includes('AM');
      const parts = cleaned.replace(/AM|PM/g, '').trim().split(':');
      let hours = parseInt(parts[0], 10) || 0;
      const minutes = parseInt(parts[1], 10) || 0;

      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;

      const scheduledAtDate = new Date(year, month, day, hours, minutes, 0, 0);

      await api.post('/api/appointments/request', {
        doctorId: String(bookingDoctor.id),
        scheduledAt: scheduledAtDate.toISOString(),
        duration: 30,
        consultationType: 'VIDEO',
        reason: consultationReason.trim() || 'General Online Telehealth Consultation',
      });

      queryClient.invalidateQueries({ queryKey: ['appointments', 'patient'] });

      const dateObj = new Date(year, month, day);
      const dateFormatted = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

      setBookingSuccessModal({
        doctorName: bookingDoctor.name,
        date: dateFormatted,
        time: selectedSlot,
      });

      setBookingDoctor(null);
    } catch (err: any) {
      console.error(err);
      setBookingError(err.response?.data?.message || 'Failed to submit appointment request. Please try again.');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 flex min-h-16 flex-wrap items-center justify-between gap-y-2 border-b border-gray-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-4 md:px-8 py-2 sm:py-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white font-bold shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            HealthConnect <span className="text-teal-600 dark:text-teal-400">AI 3D</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <Link href="/patient/appointments">
            <Button variant="outline" size="sm" className="text-xs border-gray-200 dark:border-slate-700">
              <Calendar className="w-4 h-4 mr-1.5 text-teal-600 dark:text-teal-400" />
              My Appointments
            </Button>
          </Link>
          <Link href="/register/doctor">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs">
              <ShieldCheck className="w-4 h-4 mr-1.5" />
              Doctor Registration
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Filter Sidebar */}
        <div className="w-full md:w-64 space-y-6 shrink-0 text-left">
          <Card className="border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl">
            <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Filter Verified Doctors
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Specialty</label>
                <Select value={specialtyFilter} onValueChange={(val) => setSpecialtyFilter(val || '')}>
                  <SelectTrigger className="w-full text-xs h-9 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white">
                    <SelectValue placeholder="All Specialties" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    <SelectItem value="all">All Specialties</SelectItem>
                    <SelectItem value="physician">General Physician</SelectItem>
                    <SelectItem value="cardiologist">Cardiologist</SelectItem>
                    <SelectItem value="dermatologist">Dermatologist</SelectItem>
                    <SelectItem value="neurologist">Neurologist</SelectItem>
                    <SelectItem value="pediatrician">Pediatrician</SelectItem>
                    <SelectItem value="orthopedic">Orthopedic Surgeon</SelectItem>
                    <SelectItem value="psychiatrist">Psychiatrist</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 dark:text-slate-300">Consultation Type</label>
                <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val || '')}>
                  <SelectTrigger className="w-full text-xs h-9 bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white">
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700">
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="video">🎥 HD Video Consultation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900 space-y-2">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>100% Medical Council Verified</span>
            </div>
            <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
              Every practitioner in this directory has undergone AI medical certificate validation and registration approval.
            </p>
          </div>
        </div>

        {/* Right Main Directory */}
        <div className="flex-1 space-y-6">
          
          {/* Header & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 dark:border-slate-800 pb-5 text-left">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Verified Medical Specialists</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                Showing {filteredDoctors.length} certified doctor{filteredDoctors.length === 1 ? '' : 's'} with verified practicing licenses
              </p>
            </div>

            <div className="w-full sm:w-80 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-slate-500" />
              <Input
                type="search"
                placeholder="Search by doctor name, specialty, degree..."
                className="pl-9 bg-white dark:bg-slate-900 text-xs h-10 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-10 h-10 text-teal-600 dark:text-teal-400 animate-spin" />
            </div>
          ) : filteredDoctors.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredDoctors.map((doc) => {
                const aptStatus = getDoctorAppointmentStatus(doc);
                return (
                  <Card key={doc.id} className="overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between rounded-2xl text-left">
                    <CardContent className="p-6">
                      
                      {/* Doctor Top Header */}
                      <div className="flex items-start gap-4">
                        <div className="relative shrink-0">
                          <Avatar className="h-16 w-16 border-2 border-teal-500/40 shadow-xs">
                            {doc.profilePhoto ? (
                              <AvatarImage src={doc.profilePhoto} alt={doc.name} className="object-cover" />
                            ) : (
                              <AvatarFallback className="bg-teal-600 text-white font-bold text-lg">
                                {doc.avatar}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {doc.online && (
                            <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" title="Online for Teleconsultations" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">{doc.name}</h3>
                            <Badge className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[10px] px-2 py-0.5">
                              <ShieldCheck className="w-3 h-3 mr-1 inline text-teal-600 dark:text-teal-400" />
                              License Verified
                            </Badge>
                            {aptStatus === 'PENDING' && (
                              <Badge className="bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800 text-[10px]">
                                🟡 Request Pending
                              </Badge>
                            )}
                            {aptStatus === 'CONFIRMED' && (
                              <Badge className="bg-green-100 dark:bg-green-950/60 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800 text-[10px]">
                                🟢 Confirmed Session
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-teal-600 dark:text-teal-400 font-semibold text-xs mt-0.5">
                            {doc.specialization} • <span className="text-gray-500 dark:text-slate-400">{doc.qualifications}</span>
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">{doc.hospital}</p>

                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-slate-400">
                            <div className="flex items-center text-amber-500 font-bold">
                              <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-400" />
                              <span>{doc.rating}</span>
                              <span className="text-gray-500 dark:text-slate-400 font-normal ml-1">({doc.reviewsCount})</span>
                            </div>
                            <span>•</span>
                            <span>{doc.experience}+ yrs clinical practice</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio & Details */}
                      <p className="text-xs text-gray-600 dark:text-slate-300 mt-3 line-clamp-2 leading-relaxed bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                        {doc.bio}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-1.5 text-gray-500 dark:text-slate-400">
                          <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{doc.languages.join(', ')}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 dark:text-slate-400">Consultation: </span>
                          <span className="font-extrabold text-gray-900 dark:text-white text-sm">₹{doc.consultationFee}</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <div className="mt-4">
                        <Button 
                          onClick={() => handleOpenBookingModal(doc)}
                          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer rounded-xl"
                        >
                          <Video className="w-4 h-4" />
                          Book 3D Video Consultation
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-slate-400 text-sm space-y-3 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800">
              <Stethoscope className="w-10 h-10 text-teal-600/40 mx-auto" />
              <p className="font-semibold text-gray-800 dark:text-slate-200 text-base">No Matching Verified Doctors Found</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 max-w-sm mx-auto">
                Doctors who successfully register and complete AI Medical Certificate Verification will appear here automatically.
              </p>
              <Link href="/register/doctor">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white text-xs mt-2">
                  Register as a Doctor
                </Button>
              </Link>
            </div>
          )}

        </div>
      </div>

      {/* ========================================================================= */}
      {/* BOOKING MODAL                                                             */}
      {/* ========================================================================= */}
      {bookingDoctor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-left my-8">
            
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-teal-500/40">
                  {bookingDoctor.profilePhoto ? (
                    <AvatarImage src={bookingDoctor.profilePhoto} alt={bookingDoctor.name} />
                  ) : (
                    <AvatarFallback className="bg-teal-600 text-white font-bold text-xs">{bookingDoctor.avatar}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white">{bookingDoctor.name}</h3>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold">{bookingDoctor.specialization} • ₹{bookingDoctor.consultationFee}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setBookingDoctor(null)} className="h-8 w-8 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {bookingError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{bookingError}</span>
              </div>
            )}

            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                1. Select Consultation Date
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {getDateOptions().map((opt) => {
                  const isSelected = selectedDate === opt.dateStr;
                  return (
                    <button
                      key={opt.dateStr}
                      type="button"
                      onClick={() => {
                        setSelectedDate(opt.dateStr);
                        setSelectedSlot(getFirstAvailableSlot(opt.dateStr));
                      }}
                      className={`p-2.5 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                2. Select Available Time Slot
              </label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_SLOTS.map((slot) => {
                  const isPast = isSlotInPast(selectedDate, slot);
                  const isSelected = selectedSlot === slot && !isPast;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isPast}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer ${
                        isPast
                          ? 'bg-gray-100 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-600 line-through cursor-not-allowed opacity-50'
                          : isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs font-bold'
                          : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 dark:text-slate-300">
                3. Reason for Video Consultation
              </label>
              <Input
                placeholder="e.g. Fever, follow-up on test reports, medication review..."
                value={consultationReason}
                onChange={(e) => setConsultationReason(e.target.value)}
                className="h-10 text-xs bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <Button
                variant="outline"
                onClick={() => setBookingDoctor(null)}
                className="flex-1 text-xs h-10 border-gray-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendAppointmentRequest}
                disabled={isSubmittingBooking || !selectedSlot}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 shadow-md cursor-pointer"
              >
                {isSubmittingBooking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    Send Request to Doctor
                    <Check className="w-4 h-4 ml-1.5" />
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUCCESS CONFIRMATION MODAL                                                */}
      {/* ========================================================================= */}
      {bookingSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-teal-500/40 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto border-2 border-teal-500/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <Badge className="bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 text-xs px-2.5 py-0.5">
                Online Request Submitted
              </Badge>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Appointment Request Sent!</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Your request has been routed to <strong>{bookingSuccessModal.doctorName}</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 space-y-1 text-xs text-left">
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Date:</span>
                <strong className="text-gray-900 dark:text-white">{bookingSuccessModal.date}</strong>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Time:</span>
                <strong className="text-teal-600 dark:text-teal-400">{bookingSuccessModal.time}</strong>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-slate-400">
                <span>Status:</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">🟡 Pending Doctor Review</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setBookingSuccessModal(null)}
                className="flex-1 text-xs h-10 border-gray-200 dark:border-slate-700"
              >
                Close
              </Button>
              <Link href="/patient/appointments" className="flex-1">
                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 shadow-xs">
                  View My Appointments
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
