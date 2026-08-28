"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Lock, ShieldCheck, 
  Clock, AlertTriangle, CheckCircle2, User, MessageSquare, 
  FileText, Loader2, ArrowLeft, Pill, Send, Copy, Check, Users,
  Plus, Trash2, Edit3, Save, Share2, Info, AlertCircle, Calendar,
  Sparkles, Stethoscope, ChevronRight, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const COMMON_MEDICINES = [
  'Paracetamol 500mg',
  'Amoxicillin 500mg',
  'Atorvastatin 20mg',
  'Metformin 500mg',
  'Pantoprazole 40mg',
  'Cetirizine 10mg',
  'Azithromycin 500mg',
  'Lisinopril 10mg',
  'Ibuprofen 400mg',
  'Omeprazole 20mg',
  'Montelukast 10mg',
  'Vitamin D3 60,000 IU',
];

const TIME_PRESETS = [
  { label: 'Morning', time: '08:00 AM' },
  { label: 'Afternoon', time: '02:00 PM' },
  { label: 'Evening', time: '06:00 PM' },
  { label: 'Night', time: '08:00 PM' },
  { label: 'Bedtime', time: '10:00 PM' },
];

const INSTRUCTION_PRESETS = [
  'Take after food',
  'Take before food (empty stomach)',
  'Take before sleeping',
  'Take with plenty of water',
  'Take at first sign of pain',
];

interface MedicineItem {
  id?: string;
  medicineName: string;
  medicineType: string;
  dosage: string;
  frequency: string;
  timing: string[];
  durationDays: number;
  duration: string;
  startDate: string;
  instructions: string;
}

