"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageSquare, Send, Search, Video, 
  ShieldCheck, CheckCheck, User 
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Conversation {
  id: number;
  name: string;
  condition: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

const initialDoctorConversations: Conversation[] = [
  {
    id: 1,
    name: 'John Doe',
    condition: 'Hyperlipidemia • Hypertension',
    avatar: 'JD',
    lastMessage: 'Thank you, Dr. Dharm Patel. Should I take it at night with water?',
    time: '10 min ago',
    unread: 1,
    online: true,
  },
  {
    id: 2,
    name: 'Priya Sharma',
    condition: 'Gestational Diabetes',
    avatar: 'PS',
    lastMessage: 'Fasting glucose was 92 mg/dL this morning.',
    time: '2 hrs ago',
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: 'Arjun Mehta',
    condition: 'Atrial Fibrillation',
    avatar: 'AM',
    lastMessage: 'ECG record uploaded for your review.',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
];

const patientMessagesMap: Record<number, { id: number; sender: 'doctor' | 'patient'; message: string; time: string }[]> = {
  1: [
    { id: 1, sender: 'doctor', message: 'Hello John, I reviewed your recent lipid panel and follow-up consultation notes.', time: '9:30 AM' },
    { id: 2, sender: 'doctor', message: 'Your LDL cholesterol levels are showing steady improvement. I recommend continuing with Atorvastatin 20mg.', time: '9:31 AM' },
    { id: 3, sender: 'patient', message: 'Thank you, Dr. Dharm Patel. Should I take it at night with water?', time: '9:45 AM' },
  ],
  2: [
    { id: 1, sender: 'patient', message: 'Hello Dr. Patel, fasting glucose was 92 mg/dL this morning.', time: '8:15 AM' },
    { id: 2, sender: 'doctor', message: 'That is within our target range. Keep maintaining the current dietary plan.', time: '8:20 AM' },
  ],
  3: [
    { id: 1, sender: 'patient', message: 'ECG record uploaded for your review.', time: 'Yesterday' },
  ]
};

export default function DoctorMessagesPage() {
  const [conversationsList, setConversationsList] = useState<Conversation[]>(initialDoctorConversations);
  const [selectedChat, setSelectedChat] = useState<number>(1);
  const [messagesList, setMessagesList] = useState(patientMessagesMap[1]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMobileView, setActiveMobileView] = useState<'list' | 'chat'>('list');

  const markChatAsRead = (chatId: number) => {
    setConversationsList(prev => prev.map(c => c.id === chatId ? { ...c, unread: 0 } : c));
  };

  useEffect(() => {
    markChatAsRead(selectedChat);
    setMessagesList(patientMessagesMap[selectedChat] || []);
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
      sender: 'doctor' as const,
      message: newMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessagesList(prev => [...prev, messageObj]);
    setConversationsList(prev => prev.map(c => 
      c.id === selectedChat ? { ...c, lastMessage: newMessage.trim(), time: 'Just now', unread: 0 } : c
    ));
    setNewMessage('');
  };

  const filteredConversations = conversationsList.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.condition.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4 text-slate-900 dark:text-slate-100 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Patient Clinical Messages</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Encrypted messaging with active patients under your clinical supervision.</p>
        </div>
        <Badge className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 text-xs px-3 py-1 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 mr-1 text-teal-600 dark:text-teal-400" />
          HIPAA &amp; MCI Encrypted
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-auto lg:h-[calc(100vh-210px)]">
        
        {/* Left: Patient List */}
        <Card className={`border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs lg:col-span-4 overflow-hidden flex-col rounded-2xl ${activeMobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-gray-500" />
              <Input 
                placeholder="Search patient chats..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl" 
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
                      ? 'bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-gray-300'
                  }`}
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10 border border-teal-200 dark:border-teal-800">
                      <AvatarFallback className="bg-teal-600 text-white font-bold text-xs">
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
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold truncate">{conv.condition}</p>
                    <p className="text-[11px] text-slate-500 dark:text-gray-400 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>

                  {conv.unread > 0 && !isSelected && (
                    <span className="shrink-0 h-5 w-5 rounded-full bg-teal-600 text-white text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                      {conv.unread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Chat View */}
        <Card className={`border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs lg:col-span-8 flex-col rounded-2xl overflow-hidden min-h-[500px] lg:min-h-0 ${activeMobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
          
          {/* Header */}
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
              <Avatar className="h-9 w-9 border border-teal-200 dark:border-teal-800">
                <AvatarFallback className="bg-teal-600 text-white font-bold text-xs">
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
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">{currentChat.condition}</p>
              </div>
            </div>

            <Link href="/doctor/consultations">
              <Button size="sm" variant="outline" className="text-xs h-8 border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                <Video className="w-3.5 h-3.5 mr-1" /> Tele-Consult
              </Button>
            </Link>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40 dark:bg-slate-950/40">
            {messagesList.map((m) => {
              const isDoctor = m.sender === 'doctor';
              return (
                <div key={m.id} className={`flex ${isDoctor ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl space-y-1 text-xs leading-relaxed shadow-xs ${
                      isDoctor
                        ? 'bg-teal-600 text-white font-medium rounded-br-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <p>{m.message}</p>
                    <div className={`flex items-center justify-end gap-1 text-[10px] ${isDoctor ? 'text-teal-100' : 'text-slate-400'}`}>
                      <span>{m.time}</span>
                      {isDoctor && <CheckCheck className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/80 flex items-center gap-2.5">
            <Input
              placeholder={`Reply to ${currentChat.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs h-10 px-3.5 rounded-xl"
            />
            <Button
              type="submit"
              disabled={!newMessage.trim()}
              className="h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4 mr-1.5" /> Send
            </Button>
          </form>

        </Card>
      </div>
    </div>
  );
}
