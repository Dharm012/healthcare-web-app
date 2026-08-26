"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Sparkles, Stethoscope, AlertCircle, FileText, Loader2 } from "lucide-react";

export default function DoctorAIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "ai",
      content: "Hello Doctor. I am your Clinical Diagnostic & Drug Interaction Assistant. You can query clinical differential diagnoses, dosage guidelines, contraindications, or summarize patient pathology reports.",
      timestamp: "Just now"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userPrompt = inputValue.trim();
    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsAnalyzing(true);

    setTimeout(() => {
      let aiResponse = "Based on current clinical guidelines (MCI & ACC/AHA), initial first-line therapy involves lifestyle modification paired with guideline-directed medical therapy. Consider monitoring liver function enzymes (ALT/AST) and serum creatinine before titration.";
      if (userPrompt.toLowerCase().includes("atorvastatin") || userPrompt.toLowerCase().includes("lipid")) {
        aiResponse = "Clinical Insight for Dyslipidemia: High-intensity statin therapy (Atorvastatin 20-40mg daily) typically reduces LDL-C by ≥50%. Ensure baseline CPK evaluation if patient reports myalgia.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "ai",
          content: aiResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-slate-900 dark:text-slate-100 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bot className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Clinical AI Assistant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Evidence-based diagnostic reasoning, pharmacology guidelines, and drug interaction checker.</p>
        </div>
        <Badge className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 text-xs px-3 py-1">
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          Clinical LLM Engine
        </Badge>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden flex flex-col h-[calc(100vh-230px)]">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4">
          <CardTitle className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Clinical Query Session</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/40">
          {messages.map((m) => {
            const isAi = m.role === "ai";
            return (
              <div key={m.id} className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isAi
                      ? 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-tl-none'
                      : 'bg-teal-600 text-white font-medium rounded-tr-none'
                  }`}
                >
                  <p>{m.content}</p>
                  <span className={`block text-[9px] mt-1 ${isAi ? 'text-slate-400' : 'text-teal-100'} text-right`}>{m.timestamp}</span>
                </div>
              </div>
            );
          })}
          {isAnalyzing && (
            <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 italic">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing clinical literature &amp; pharmacopeia...</span>
            </div>
          )}
        </CardContent>

        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/80 flex items-center gap-2">
          <Input
            placeholder="Ask a clinical question (e.g. Drug interactions between Atorvastatin and Clarithromycin)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs h-10 rounded-xl"
          />
          <Button type="submit" disabled={!inputValue.trim()} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-4 rounded-xl shrink-0 cursor-pointer">
            <Send className="w-4 h-4 mr-1.5" /> Submit Query
          </Button>
        </form>
      </Card>
    </div>
  );
}