export default function VideoConsultationRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;

  const [loading, setLoading] = useState(true);
  const [authData, setAuthData] = useState<any>(null);
  const [errorState, setErrorState] = useState<{
    code: string;
    message: string;
    scheduledAt?: string;
    remainingSeconds?: number;
  } | null>(null);

  const [countdown, setCountdown] = useState<number>(0);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [hasRemoteStream, setHasRemoteStream] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<'chat' | 'medicines' | 'prescription' | 'patient_info'>('medicines');
  
  // Chat state
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string; type?: string; metadata?: any }[]>([
    { sender: 'System', text: 'Encrypted 256-bit WebRTC Teleconsultation Room initialized.', time: 'Now' }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  // Call status
  const [isEnding, setIsEnding] = useState(false);
  const [callEndedByRemote, setCallEndedByRemote] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // =========================================================================
  // PRESCRIPTION & MEDICINES STATE
  // =========================================================================
  const [prescriptionData, setPrescriptionData] = useState<any>(null);
  const [diagnosis, setDiagnosis] = useState<string>('General Clinical Tele-Consultation');
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [showEndCallUnfinishedModal, setShowEndCallUnfinishedModal] = useState(false);

  // Form State for Adding/Editing a Medicine
  const [showAddMedForm, setShowAddMedForm] = useState(false);
  const [editingMedIndex, setEditingMedIndex] = useState<number | null>(null);
  const [medName, setMedName] = useState('');
  const [medType, setMedType] = useState('TABLET');
  const [medDosage, setMedDosage] = useState('1 tablet');
  const [medFrequency, setMedFrequency] = useState('Twice daily');
  const [medTimings, setMedTimings] = useState<string[]>(['08:00 AM', '08:00 PM']);
  const [medDurationDays, setMedDurationDays] = useState(5);
  const [medStartDate, setMedStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [medInstructions, setMedInstructions] = useState('Take after food');
  const [customTimeInput, setCustomTimeInput] = useState('');

  // Media & WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stop all camera and microphone hardware tracks immediately
  const stopAllMediaTracks = useCallback(() => {
    console.log('Stopping all camera and microphone hardware tracks...');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { console.error('Error stopping track:', e); }
      });
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) { console.error('Error stopping remote track:', e); }
      });
      remoteStreamRef.current = null;
    }

    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (peerConnectionRef.current) {
      try { peerConnectionRef.current.close(); } catch {}
      peerConnectionRef.current = null;
    }
    setHasRemoteStream(false);
  }, []);

  // 1. Fetch prescription draft for room
  const loadRoomPrescription = useCallback(async () => {
    try {
      const res = await api.get(`/api/prescriptions/room/${roomId}`);
      if (res.data?.prescription) {
        const rx = res.data.prescription;
        setPrescriptionData(rx);
        if (rx.diagnosis) setDiagnosis(rx.diagnosis);
        if (rx.notes) setClinicalNotes(rx.notes);

        if (rx.medications && Array.isArray(rx.medications)) {
          const formattedMeds: MedicineItem[] = rx.medications.map((m: any) => {
            let timings: string[] = ['09:00 AM'];
            try {
              timings = JSON.parse(m.timing || '["09:00 AM"]');
            } catch {
              timings = [m.timing || '09:00 AM'];
            }
            return {
              id: m.id,
              medicineName: m.medicineName,
              medicineType: m.medicineType || 'TABLET',
              dosage: m.dosage,
              frequency: m.frequency,
              timing: timings,
              durationDays: m.durationDays || 5,
              duration: m.duration || `${m.durationDays || 5} days`,
              startDate: m.startDate ? m.startDate.split('T')[0] : new Date().toISOString().split('T')[0],
              instructions: m.instructions || 'Take after food',
            };
          });
          setMedicines(formattedMeds);
        }
      }
    } catch (err) {
      console.error('Error loading room prescription:', err);
    }
  }, [roomId]);

  // 2. Debounced Autosave to Backend
  const triggerAutosave = useCallback((updatedMeds: MedicineItem[], currentDiagnosis: string, currentNotes: string) => {
    if (authData?.role !== 'DOCTOR') return;
    if (prescriptionData?.status === 'FINALIZED') return;

    setSaveStatus('saving');
    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(async () => {
      try {
        const payload = {
          diagnosis: currentDiagnosis,
          notes: currentNotes,
          medicines: updatedMeds.map(m => ({
            medicineName: m.medicineName,
            medicineType: m.medicineType,
            dosage: m.dosage,
            frequency: m.frequency,
            timing: m.timing,
            durationDays: m.durationDays,
            duration: m.duration || `${m.durationDays} days`,
            startDate: m.startDate,
            instructions: m.instructions,
          })),
        };

        const res = await api.post(`/api/prescriptions/room/${roomId}/save-draft`, payload);
        setPrescriptionData(res.data);
        setSaveStatus('saved');

        // Sync via WebSockets
        if (socketRef.current) {
          socketRef.current.emit('prescription-sync', { roomId, prescription: res.data });
        }
      } catch (err) {
        console.error('Autosave error:', err);
        setSaveStatus('error');
      }
    }, 600);
  }, [authData?.role, prescriptionData?.status, roomId]);

  // 3. Verify Room Authorization
  const verifyRoomAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/appointments/room/${roomId}/auth`);
      setAuthData(res.data);
      setErrorState(null);

      // Default tab based on role
      if (res.data?.role === 'DOCTOR') {
        setSidebarTab('medicines');
      } else {
        setSidebarTab('chat');
      }

      // Load Prescription
      await loadRoomPrescription();
    } catch (err: any) {
      const errResponse = err.response?.data;
      if (errResponse?.reason === 'EARLY_JOIN_BLOCKED') {
        setErrorState({
          code: 'EARLY_JOIN_BLOCKED',
          message: errResponse.message || 'Consultation cannot start before scheduled start time.',
          scheduledAt: errResponse.scheduledAt,
          remainingSeconds: errResponse.remainingSeconds || 60,
        });
        setCountdown(errResponse.remainingSeconds || 60);
      } else if (errResponse?.reason === 'EXPIRED') {
        setErrorState({
          code: 'EXPIRED',
          message: errResponse.message || 'This consultation has expired.',
        });
      } else if (errResponse?.reason === 'UNAUTHORIZED') {
        setErrorState({
          code: 'UNAUTHORIZED',
          message: errResponse.message || 'You are not authorized to join this room.',
        });
      } else {
        setErrorState({
          code: 'ERROR',
          message: errResponse?.message || 'Failed to connect to consultation room.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      verifyRoomAuth();
    }
  }, [roomId]);

  // Live countdown timer for early entry lock
  useEffect(() => {
    if (errorState?.code === 'EARLY_JOIN_BLOCKED' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            verifyRoomAuth();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [errorState?.code, countdown]);

  // Live call duration timer when admitted
  useEffect(() => {
    if (authData?.allowed && !callEndedByRemote) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [authData?.allowed, callEndedByRemote]);

  // =========================================================================
  // WebRTC INITIALIZATION & SIGNALING
  // =========================================================================
  useEffect(() => {
    if (!authData?.allowed || !roomId) return;

    let isMounted = true;
    const bc = new BroadcastChannel(`healthconnect_room_${roomId}`);
    broadcastChannelRef.current = bc;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    const createPeerConnection = (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setHasRemoteStream(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateData = { roomId, candidate: event.candidate };
          socket.emit('ice-candidate', candidateData);
          bc.postMessage({ type: 'ice-candidate', candidate: event.candidate });
        }
      };

      return pc;
    };

    const initiateCall = async (pc: RTCPeerConnection) => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer, senderRole: authData?.role });
        bc.postMessage({ type: 'offer', offer, senderRole: authData?.role });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    navigator.mediaDevices?.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      audio: true,
    })
      .then(async (stream) => {
        if (!isMounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        const pc = createPeerConnection(stream);

        socket.emit('join-room', {
          roomId,
          role: authData?.role,
          name: authData?.role === 'DOCTOR' ? (authData?.doctorName || 'Doctor') : (authData?.patientEmail || 'Patient'),
        });

        bc.postMessage({ type: 'user-joined', role: authData?.role });

        const handleSignalData = async (type: string, data: any) => {
          try {
            if (type === 'user-joined') {
              await initiateCall(pc);
            } else if (type === 'offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socket.emit('answer', { roomId, answer });
              bc.postMessage({ type: 'answer', answer });
            } else if (type === 'answer') {
              if (pc.signalingState !== 'stable') {
                await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
              }
            } else if (type === 'ice-candidate' && data.candidate) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
              } catch (e) {
                console.error('Error adding ICE candidate:', e);
              }
            } else if (type === 'call-ended') {
              setCallEndedByRemote(true);
              stopAllMediaTracks();
            } else if (type === 'in-call-message') {
              setChatMessages(prev => [...prev, data]);
            } else if (type === 'prescription-sync') {
              if (authData?.role === 'PATIENT' && data.prescription) {
                setPrescriptionData(data.prescription);
              }
            } else if (type === 'prescription-finalized') {
              setPrescriptionData(data.prescription);
              toast.add({
                title: 'Prescription Finalized',
                description: 'The doctor has finalized the digital prescription for this consultation.',
                type: 'success',
              });
            }
          } catch (e) {
            console.error('Signaling handling error:', e);
          }
        };

        socket.on('user-joined', (d) => handleSignalData('user-joined', d));
        socket.on('offer', (d) => handleSignalData('offer', d));
        socket.on('answer', (d) => handleSignalData('answer', d));
        socket.on('ice-candidate', (d) => handleSignalData('ice-candidate', d));
        socket.on('call-ended', (d) => handleSignalData('call-ended', d));
        socket.on('in-call-message', (d) => handleSignalData('in-call-message', d));
        socket.on('prescription-sync', (d) => handleSignalData('prescription-sync', d));
        socket.on('prescription-finalized', (d) => handleSignalData('prescription-finalized', d));

        bc.onmessage = (event) => {
          const { type, ...rest } = event.data;
          handleSignalData(type, rest);
        };
      })
      .catch((err) => {
        console.error('Camera/Microphone permission denied:', err);
      });

    const handleBeforeUnload = () => {
      stopAllMediaTracks();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      isMounted = false;
      window.removeEventListener('beforeunload', handleBeforeUnload);
      stopAllMediaTracks();
      socket.disconnect();
      bc.close();
    };
  }, [authData?.allowed, roomId, stopAllMediaTracks]);

  // Toggle Video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = !isVideoOn));
      setIsVideoOn(!isVideoOn);
    }
  };

  // Toggle Audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = !isMicOn));
      setIsMicOn(!isMicOn);
    }
  };

  // Time Chip Toggle in Add Form
  const toggleTiming = (timeStr: string) => {
    if (medTimings.includes(timeStr)) {
      if (medTimings.length > 1) {
        setMedTimings(medTimings.filter(t => t !== timeStr));
      }
    } else {
      setMedTimings([...medTimings, timeStr]);
    }
  };

  const handleAddCustomTime = () => {
    if (!customTimeInput.trim()) return;
    if (!medTimings.includes(customTimeInput.trim())) {
      setMedTimings([...medTimings, customTimeInput.trim()]);
    }
    setCustomTimeInput('');
  };

  // Open Form to Add or Edit
  const openAddMedicine = () => {
    setEditingMedIndex(null);
    setMedName('');
    setMedType('TABLET');
    setMedDosage('1 tablet');
    setMedFrequency('Twice daily');
    setMedTimings(['08:00 AM', '08:00 PM']);
    setMedDurationDays(5);
    setMedStartDate(new Date().toISOString().split('T')[0]);
    setMedInstructions('Take after food');
    setShowAddMedForm(true);
  };

  const openEditMedicine = (index: number) => {
    const med = medicines[index];
    setEditingMedIndex(index);
    setMedName(med.medicineName);
    setMedType(med.medicineType || 'TABLET');
    setMedDosage(med.dosage);
    setMedFrequency(med.frequency);
    setMedTimings(med.timing || ['08:00 AM']);
    setMedDurationDays(med.durationDays || 5);
    setMedStartDate(med.startDate || new Date().toISOString().split('T')[0]);
    setMedInstructions(med.instructions || 'Take after food');
    setShowAddMedForm(true);
  };

  // Save Form Entry into Medicines Array
  const handleSaveMedicineItem = () => {
    if (!medName.trim()) {
      toast.add({ title: 'Validation Error', description: 'Medicine name is required.', type: 'error' });
      return;
    }
    if (!medDosage.trim()) {
      toast.add({ title: 'Validation Error', description: 'Dosage is required.', type: 'error' });
      return;
    }
    if (medDurationDays <= 0) {
      toast.add({ title: 'Validation Error', description: 'Duration must be at least 1 day.', type: 'error' });
      return;
    }

    const newItem: MedicineItem = {
      medicineName: medName.trim(),
      medicineType: medType,
      dosage: medDosage.trim(),
      frequency: medFrequency,
      timing: medTimings,
      durationDays: medDurationDays,
      duration: `${medDurationDays} days`,
      startDate: medStartDate,
      instructions: medInstructions.trim(),
    };

    let updated: MedicineItem[];
    if (editingMedIndex !== null) {
      updated = [...medicines];
      updated[editingMedIndex] = newItem;
    } else {
      updated = [...medicines, newItem];
    }

    setMedicines(updated);
    setShowAddMedForm(false);
    setEditingMedIndex(null);

    // Trigger Autosave
    triggerAutosave(updated, diagnosis, clinicalNotes);
  };

  // Remove a Medicine
  const handleRemoveMedicine = (index: number) => {
    const updated = medicines.filter((_, i) => i !== index);
    setMedicines(updated);
    triggerAutosave(updated, diagnosis, clinicalNotes);
  };

  // Finalize Prescription Action
  const handleFinalizePrescription = async () => {
    if (medicines.length === 0) {
      toast.add({ title: 'Cannot Finalize', description: 'Please add at least one medicine before finalizing.', type: 'warning' });
      return;
    }

    setIsFinalizing(true);
    try {
      // First save latest draft
      await api.post(`/api/prescriptions/room/${roomId}/save-draft`, {
        diagnosis,
        notes: clinicalNotes,
        medicines,
      });

      const res = await api.post(`/api/prescriptions/room/${roomId}/finalize`);
      setPrescriptionData(res.data);
      setShowFinalizeModal(false);

      toast.add({
        title: 'Prescription Finalized',
        description: 'Prescription locked. It will be activated and sent to the patient when the call ends.',
        type: 'success',
      });

      if (socketRef.current) {
        socketRef.current.emit('prescription-finalized', { roomId, prescription: res.data });
      }
    } catch (err: any) {
      toast.add({
        title: 'Finalization Failed',
        description: err.response?.data?.message || 'Error finalizing prescription.',
        type: 'error',
      });
    } finally {
      setIsFinalizing(false);
    }
  };

  // Reopen Prescription for Edits
  const handleReopenPrescription = async () => {
    try {
      const res = await api.post(`/api/prescriptions/room/${roomId}/reopen`);
      setPrescriptionData(res.data);
      toast.add({ title: 'Prescription Unlocked', description: 'You can now add or edit medicines.', type: 'info' });
    } catch (err: any) {
      toast.add({ title: 'Error', description: err.response?.data?.message || 'Failed to reopen prescription', type: 'error' });
    }
  };

  // Share Prescription in In-Call Chat
  const handleSharePrescriptionInChat = () => {
    if (medicines.length === 0) {
      toast.add({ title: 'No Medicines', description: 'Add medicines first before sharing in chat.', type: 'warning' });
      return;
    }

    const shareMsg = {
      roomId,
      sender: authData?.role === 'DOCTOR' ? (authData?.doctorName || 'Dr. Dharm Patel') : 'Doctor',
      text: `💊 Prescription Shared: Dr. ${authData?.doctorName || 'Doctor'} prescribed ${medicines.length} medicine(s).`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'PRESCRIPTION_SHARE',
      metadata: {
        diagnosis,
        count: medicines.length,
        medicines: medicines.map(m => `${m.medicineName} (${m.dosage}) - ${m.frequency}`),
      },
    };

    if (socketRef.current) {
      socketRef.current.emit('in-call-message', shareMsg);
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage(shareMsg);
    }
    setChatMessages(prev => [...prev, shareMsg]);
    toast.add({ title: 'Prescription Shared', description: 'Prescription summary shared to room chat.', type: 'success' });
  };

  // End Call Interceptor
  const handleEndCallClick = () => {
    if (authData?.role === 'DOCTOR' && medicines.length > 0 && prescriptionData?.status === 'DRAFT') {
      setShowEndCallUnfinishedModal(true);
    } else {
      executeEndCall();
    }
  };

  const executeEndCall = async () => {
    setIsEnding(true);
    try {
      if (socketRef.current) {
        socketRef.current.emit('end-call', { roomId, senderRole: authData?.role });
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'call-ended', senderRole: authData?.role });
      }

      stopAllMediaTracks();
      await api.post(`/api/appointments/room/${roomId}/end`);

      toast.add({
        title: 'Consultation Concluded',
        description: 'Session ended successfully. Camera hardware is turned off.',
        type: 'success',
      });

      if (authData?.role === 'DOCTOR') {
        router.push('/doctor/dashboard');
      } else {
        router.push('/patient/dashboard');
      }
    } catch {
      stopAllMediaTracks();
      router.push(authData?.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      roomId,
      sender: authData?.role === 'DOCTOR' ? (authData?.doctorName || 'Doctor') : (authData?.patientEmail?.split('@')[0] || 'Patient'),
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (socketRef.current) socketRef.current.emit('in-call-message', newMsg);
    if (broadcastChannelRef.current) broadcastChannelRef.current.postMessage({ type: 'in-call-message', ...newMsg });
    setChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // 1. LOADING STATE
  // =========================================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080d] text-white flex flex-col items-center justify-center p-6 space-y-4">
        <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
        <p className="text-sm font-semibold text-slate-300">Verifying consultation security credentials &amp; start time...</p>
      </div>
    );
  }

  // =========================================================================
  // 2. REMOTE PARTICIPANT CONCLUDED CALL SCREEN
  // =========================================================================
  if (callEndedByRemote) {
    return (
      <div className="min-h-screen bg-[#05080d] text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/90 border border-teal-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/40">
            <CheckCircle2 className="w-8 h-8 text-teal-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Consultation Concluded</h2>
            <p className="text-xs text-slate-300">
              The consultation session has ended. Your camera and microphone have been safely turned off.
            </p>
          </div>
          <Link href={authData?.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/dashboard'}>
            <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10 cursor-pointer">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. START TIME LOCK (PREVENT PREMATURE ENTRY)
  // =========================================================================
  if (errorState?.code === 'EARLY_JOIN_BLOCKED') {
    return (
      <div className="min-h-screen bg-[#05080d] text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-lg w-full bg-slate-900/90 border border-amber-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40">
            <Lock className="w-8 h-8 text-amber-300" />
          </div>
          <div className="space-y-2">
            <Badge className="bg-amber-950 text-amber-300 border-amber-500/40 text-xs px-3 py-1">
              Start Time Lock Active
            </Badge>
            <h2 className="text-2xl font-extrabold text-white">Room Unlocks at Scheduled Time</h2>
            <p className="text-xs text-slate-300">
              To respect practitioner schedules, this HD teleconsultation room unlocks strictly at the exact appointment start time.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <p className="text-[11px] text-slate-400">Scheduled Time</p>
            <p className="text-sm font-mono font-bold text-teal-400">
              {new Date(errorState.scheduledAt || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
            Unlocking automatically in: <strong className="text-white text-base">{countdown}s</strong>
          </div>
          <Button onClick={verifyRoomAuth} className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10 cursor-pointer">
            Check Room Status Now
          </Button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. EXPIRED ROOM OR ERROR
  // =========================================================================
  if (errorState) {
    return (
      <div className="min-h-screen bg-[#05080d] text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/90 border border-red-500/40 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
            <AlertTriangle className="w-8 h-8 text-red-300" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Access Denied / Expired</h2>
            <p className="text-xs text-slate-300">{errorState.message}</p>
          </div>
          <Link href="/doctors">
            <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10">
              Book New Appointment
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isDoctor = authData?.role === 'DOCTOR';
  const remoteParticipantName = isDoctor ? (authData?.patientEmail?.split('@')[0] || 'Patient') : (authData?.doctorName || 'Dr. Dharm Patel');
  const remoteParticipantRole = isDoctor ? 'Patient' : 'Doctor';
  const isFinalized = prescriptionData?.status === 'FINALIZED' || prescriptionData?.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-[#05080d] text-white flex flex-col justify-between overflow-hidden">
      
      {/* Top Telehealth Control Bar */}
      <header className="h-16 border-b border-teal-500/20 bg-slate-950/90 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-bold">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-white">
                Teleconsultation with {remoteParticipantName}
              </h3>
              <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/40 text-[9px] px-1.5 py-0">
                {hasRemoteStream ? '● Live HD' : '○ Waiting for Peer'}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">Room: {roomId}</p>
          </div>
        </div>

        {/* Center Live Elapsed Duration */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 border border-teal-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-teal-300">
          <Clock className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span>Elapsed: <strong>{formatTimer(callDuration)}</strong> / {authData?.duration || 30}m</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {isDoctor && (
            <div className="hidden md:flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg border border-slate-800 bg-slate-900">
              <span className={`w-2 h-2 rounded-full ${
                saveStatus === 'saved' ? 'bg-emerald-400' :
                saveStatus === 'saving' ? 'bg-amber-400 animate-spin' :
                saveStatus === 'error' ? 'bg-red-400' : 'bg-slate-400'
              }`} />
              <span className="text-slate-300 text-[10px]">
                {saveStatus === 'saved' ? '✓ Prescription Draft Saved' :
                 saveStatus === 'saving' ? 'Saving Rx...' :
                 saveStatus === 'error' ? 'Save Error' : 'Unsaved changes'}
              </span>
            </div>
          )}

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>256-Bit Encrypted</span>
          </div>

          <Button
            onClick={handleEndCallClick}
            disabled={isEnding}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Consultation</span>
          </Button>
        </div>
      </header>

      {/* Main Video Viewports Grid */}
      <main className="flex-1 p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3.5 relative overflow-y-auto lg:overflow-hidden min-h-0">
        
        {/* Remote Video Stream (Main Focus) */}
        <div className={`${showSidebar ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} transition-all duration-300 relative rounded-3xl bg-slate-950 border border-teal-500/30 overflow-hidden flex items-center justify-center shadow-2xl min-h-[300px]`}>
          
          {/* Live Remote Peer Video Stream */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover rounded-3xl ${hasRemoteStream ? 'block' : 'hidden'}`}
          />

          {/* Placeholder while waiting for peer to connect */}
          {!hasRemoteStream && (
            <div className="w-full h-full min-h-[340px] sm:min-h-[440px] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/40 flex flex-col items-center justify-center p-6 text-center relative">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-teal-800/60 border-4 border-teal-500/40 flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white shadow-2xl">
                {remoteParticipantName.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white mt-4">{remoteParticipantName}</h3>
              <p className="text-xs text-teal-400 font-semibold">{remoteParticipantRole} • Connecting secure video feed...</p>

              <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] text-slate-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Waiting for {remoteParticipantRole} to open room</span>
              </div>
            </div>
          )}

          {/* Local PiP Preview (Bottom Right inside Main View) */}
          <div className="absolute bottom-4 right-4 w-28 h-20 sm:w-44 sm:h-28 rounded-2xl bg-slate-900 border-2 border-teal-400 shadow-2xl overflow-hidden flex items-center justify-center z-10">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover mirror ${isVideoOn ? 'block' : 'hidden'}`} 
            />
            {!isVideoOn && (
              <div className="text-center p-2">
                <VideoOff className="w-4 h-4 text-slate-500 mx-auto mb-0.5" />
                <span className="text-[9px] text-slate-400">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[8px] text-white">
              You ({authData?.role})
            </div>
          </div>

        </div>

        {/* Multi-Tab Telehealth Sidebar (Medicines, Prescription, Chat, Info) */}
        {showSidebar && (
          <div className="fixed inset-x-0 bottom-0 top-16 z-40 lg:relative lg:inset-auto lg:z-auto lg:col-span-5 xl:col-span-4 rounded-t-3xl lg:rounded-3xl bg-slate-900/95 lg:bg-slate-900/90 border border-teal-500/30 flex flex-col justify-between overflow-hidden shadow-2xl backdrop-blur-md lg:backdrop-blur-none text-left">
            
            {/* Sidebar Tab Header */}
            <div className="border-b border-slate-800 bg-slate-950/80 p-2 flex items-center justify-between">
              <div className="flex items-center gap-1 overflow-x-auto">
                {isDoctor && (
                  <button
                    onClick={() => setSidebarTab('medicines')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      sidebarTab === 'medicines'
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Pill className="w-3.5 h-3.5" />
                    Medicines ({medicines.length})
                  </button>
                )}

                <button
                  onClick={() => setSidebarTab('prescription')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'prescription'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Prescription
                </button>

                <button
                  onClick={() => setSidebarTab('chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'chat'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Chat
                </button>

                <button
                  onClick={() => setSidebarTab('patient_info')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    sidebarTab === 'patient_info'
                      ? 'bg-teal-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  {isDoctor ? 'Patient' : 'Doctor'}
                </button>
              </div>

              <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="h-7 w-7 text-slate-400 hover:text-white lg:hidden">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* TAB 1: MEDICINES DRAFTING (DOCTOR ONLY) */}
            {sidebarTab === 'medicines' && isDoctor && (
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 max-h-[calc(100vh-230px)]">
                
                {/* Finalize Status Banner */}
                {isFinalized ? (
                  <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Prescription Finalized
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleReopenPrescription} 
                      className="text-[10px] h-7 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50"
                    >
                      <Edit3 className="w-3 h-3 mr-1" /> Edit Prescription
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-slate-950/70 p-2.5 rounded-2xl border border-teal-500/20">
                    <div className="text-[11px] text-slate-300">
                      <span className="font-bold text-white">Live Medicine Draft</span>
                      <p className="text-[10px] text-slate-400">Prescribe medicines directly during video call</p>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={openAddMedicine} 
                      className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-8 px-3 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Medicine
                    </Button>
                  </div>
                )}

                {/* Diagnosis & Clinical Notes inputs */}
                <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-300">Clinical Diagnosis</Label>
                    <Input 
                      value={diagnosis} 
                      disabled={isFinalized}
                      onChange={(e) => {
                        setDiagnosis(e.target.value);
                        triggerAutosave(medicines, e.target.value, clinicalNotes);
                      }}
                      placeholder="e.g. Acute Upper Respiratory Infection" 
                      className="h-8 text-xs bg-slate-900 border-slate-800 focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold text-slate-300">Doctor&apos;s Advice / Consultation Notes</Label>
                    <Input 
                      value={clinicalNotes} 
                      disabled={isFinalized}
                      onChange={(e) => {
                        setClinicalNotes(e.target.value);
                        triggerAutosave(medicines, diagnosis, e.target.value);
                      }}
                      placeholder="e.g. Drink warm fluids, follow up in 5 days if fever persists" 
                      className="h-8 text-xs bg-slate-900 border-slate-800 focus:border-teal-500"
                    />
                  </div>
                </div>

                {/* Add/Edit Medicine Modal / Form Box */}
                {showAddMedForm && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-500/50 shadow-xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <h4 className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5" />
                        {editingMedIndex !== null ? 'Edit Medicine' : 'Add New Medicine'}
                      </h4>
                      <button onClick={() => setShowAddMedForm(false)} className="text-slate-400 hover:text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Medicine Name with Quick Suggestions */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Medicine Name *</Label>
                      <Input 
                        value={medName} 
                        onChange={(e) => setMedName(e.target.value)}
                        placeholder="e.g. Paracetamol 500mg" 
                        className="h-8 text-xs bg-slate-900 border-slate-800"
                      />
                      {/* Suggestion Chips */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {COMMON_MEDICINES.slice(0, 4).map((name) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => setMedName(name)}
                            className="text-[9px] px-2 py-0.5 rounded-md bg-slate-900 text-teal-300 border border-slate-800 hover:border-teal-500"
                          >
                            + {name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Type & Dosage */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Type</Label>
                        <select 
                          value={medType} 
                          onChange={(e) => setMedType(e.target.value)}
                          className="w-full h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                        >
                          <option value="TABLET">Tablet 💊</option>
                          <option value="CAPSULE">Capsule 💊</option>
                          <option value="SYRUP">Syrup 🧴</option>
                          <option value="INJECTION">Injection 💉</option>
                          <option value="CREAM">Cream 🧴</option>
                          <option value="OTHER">Other 🩹</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Dosage *</Label>
                        <Input 
                          value={medDosage} 
                          onChange={(e) => setMedDosage(e.target.value)}
                          placeholder="e.g. 1 tablet, 500mg" 
                          className="h-8 text-xs bg-slate-900 border-slate-800"
                        />
                      </div>
                    </div>

                    {/* Frequency */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Frequency *</Label>
                      <select 
                        value={medFrequency} 
                        onChange={(e) => {
                          setMedFrequency(e.target.value);
                          if (e.target.value === 'Once daily') setMedTimings(['08:00 AM']);
                          else if (e.target.value === 'Twice daily') setMedTimings(['08:00 AM', '08:00 PM']);
                          else if (e.target.value === 'Three times daily') setMedTimings(['08:00 AM', '02:00 PM', '08:00 PM']);
                          else if (e.target.value === 'Four times daily') setMedTimings(['08:00 AM', '12:00 PM', '04:00 PM', '08:00 PM']);
                        }}
                        className="w-full h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-teal-500"
                      >
                        <option value="Once daily">Once daily (1 time/day)</option>
                        <option value="Twice daily">Twice daily (Morning & Night)</option>
                        <option value="Three times daily">Three times daily (Morning, Noon, Night)</option>
                        <option value="Four times daily">Four times daily (Every 6 hrs)</option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="As needed (SOS)">As needed (SOS / For pain)</option>
                      </select>
                    </div>

                    {/* Multi-Time Selector */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Medicine Time(s) *</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {TIME_PRESETS.map((p) => {
                          const isSelected = medTimings.includes(p.time);
                          return (
                            <button
                              key={p.time}
                              type="button"
                              onClick={() => toggleTiming(p.time)}
                              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-teal-500 text-slate-950 font-bold border-teal-400'
                                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                              }`}
                            >
                              {p.label} ({p.time})
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Custom Time Add */}
                      <div className="flex gap-1.5 pt-1">
                        <Input
                          placeholder="Custom time (e.g. 11:30 AM)"
                          value={customTimeInput}
                          onChange={(e) => setCustomTimeInput(e.target.value)}
                          className="h-7 text-[10px] bg-slate-900 border-slate-800"
                        />
                        <Button type="button" size="sm" onClick={handleAddCustomTime} className="h-7 text-[10px] bg-slate-800 hover:bg-slate-700">
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Duration & Start Date */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Duration (Days) *</Label>
                        <Input 
                          type="number"
                          min="1"
                          max="365"
                          value={medDurationDays} 
                          onChange={(e) => setMedDurationDays(parseInt(e.target.value) || 1)}
                          className="h-8 text-xs bg-slate-900 border-slate-800"
                        />
                        <div className="flex gap-1 pt-0.5">
                          {[3, 5, 7, 14, 30].map(d => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setMedDurationDays(d)}
                              className={`text-[9px] px-1.5 py-0.5 rounded border ${
                                medDurationDays === d ? 'bg-teal-500/20 text-teal-300 border-teal-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}
                            >
                              {d}d
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Start Date</Label>
                        <Input 
                          type="date"
                          value={medStartDate} 
                          onChange={(e) => setMedStartDate(e.target.value)}
                          className="h-8 text-xs bg-slate-900 border-slate-800"
                        />
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Special Instructions</Label>
                      <Input 
                        value={medInstructions} 
                        onChange={(e) => setMedInstructions(e.target.value)}
                        placeholder="e.g. Take after food with warm water" 
                        className="h-8 text-xs bg-slate-900 border-slate-800"
                      />
                      <div className="flex flex-wrap gap-1 pt-1">
                        {INSTRUCTION_PRESETS.slice(0, 3).map((inst) => (
                          <button
                            key={inst}
                            type="button"
                            onClick={() => setMedInstructions(inst)}
                            className="text-[9px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 hover:border-teal-500 truncate max-w-full"
                          >
                            {inst}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-800">
                      <Button variant="outline" size="sm" onClick={() => setShowAddMedForm(false)} className="h-8 text-xs border-slate-800">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleSaveMedicineItem} className="h-8 text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold">
                        {editingMedIndex !== null ? 'Update Medicine' : '+ Add to Prescription'}
                      </Button>
                    </div>
                  </div>
                )}

                {/* List of Prescribed Medicines */}
                {medicines.length === 0 && !showAddMedForm ? (
                  <div className="p-6 rounded-2xl bg-slate-950/60 border border-dashed border-slate-800 text-center space-y-2">
                    <Pill className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">No medicines prescribed yet</p>
                    <p className="text-[10px] text-slate-500">Click &quot;+ Add Medicine&quot; above to prescribe medications for this consultation.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {medicines.map((med, idx) => (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-950 border border-teal-500/20 space-y-1.5 relative group">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-teal-950 border border-teal-500/40 text-teal-400 flex items-center justify-center text-[10px] font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="text-xs font-bold text-white">{med.medicineName}</h5>
                              <p className="text-[10px] text-teal-300">{med.dosage} • {med.frequency}</p>
                            </div>
                          </div>

                          {!isFinalized && (
                            <div className="flex gap-1">
                              <button 
                                onClick={() => openEditMedicine(idx)}
                                className="p-1 rounded-md text-slate-400 hover:text-teal-300 hover:bg-slate-900"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleRemoveMedicine(idx)}
                                className="p-1 rounded-md text-slate-400 hover:text-red-400 hover:bg-slate-900"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 text-[9px] text-slate-400 pt-1">
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-400 font-mono">
                            ⏰ {med.timing.join(', ')}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-400">
                            📅 {med.duration}
                          </span>
                          {med.instructions && (
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                              🍽 {med.instructions}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* TAB 2: PRESCRIPTION PREVIEW (PATIENT & DOCTOR) */}
            {sidebarTab === 'prescription' && (
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 max-h-[calc(100vh-230px)]">
                <div className="p-4 rounded-2xl bg-white text-slate-950 border border-slate-200 shadow-lg space-y-3">
                  {/* Rx Header */}
                  <div className="border-b border-slate-200 pb-2 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-teal-700 font-bold text-sm">
                        <Stethoscope className="w-4 h-4" />
                        <span>{authData?.doctorName || 'Dr. Dharm Patel'}</span>
                      </div>
                      <p className="text-[10px] text-slate-600">MBBS, MD • Medical Council Reg # MCI-2026</p>
                    </div>
                    <Badge className="bg-teal-100 text-teal-900 text-[9px] px-1.5">
                      {isFinalized ? '✓ Official Rx' : 'Draft Preview'}
                    </Badge>
                  </div>

                  {/* Patient Info */}
                  <div className="grid grid-cols-2 text-[10px] text-slate-600 gap-1 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <div><strong>Patient:</strong> {authData?.patientEmail?.split('@')[0] || 'Patient'}</div>
                    <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
                    <div className="col-span-2"><strong>Diagnosis:</strong> {diagnosis}</div>
                  </div>

                  {/* Medicine List in Rx */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-slate-900 flex items-center gap-1">
                      <Pill className="w-3.5 h-3.5 text-teal-600" /> Prescribed Medications:
                    </p>

                    {medicines.length === 0 ? (
                      <p className="text-[10px] text-slate-400 italic">No medications added yet.</p>
                    ) : (
                      medicines.map((m, i) => (
                        <div key={i} className="text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 space-y-0.5">
                          <p className="font-bold text-slate-900">{i + 1}. {m.medicineName} ({m.dosage})</p>
                          <p className="text-[10px] text-slate-600">
                            <strong>Frequency:</strong> {m.frequency} • <strong>Times:</strong> {m.timing.join(', ')}
                          </p>
                          <p className="text-[10px] text-slate-600">
                            <strong>Duration:</strong> {m.duration} • <strong>Instructions:</strong> {m.instructions}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  {clinicalNotes && (
                    <div className="text-[10px] text-slate-600 p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <strong>Special Advice:</strong> {clinicalNotes}
                    </div>
                  )}

                  <div className="text-right text-[9px] text-slate-400 border-t border-slate-100 pt-1">
                    Digitally signed via HealthConnect AI Telehealth Engine
                  </div>
                </div>

                {/* Actions */}
                {isDoctor && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={handleSharePrescriptionInChat}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs h-8"
                    >
                      <Share2 className="w-3.5 h-3.5 mr-1" /> Share in Chat
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: IN-CALL CHAT */}
            {sidebarTab === 'chat' && (
              <div className="flex-1 flex flex-col justify-between overflow-hidden max-h-[calc(100vh-230px)]">
                <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5">
                  {chatMessages.map((m, i) => (
                    <div key={i} className="text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-500">
                        <span className="font-bold text-teal-300">{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                      <p className="text-slate-200">{m.text}</p>
                      
                      {m.type === 'PRESCRIPTION_SHARE' && (
                        <div className="mt-2 p-2 rounded-xl bg-teal-950/80 border border-teal-500/40 text-[11px] space-y-1">
                          <p className="font-bold text-teal-300">📋 Prescription Summary</p>
                          <p className="text-[10px] text-slate-300">Diagnosis: {m.metadata?.diagnosis}</p>
                          <Button 
                            size="sm" 
                            onClick={() => setSidebarTab('prescription')}
                            className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-[10px] h-6 mt-1"
                          >
                            View Full Prescription Document
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/80 flex gap-2">
                  <input
                    type="text"
                    placeholder="Type in-call message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-900 border border-teal-500/30 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-teal-400"
                  />
                  <Button type="submit" size="icon" className="h-8 w-8 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </form>
              </div>
            )}

            {/* TAB 4: PATIENT / DOCTOR INFO */}
            {sidebarTab === 'patient_info' && (
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 max-h-[calc(100vh-230px)]">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border border-teal-500/40">
                      <AvatarFallback className="bg-teal-600 text-white font-bold text-sm">
                        {remoteParticipantName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-white">{remoteParticipantName}</h4>
                      <p className="text-xs text-teal-400">{remoteParticipantRole}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
                    <div><strong>Session Room:</strong> <span className="font-mono text-teal-400">{roomId}</span></div>
                    <div><strong>Scheduled:</strong> {new Date(authData?.scheduledAt || '').toLocaleString()}</div>
                    <div><strong>Duration Window:</strong> {authData?.duration || 30} minutes</div>
                    <div><strong>Security:</strong> 256-Bit WebRTC DTLS / SRTP End-to-End Encrypted</div>
                  </div>
                </div>
              </div>
            )}

            {/* Sidebar Bottom Action Footer (For Doctor) */}
            {isDoctor && sidebarTab === 'medicines' && (
              <div className="p-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-400">
                  {medicines.length} medicine(s) in draft
                </div>

                {!isFinalized ? (
                  <Button
                    onClick={() => setShowFinalizeModal(true)}
                    disabled={medicines.length === 0 || isFinalizing}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs h-9 px-4 rounded-xl shadow-lg cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Finalize Prescription
                  </Button>
                ) : (
                  <Badge className="bg-emerald-950 text-emerald-300 border-emerald-500/40 text-xs px-3 py-1">
                    ✓ Finalized &amp; Ready
                  </Badge>
                )}
              </div>
            )}

          </div>
        )}

      </main>

      {/* Bottom Media Controls Bar */}
      <footer className="h-20 border-t border-teal-500/20 bg-slate-950/95 px-6 flex items-center justify-center gap-3.5 z-20 shrink-0">
        
        {/* Mic toggle */}
        <Button
          size="icon"
          onClick={toggleAudio}
          className={`w-12 h-12 rounded-2xl cursor-pointer transition-all ${
            isMicOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              : 'bg-red-600/20 text-red-400 border border-red-500/50'
          }`}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        {/* Video toggle */}
        <Button
          size="icon"
          onClick={toggleVideo}
          className={`w-12 h-12 rounded-2xl cursor-pointer transition-all ${
            isVideoOn
              ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              : 'bg-red-600/20 text-red-400 border border-red-500/50'
          }`}
          title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        {/* Medicines / Rx Panel Toggle */}
        <Button
          size="icon"
          onClick={() => {
            setShowSidebar(true);
            setSidebarTab(isDoctor ? 'medicines' : 'prescription');
          }}
          className={`w-12 h-12 rounded-2xl cursor-pointer transition-all ${
            showSidebar && (sidebarTab === 'medicines' || sidebarTab === 'prescription')
              ? 'bg-teal-500 text-slate-950 font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title="Prescription & Medicines"
        >
          <Pill className="w-5 h-5" />
        </Button>

        {/* Chat toggle */}
        <Button
          size="icon"
          onClick={() => {
            setShowSidebar(true);
            setSidebarTab('chat');
          }}
          className={`w-12 h-12 rounded-2xl cursor-pointer transition-all ${
            showSidebar && sidebarTab === 'chat'
              ? 'bg-teal-500 text-slate-950 font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title="Toggle In-Call Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        {/* End Call Button */}
        <Button
          onClick={handleEndCallClick}
          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs h-12 px-6 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer ml-2"
        >
          <PhoneOff className="w-5 h-5" />
          End Call
        </Button>

      </footer>

      {/* CONFIRM FINALIZE PRESCRIPTION DIALOG */}
      {showFinalizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-teal-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Finalize Digital Prescription?</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you sure you want to finalize this prescription with <strong>{medicines.length} medication(s)</strong>? You will still be able to make corrections before ending the consultation.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <p className="text-[11px] text-slate-400">Diagnosis: <strong className="text-teal-400">{diagnosis}</strong></p>
              <div className="text-[10px] text-slate-300">
                {medicines.map((m, i) => (
                  <div key={i}>• {m.medicineName} ({m.dosage}) — {m.frequency}, {m.duration}</div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button 
                variant="outline" 
                onClick={() => setShowFinalizeModal(false)}
                className="text-xs h-9 border-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleFinalizePrescription}
                disabled={isFinalizing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-9"
              >
                {isFinalizing ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Check className="w-3.5 h-3.5 mr-1" />}
                Yes, Finalize Prescription
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* UNFINISHED PRESCRIPTION ON END CALL DIALOG */}
      {showEndCallUnfinishedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Unfinished Prescription Draft</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                You have <strong>{medicines.length} prescribed medicine(s)</strong> in draft that have not been finalized. Do you want to finalize this prescription before ending the consultation?
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <Button 
                onClick={async () => {
                  await handleFinalizePrescription();
                  executeEndCall();
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs h-10"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Finalize Rx &amp; End Consultation
              </Button>

              <Button 
                variant="outline"
                onClick={() => {
                  setShowEndCallUnfinishedModal(false);
                  executeEndCall();
                }}
                className="w-full border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs h-10"
              >
                End Without Finalizing Prescription
              </Button>

              <Button 
                variant="ghost"
                onClick={() => setShowEndCallUnfinishedModal(false)}
                className="w-full text-slate-400 hover:text-white text-xs h-8"
              >
                Cancel (Stay in Call)
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
