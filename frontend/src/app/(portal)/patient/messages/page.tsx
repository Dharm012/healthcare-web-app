"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Send, Search, Phone, Video, 
  MoreVertical, Paperclip, Smile, CheckCheck, 
  Check, ShieldCheck, User 
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Conversation {
  id: number;
  name: string;
  specialty: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const initialConversations: Conversation[] = [
  {
    id: 1,
    name: 'Dr. Dharm Patel',
    specialty: 'General Physician',
    avatar: 'DP',
    lastMessage: 'Your blood reports look stable. Continue with the prescribed medication.',
    time: '10 min ago',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Dr. Jane Smith',
    specialty: 'Cardiologist',
    avatar: 'JS',
    lastMessage: 'Please record your morning BP readings for the next 3 days.',
    time: '2 hrs ago',
    unread: 1,
    online: true,
  },
  {
    id: 3,
    name: 'HealthConnect Clinical Support',
    specialty: 'Platform Support',
    avatar: 'HC',
    lastMessage: 'Your medical records have been synchronized and encrypted.',
    time: 'Yesterday',
    unread: 0,
    online: true,
  },
];

export default function MessagesPage() {
  const [patientName, setPatientName] = useState<string>('Patient');
  const [conversationsList, setConversationsList] = useState<Conversation[]>(initialConversations);
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [messagesList, setMessagesList] = useState<{ id: number; sender: 'doctor' | 'patient'; message: string; time: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'chat'>('list');

  useEffect(() => {
    let name = 'Patient';
    try {
      const storedName = localStorage.getItem("userName");
      const storedUser = localStorage.getItem("user");
      if (storedName && storedName.trim()) name = storedName;
      else if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) name = u.name;
        else if (u.fullName) name = u.fullName;
      }
    } catch {}
    setPatientName(name);

    const dynamicMessages: Record<number, { id: number; sender: 'doctor' | 'patient'; message: string; time: string }[]> = {
      1: [
        { id: 1, sender: 'doctor', message: `Hello ${name}, I reviewed your recent lipid panel and follow-up consultation notes.`, time: '9:30 AM' },
        { id: 2, sender: 'doctor', message: 'Your LDL cholesterol levels are showing steady improvement. I recommend continuing with Atorvastatin 20mg.', time: '9:31 AM' },
        { id: 3, sender: 'patient', message: 'Thank you, Dr. Dharm Patel. Should I take it at night with water?', time: '9:45 AM' },
        { id: 4, sender: 'doctor', message: 'Yes, exactly at bedtime with water. Please let me know if you experience any muscle stiffness.', time: '9:47 AM' },
        { id: 5, sender: 'doctor', message: 'Your blood reports look stable. Continue with the prescribed medication.', time: '10:02 AM' },
      ],
      2: [
        { id: 1, sender: 'doctor', message: `Hi ${name}, Dr. Jane Smith here from Cardiology.`, time: '8:15 AM' },
        { id: 2, sender: 'doctor', message: 'Please record your morning BP readings for the next 3 days.', time: '8:16 AM' },
      ],
      3: [
        { id: 1, sender: 'doctor', message: 'Welcome to HealthConnect AI 3D Telehealth.', time: 'Yesterday' },
        { id: 2, sender: 'doctor', message: 'Your medical records have been synchronized and encrypted.', time: 'Yesterday' },
      ]
    };

    setMessagesList(dynamicMessages[selectedChat] || []);
  }, [selectedChat]);

  // Clear unread badge for active chat
  const markChatAsRead = (chatId: number) => {
    setConversationsList(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c));
  };

  useEffect(() => {
    markChatAsRead(selectedChat);

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('healthconnect_unread_messages_count', '0');
        window.dispatchEvent(new Event('healthconnect_unread_update'));
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [selectedChat]);

  const currentChat = conversationsList.find(c => c.id === selectedChat) || conversationsList[0];

  const handleSelectConversation = (id: number) => {
    setSelectedChat(id);
    markChatAsRead(id);
    setActiveMobileView('chat');
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageObj = {
      id: Date.now(),
      sender: 'patient' as const,
      message: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesList(prev => [...prev, messageObj]);
    
    // Update last message in conversation list
    setConversationsList(prev => prev.map(c => 
      c.id === selectedChat ? { ...c, lastMessage: newMessage.trim(), time: 'Just now', unread: 0 } : c
    ));

    setNewMessage('');
  };

  const filteredConversations = conversationsList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Clinical Messages</h2>
          <p className="text-xs text-slate-500 dark:text-gray-400">Direct encrypted chat with your assigned doctors.</p>
        </div>
        <Badge className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/40 text-xs px-3 py-1 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400" />
          256-Bit HIPAA Encrypted
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[calc(100vh-210px)]">
        
        {/* Left Column: Conversation List */}
        <Card className={`border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-slate-900/90 shadow-xs lg:col-span-4 overflow-hidden flex-col rounded-2xl ${activeMobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-gray-500" />
              <Input 
                placeholder="Search conversations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-500 rounded-xl" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1">
            {filteredConversations.map((conv) => {
              const isSelected = selectedChat === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`p-3 rounded-xl cursor-pointer transition-all flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-500/40 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-gray-300'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-teal-500/30">
                      <AvatarFallback className="bg-teal-600 dark:bg-teal-700 text-white font-bold text-xs">
                        {conv.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-teal-800 dark:text-teal-300' : 'text-slate-900 dark:text-white'}`}>
                        {conv.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-gray-500 shrink-0">{conv.time}</span>
                    </div>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">{conv.specialty}</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>

                  {/* Unread notification badge */}
                  {conv.unread > 0 && !isSelected && (
                    <span className="shrink-0 h-5 w-5 rounded-full bg-teal-600 dark:bg-teal-400 text-white dark:text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                      {conv.unread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Chat View */}
        <Card className={`border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-slate-900/90 shadow-xs lg:col-span-8 flex-col rounded-2xl overflow-hidden min-h-[500px] lg:min-h-0 ${activeMobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Chat Header */}
          <div className="p-3.5 sm:px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/60">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden p-1 h-8 -ml-2" 
                onClick={() => setActiveMobileView('list')}
              >
                ← Back
              </Button>
              <Avatar className="h-9 w-9 border border-teal-500/40">
                <AvatarFallback className="bg-teal-600 dark:bg-teal-700 text-white font-bold text-xs">
                  {currentChat.avatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  {currentChat.name}
                  {currentChat.online && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">● Online</span>
                  )}
                </h3>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">{currentChat.specialty}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/doctors">
                <Button size="sm" variant="outline" className="text-xs h-8 border-teal-300 dark:border-teal-500/30 text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 cursor-pointer">
                  <Video className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400" />
                  Video Call
                </Button>
              </Link>
            </div>
          </div>

          {/* Messages Flow */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40 dark:bg-slate-950/40">
            {messagesList.map((m) => {
              const isPatient = m.sender === 'patient';
              return (
                <div key={m.id} className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl space-y-1 text-xs leading-relaxed shadow-xs ${
                      isPatient
                        ? 'bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-medium rounded-br-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p>{m.message}</p>
                    <div className={`flex items-center justify-end gap-1 text-[10px] ${isPatient ? 'text-teal-100 dark:text-slate-800 font-semibold' : 'text-slate-400 dark:text-gray-400'}`}>
                      <span>{m.time}</span>
                      {isPatient && <CheckCheck className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/80 flex items-center gap-2.5">
            <Input
              placeholder={`Send encrypted message to ${currentChat.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs h-10 px-3.5 rounded-xl focus:border-teal-400"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 mr-1.5" />
              Send
            </Button>
          </form>

        </Card>

      </div>
    </div>
  );
}
