"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Video, VideoOff, Mic, MicOff, PhoneOff, Lock, ShieldCheck, 
  Clock, AlertTriangle, CheckCircle2, User, MessageSquare, 
  FileText, Loader2, ArrowLeft, Pill, Send, Copy, Check, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { io, Socket } from 'socket.io-client';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

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
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; time: string }[]>([
    { sender: 'System', text: 'Encrypted 256-bit WebRTC Teleconsultation Room initialized.', time: 'Now' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isEnding, setIsEnding] = useState(false);
  const [callEndedByRemote, setCallEndedByRemote] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  // Media & WebRTC Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Stop all camera and microphone hardware tracks immediately
  const stopAllMediaTracks = useCallback(() => {
    console.log('Stopping all camera and microphone hardware tracks...');
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track:', e);
        }
      });
      localStreamRef.current = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping remote track:', e);
        }
      });
      remoteStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch {}
      peerConnectionRef.current = null;
    }
    setHasRemoteStream(false);
  }, []);

  // 1. Verify Room Authorization & Start Time Enforcement
  const verifyRoomAuth = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/appointments/room/${roomId}/auth`);
      setAuthData(res.data);
      setErrorState(null);
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

    // 1. Create BroadcastChannel for instant same-browser multi-tab signaling
    const bc = new BroadcastChannel(`healthconnect_room_${roomId}`);
    broadcastChannelRef.current = bc;

    // 2. Connect to backend WebSocket signaling gateway
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(backendUrl, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    // Initialize WebRTC PeerConnection
    const createPeerConnection = (stream: MediaStream) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnectionRef.current = pc;

      // Add local media tracks to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Receive remote media tracks
      pc.ontrack = (event) => {
        console.log('Received remote media stream track:', event.streams[0]);
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setHasRemoteStream(true);
        }
      };

      // Send local ICE candidates to remote peer
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidateData = { roomId, candidate: event.candidate };
          socket.emit('ice-candidate', candidateData);
          bc.postMessage({ type: 'ice-candidate', candidate: event.candidate });
        }
      };

      return pc;
    };

    // Helper: Initiate WebRTC Call Offer
    const initiateCall = async (pc: RTCPeerConnection) => {
      try {
        console.log('Initiating WebRTC offer...');
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer, senderRole: authData?.role });
        bc.postMessage({ type: 'offer', offer, senderRole: authData?.role });
      } catch (err) {
        console.error('Error creating offer:', err);
      }
    };

    // Acquire Local Camera & Microphone Stream
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
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = createPeerConnection(stream);

        // Join room on server
        socket.emit('join-room', {
          roomId,
          role: authData?.role,
          name: authData?.role === 'DOCTOR' ? (authData?.doctorName || 'Doctor') : (authData?.patientEmail || 'Patient'),
        });

        // Broadcast join to local tabs
        bc.postMessage({ type: 'user-joined', role: authData?.role });

        // Handle remote signaling messages
        const handleSignalData = async (type: string, data: any) => {
          try {
            if (type === 'user-joined') {
              console.log('Peer joined room. Sending offer...');
              await initiateCall(pc);
            } else if (type === 'offer') {
              console.log('Received WebRTC offer. Creating answer...');
              await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              socket.emit('answer', { roomId, answer });
              bc.postMessage({ type: 'answer', answer });
            } else if (type === 'answer') {
              console.log('Received WebRTC answer. Setting remote description...');
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
              console.log('Call was ended by remote peer.');
              setCallEndedByRemote(true);
              stopAllMediaTracks();
            } else if (type === 'in-call-message') {
              setChatMessages(prev => [...prev, data]);
            }
          } catch (e) {
            console.error('Signaling handling error:', e);
          }
        };

        // Socket listeners
        socket.on('user-joined', (d) => handleSignalData('user-joined', d));
        socket.on('offer', (d) => handleSignalData('offer', d));
        socket.on('answer', (d) => handleSignalData('answer', d));
        socket.on('ice-candidate', (d) => handleSignalData('ice-candidate', d));
        socket.on('call-ended', (d) => handleSignalData('call-ended', d));
        socket.on('in-call-message', (d) => handleSignalData('in-call-message', d));

        // BroadcastChannel listener
        bc.onmessage = (event) => {
          const { type, ...rest } = event.data;
          handleSignalData(type, rest);
        };
      })
      .catch((err) => {
        console.error('Camera/Microphone permission denied or not available:', err);
      });

    // Cleanup on unmount or page exit
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

  // Toggle Video (Camera Track)
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTracks = localStreamRef.current.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !isVideoOn;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  // Toggle Audio (Microphone Track)
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !isMicOn;
      });
      setIsMicOn(!isMicOn);
    }
  };

  // End Call Button
  const handleEndCall = async () => {
    if (!confirm('Are you sure you want to conclude this consultation?')) return;
    setIsEnding(true);

    try {
      // 1. Notify remote peer to stop camera immediately
      if (socketRef.current) {
        socketRef.current.emit('end-call', { roomId, senderRole: authData?.role });
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.postMessage({ type: 'call-ended', senderRole: authData?.role });
      }

      // 2. Shut off local camera and microphone hardware tracks
      stopAllMediaTracks();

      // 3. Mark appointment as completed on server
      await api.post(`/api/appointments/room/${roomId}/end`);

      alert('Consultation concluded successfully. Camera has been turned off.');
      if (authData?.role === 'DOCTOR') {
        router.push('/doctor/dashboard');
      } else {
        router.push('/patient/appointments');
      }
    } catch {
      stopAllMediaTracks();
      router.push('/patient/appointments');
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

    if (socketRef.current) {
      socketRef.current.emit('in-call-message', newMsg);
    }
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({ type: 'in-call-message', ...newMsg });
    }
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
          <Link href={authData?.role === 'DOCTOR' ? '/doctor/dashboard' : '/patient/appointments'}>
            <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. LOCKED / TIME RESTRICTION ENFORCEMENT SCREEN
  // =========================================================================
  if (errorState?.code === 'EARLY_JOIN_BLOCKED') {
    const scheduledDate = errorState.scheduledAt ? new Date(errorState.scheduledAt) : null;
    const mins = Math.floor(countdown / 60);
    const secs = countdown % 60;

    return (
      <div className="min-h-screen bg-[#05080d] text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center selection:bg-teal-500 selection:text-black">
        <div className="max-w-md w-full bg-slate-900/90 border-2 border-teal-500/50 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/40">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <Badge className="bg-teal-950 text-teal-300 border-teal-500/40 text-xs px-3 py-1">
              Server-Enforced Start Time Lock
            </Badge>
            <h2 className="text-2xl font-extrabold text-white">Consultation Room Locked</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Video calls strictly unlock at the scheduled appointment time to protect doctor availability and patient privacy.
            </p>
          </div>

          {scheduledDate && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
              <span className="text-slate-500 uppercase font-bold text-[10px] block">Scheduled Start Time</span>
              <p className="text-sm font-bold text-white">
                {scheduledDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
                <span className="text-teal-400">
                  {scheduledDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-teal-950/60 border border-teal-500/40 space-y-1">
            <span className="text-teal-300 font-semibold text-xs flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4" /> Room Unlocks Automatically In:
            </span>
            <div className="text-3xl font-extrabold text-teal-300 font-mono tracking-wider">
              {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex-1 border-slate-800 text-slate-300 hover:text-white text-xs h-10"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Appointments
            </Button>
            <Button
              onClick={verifyRoomAuth}
              className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-10 shadow-md cursor-pointer"
            >
              Refresh Authorization
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 4. EXPIRED / UNAUTHORIZED ERROR SCREEN
  // =========================================================================
  if (errorState) {
    return (
      <div className="min-h-screen bg-[#05080d] text-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-md w-full bg-slate-900/90 border border-red-500/50 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto border border-red-500/40">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white">Consultation Unavailable</h2>
            <p className="text-xs text-red-300">{errorState.message}</p>
          </div>

          <Link href="/patient/appointments" className="block w-full">
            <Button className="w-full bg-slate-800 hover:bg-slate-700 text-white text-xs h-10">
              Return to My Appointments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 5. ACTIVE HD VIDEO CONSULTATION ROOM (PEER-TO-PEER)
  // =========================================================================
  const isDoctor = authData?.role === 'DOCTOR';
  const remoteParticipantName = isDoctor ? (authData?.patientEmail?.split('@')[0] || 'Patient') : (authData?.doctorName || 'Dr. Dharm Patel');
  const remoteParticipantRole = isDoctor ? 'Patient' : 'Doctor';

  return (
    <div className="min-h-screen bg-[#05080d] text-white flex flex-col justify-between overflow-hidden">
      
      {/* Top Telehealth Control Bar */}
      <header className="h-16 border-b border-teal-500/20 bg-slate-950/90 px-4 sm:px-6 flex items-center justify-between z-20">
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

        {/* Security & End button */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
            <span>256-Bit Encrypted</span>
          </div>

          <Button
            onClick={handleEndCall}
            disabled={isEnding}
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 px-4 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Consultation</span>
          </Button>
        </div>
      </header>

      {/* Main Video Viewports Grid */}
      <main className="flex-1 p-3 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 relative overflow-hidden">
        
        {/* Remote Video Stream (Main Focus) */}
        <div className={`${showChat ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 relative rounded-3xl bg-slate-950 border border-teal-500/30 overflow-hidden flex items-center justify-center shadow-2xl`}>
          
          {/* Live Remote Peer Video Stream */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover rounded-3xl ${hasRemoteStream ? 'block' : 'hidden'}`}
          />

          {/* Placeholder while waiting for peer to connect */}
          {!hasRemoteStream && (
            <div className="w-full h-full min-h-[380px] sm:min-h-[480px] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950/40 flex flex-col items-center justify-center p-6 text-center relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-teal-800/60 border-4 border-teal-500/40 flex items-center justify-center text-3xl font-extrabold text-white shadow-2xl">
                {remoteParticipantName.substring(0, 2).toUpperCase()}
              </div>
              <h3 className="text-lg font-bold text-white mt-4">{remoteParticipantName}</h3>
              <p className="text-xs text-teal-400 font-semibold">{remoteParticipantRole} • Connecting secure video feed...</p>

              <div className="absolute top-4 left-4 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-full flex items-center gap-2 text-[11px] text-slate-300 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span>Waiting for {remoteParticipantRole} to open room</span>
              </div>
            </div>
          )}

          {/* Local PiP Preview (Bottom Right inside Main View) */}
          <div className="absolute bottom-4 right-4 w-36 h-24 sm:w-48 sm:h-32 rounded-2xl bg-slate-900 border-2 border-teal-400 shadow-2xl overflow-hidden flex items-center justify-center z-10">
            <video 
              ref={localVideoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover mirror ${isVideoOn ? 'block' : 'hidden'}`} 
            />
            {!isVideoOn && (
              <div className="text-center p-2">
                <VideoOff className="w-5 h-5 text-slate-500 mx-auto mb-1" />
                <span className="text-[10px] text-slate-400">Camera Off</span>
              </div>
            )}
            <div className="absolute bottom-1 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white">
              You ({authData?.role})
            </div>
          </div>

        </div>

        {/* In-Call Telehealth Chat Sidebar */}
        {showChat && (
          <div className="lg:col-span-4 rounded-3xl bg-slate-900/90 border border-teal-500/30 flex flex-col justify-between overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-400" />
                Encrypted In-Call Messages
              </h4>
              <Button variant="ghost" size="sm" onClick={() => setShowChat(false)} className="text-xs text-slate-400 h-6 px-2">
                Close
              </Button>
            </div>

            <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 max-h-[360px]">
              {chatMessages.map((m, i) => (
                <div key={i} className="text-xs p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="font-bold text-teal-300">{m.sender}</span>
                    <span>{m.time}</span>
                  </div>
                  <p className="text-slate-200">{m.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950/60 flex gap-2">
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

      </main>

      {/* Bottom Media Controls Bar */}
      <footer className="h-20 border-t border-teal-500/20 bg-slate-950/95 px-6 flex items-center justify-center gap-3.5 z-20">
        
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

        {/* Chat toggle */}
        <Button
          size="icon"
          onClick={() => setShowChat(!showChat)}
          className={`w-12 h-12 rounded-2xl cursor-pointer transition-all ${
            showChat
              ? 'bg-teal-500 text-slate-950 font-bold'
              : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
          }`}
          title="Toggle In-Call Messages"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        {/* End Call Button */}
        <Button
          onClick={handleEndCall}
          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs h-12 px-6 rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer ml-2"
        >
          <PhoneOff className="w-5 h-5" />
          End Call
        </Button>

      </footer>

    </div>
  );
}
