"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  AlertTriangle, Send, Bot, Activity, Stethoscope, 
  Calendar, Clock, Loader2, Sparkles, HeartPulse, ArrowLeft
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import api from '@/lib/api';

type Message = {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
};

export default function PublicSymptomCheckerPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm your HealthConnect AI assistant. How can I help you today? Please describe your symptoms in as much detail as possible.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await api.post('/api/ai/symptom-check', { 
        history: [...messages, newUserMsg].map(m => ({ role: m.role, content: m.content })) 
      });
      const result = response.data;
      
      const newAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: result.recommendation || "Thank you. Based on your symptoms, I have compiled an initial clinical assessment in the summary panel on the right.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newAiMsg]);
      setAnalysis(result);
    } catch {
      const fallbackAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I have recorded your symptoms. To receive an official diagnosis, please schedule a consultation with our verified doctors.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* Header */}
      <header className="border-b border-border bg-sidebar px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-teal-400" />
            <span className="font-bold text-white tracking-tight">HealthConnect <span className="text-teal-400">AI</span></span>
          </Link>
          <span className="text-gray-600 hidden sm:inline">|</span>
          <span className="text-xs text-gray-400 hidden sm:inline">AI Medical Diagnostics</span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/doctors">
            <Button size="sm" className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs">
              Find a Doctor
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-4">
        
        {/* Disclaimer */}
        <div className="bg-slate-900/90 border border-border/80 text-blue-200 p-3 rounded-xl flex items-center gap-2.5 text-xs shadow-xs">
          <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>Disclaimer:</strong> AI suggestions are not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[calc(100vh-190px)]">
          
          {/* Chat Column */}
          <Card className="border border-teal-500/40 bg-card shadow-xs lg:col-span-8 flex flex-col overflow-hidden rounded-2xl min-h-[420px]">
            <CardHeader className="p-4 border-b border-border/50 bg-slate-900/40 flex flex-row items-center gap-2">
              <Bot className="w-5 h-5 text-teal-400" />
              <CardTitle className="text-sm font-bold text-white">AI Symptom Assistant</CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/40">
              {messages.map((m) => {
                const isAi = m.role === "ai";
                return (
                  <div key={m.id} className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}>
                    {isAi && (
                      <Avatar className="h-8 w-8 border border-teal-500/40 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-teal-800 text-teal-200 text-xs font-bold">
                          AI
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div className="space-y-1 max-w-[80%]">
                      <div
                        className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                          isAi
                            ? "bg-teal-500 text-slate-950 font-medium rounded-tl-none shadow-xs"
                            : "bg-white text-slate-900 font-medium rounded-tr-none shadow-xs"
                        }`}
                      >
                        {m.content}
                      </div>
                      <span className={`block text-[9px] text-gray-500 ${isAi ? "text-left pl-1" : "text-right pr-1"}`}>
                        {m.timestamp}
                      </span>
                    </div>

                    {!isAi && (
                      <Avatar className="h-8 w-8 border border-gray-400 shrink-0 mt-0.5">
                        <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">
                          ME
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-teal-400 italic">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing clinical markers...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-border/50 bg-slate-900/40 flex items-center gap-2">
              <input
                type="text"
                placeholder="Describe your symptoms (e.g. fever, headache, duration)..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-slate-900 border border-teal-500/40 text-white text-xs px-4 py-2.5 rounded-full focus:outline-none focus:border-teal-400 placeholder:text-gray-500"
              />
              <Button
                type="submit"
                size="icon"
                disabled={isTyping || !inputValue.trim()}
                className="h-9 w-9 rounded-full bg-teal-500 hover:bg-teal-400 text-slate-950 shrink-0 shadow-xs"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>

          {/* Analysis Summary Column */}
          <Card className="border border-teal-500/40 border-t-4 border-t-amber-500 bg-card shadow-xs lg:col-span-4 flex flex-col justify-between overflow-hidden rounded-2xl">
            <CardHeader className="p-4 border-b border-border/50 bg-slate-900/40 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-teal-400" />
                Analysis Summary
              </CardTitle>
              <Badge className="bg-amber-950 text-amber-300 border border-amber-500/40 text-[10px]">
                {analysis ? "Analysis Ready" : "Awaiting Input"}
              </Badge>
            </CardHeader>

            <CardContent className="p-4 space-y-5 overflow-y-auto flex-1 text-left">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  ANALYSIS DETAILS
                </span>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] bg-slate-900 text-gray-300 border-slate-700">
                    Severity: {analysis?.severity || "Pending"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] bg-slate-900 text-gray-300 border-slate-700">
                    Triage: {analysis?.urgency || "Pending"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  POSSIBLE CONDITIONS
                </span>
                <p className="text-xs text-gray-400 italic">
                  {analysis?.possibleConditions?.join(", ") || "Describe your symptoms in the chat to see possible conditions."}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  RECOMMENDED SPECIALTIES
                </span>
                <p className="text-xs text-gray-300 font-semibold">
                  {analysis?.recommendedSpecialty || "Pending analysis."}
                </p>
              </div>
            </CardContent>

            <CardFooter className="p-4 border-t border-border/50 bg-slate-900/40 flex flex-col gap-2">
              <Link href="/doctors" className="w-full">
                <Button className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs h-9 shadow-xs flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Book Recommended Doctor
                </Button>
              </Link>
              <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-teal-400" />
                Usually available within 24-48 hours
              </span>
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}
