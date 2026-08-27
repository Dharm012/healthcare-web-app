"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  AlertTriangle, Send, Bot, User, Activity, Stethoscope, 
  Calendar, Clock, Loader2, Sparkles, CheckCircle2 
} from "lucide-react";
import api from '@/lib/api';

type Message = {
  id: string;
  role: "ai" | "user";
  content: string;
  timestamp: string;
};

export default function AIAssistantPage() {
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
        content: result.recommendation || "Thank you. Based on your symptoms, I have generated an initial clinical analysis in the summary panel on the right.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newAiMsg]);
      setAnalysis(result);
    } catch {
      const fallbackAiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "I received your symptoms. For persistent symptoms, consulting a certified physician like Dr. Dharm Patel is strongly recommended.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto text-slate-900 dark:text-slate-100">
      
      {/* Disclaimer Banner Top */}
      <div className="bg-blue-50 dark:bg-slate-900/90 border border-blue-200 dark:border-border/80 text-blue-900 dark:text-blue-200 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs shadow-xs text-left">
        <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
        <span>
          <strong>Clinical Disclaimer:</strong> AI suggestions are not a substitute for professional medical diagnosis or treatment. Always seek the advice of your physician or other qualified health provider.
        </span>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-auto lg:h-[calc(100vh-210px)]">
        
        {/* Left Column: AI Symptom Checker Chat */}
        <Card className="border border-slate-200 dark:border-teal-500/40 bg-white dark:bg-card shadow-xs lg:col-span-8 flex flex-col overflow-hidden rounded-2xl min-h-[420px]">
          <CardHeader className="p-4 border-b border-slate-100 dark:border-border/50 bg-slate-50/70 dark:bg-slate-900/40 flex flex-row items-center gap-2 text-left">
            <Bot className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">AI Symptom Checker</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/40">
            {messages.map((m) => {
              const isAi = m.role === "ai";
              return (
                <div key={m.id} className={`flex items-start gap-2.5 ${isAi ? "justify-start" : "justify-end"}`}>
                  {isAi && (
                    <Avatar className="h-8 w-8 border border-teal-500/40 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-teal-700 text-teal-100 text-xs font-bold">
                        AI
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div className="space-y-1 max-w-[80%]">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isAi
                          ? "bg-teal-600 dark:bg-teal-500 text-white dark:text-slate-950 font-medium rounded-tl-none shadow-xs text-left"
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium rounded-tr-none shadow-xs border border-slate-200 dark:border-slate-700 text-left"
                      }`}
                    >
                      {m.content}
                    </div>
                    <span className={`block text-[9px] text-slate-400 dark:text-gray-500 ${isAi ? "text-left pl-1" : "text-right pr-1"}`}>
                      {m.timestamp}
                    </span>
                  </div>

                  {!isAi && (
                    <Avatar className="h-8 w-8 border border-slate-300 dark:border-gray-400 shrink-0 mt-0.5">
                      <AvatarFallback className="bg-slate-700 text-white text-xs font-bold">
                        JD
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 italic">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI is analyzing clinical symptoms...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-border/50 bg-white dark:bg-slate-900/40 flex items-center gap-2">
            <input
              type="text"
              placeholder="Describe your symptoms (e.g., headache, fever for 2 days)..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-teal-500/40 text-slate-900 dark:text-white text-xs px-4 py-2.5 rounded-full focus:outline-none focus:border-teal-500 placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isTyping || !inputValue.trim()}
              className="h-9 w-9 rounded-full bg-teal-600 hover:bg-teal-700 text-white shrink-0 shadow-xs cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </Card>

        {/* Right Column: Analysis Summary */}
        <Card className="border border-slate-200 dark:border-teal-500/40 border-t-4 border-t-amber-500 bg-white dark:bg-card shadow-xs lg:col-span-4 flex flex-col justify-between overflow-hidden rounded-2xl">
          <CardHeader className="p-4 border-b border-slate-100 dark:border-border/50 bg-slate-50/70 dark:bg-slate-900/40 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Analysis Summary
            </CardTitle>
            <Badge className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 text-[10px]">
              {analysis ? "Analysis Ready" : "Awaiting Input"}
            </Badge>
          </CardHeader>

          <CardContent className="p-4 space-y-5 overflow-y-auto flex-1 text-left">
            {/* Analysis Details */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">
                ANALYSIS DETAILS
              </span>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-slate-700">
                  Severity: {analysis?.severity || "Pending"}
                </Badge>
                <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-slate-700">
                  Triage: {analysis?.triageLevel || "Pending"}
                </Badge>
              </div>
            </div>

            {/* Possible Conditions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">
                POSSIBLE CONDITIONS
              </span>
              <p className="text-xs text-slate-600 dark:text-gray-400 italic">
                {analysis?.possibleConditions?.join(", ") || "Describe your symptoms in the chat to see possible clinical conditions."}
              </p>
            </div>

            {/* Recommended Specialties */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider block">
                RECOMMENDED SPECIALTY
              </span>
              <p className="text-xs text-teal-700 dark:text-teal-300 font-bold">
                {analysis?.recommendedSpecialty || "General Physician"}
              </p>
            </div>
          </CardContent>

          <CardFooter className="p-4 border-t border-slate-100 dark:border-border/50 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col gap-2">
            <Link href="/doctors" className="w-full">
              <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer">
                <Calendar className="w-3.5 h-3.5" />
                Book Recommended Doctor
              </Button>
            </Link>
            <span className="text-[10px] text-slate-500 dark:text-gray-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              Usually available today for video consult
            </span>
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}
