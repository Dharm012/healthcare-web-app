"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HeartPulse, LayoutDashboard, Stethoscope, Calendar, 
  Video, FileText, Pill, Activity, MessageSquare, 
  Settings, LogOut, Bell, Bot, CheckCircle2, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  const [hasUnreadBell, setHasUnreadBell] = useState<boolean>(true);
  const [showBellDropdown, setShowBellDropdown] = useState<boolean>(false);
  const [patientName, setPatientName] = useState<string>("Patient");
  const [patientId, setPatientId] = useState<string>("HC-98214");

  // Load individual registered patient name and account details
  useEffect(() => {
    try {
      const storedName = localStorage.getItem("userName");
      const storedUser = localStorage.getItem("user");
      if (storedName && storedName.trim()) {
        setPatientName(storedName);
      } else if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name) setPatientName(u.name);
        else if (u.fullName) setPatientName(u.fullName);
        else if (u.email) setPatientName(u.email.split('@')[0]);
      }
      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.id) setPatientId(`HC-${u.id.substring(0, 5).toUpperCase()}`);
      }
    } catch {}
  }, []);

  // Sync unread messages from localStorage and custom events
  useEffect(() => {
    const syncUnread = () => {
      if (pathname === '/patient/messages') {
        setUnreadMessages(0);
        return;
      }
      const stored = typeof window !== 'undefined' ? localStorage.getItem('healthconnect_unread_messages_count') : null;
      if (stored !== null) {
        setUnreadMessages(parseInt(stored, 10) || 0);
      }
    };

    syncUnread();

    const handleUnreadUpdate = () => {
      syncUnread();
    };

    window.addEventListener('healthconnect_unread_update', handleUnreadUpdate);
    window.addEventListener('storage', handleUnreadUpdate);

    return () => {
      window.removeEventListener('healthconnect_unread_update', handleUnreadUpdate);
      window.removeEventListener('storage', handleUnreadUpdate);
    };
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  const isMessagesPage = pathname === '/patient/messages';
  const effectiveUnread = isMessagesPage ? 0 : unreadMessages;

  const initials = patientName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PT';

  const navItems = [
    {
      section: "OVERVIEW",
      items: [
        { label: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
        { label: "AI Health Assistant", href: "/patient/ai-assistant", icon: Bot, isAi: true },
      ]
    },
    {
      section: "CARE & BOOKING",
      items: [
        { label: "Find a Doctor", href: "/doctors", icon: Stethoscope },
        { label: "Appointments", href: "/patient/appointments", icon: Calendar },
        { label: "Tele-Consultations", href: "/patient/consultations", icon: Video },
      ]
    },
    {
      section: "MEDICAL DATA",
      items: [
        { label: "Records & Reports", href: "/patient/records", icon: FileText },
        { label: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
      ]
    },
    {
      section: "ACCOUNT",
      items: [
        { 
          label: "Messages", 
          href: "/patient/messages", 
          icon: MessageSquare, 
          badge: effectiveUnread > 0 ? String(effectiveUnread) : undefined 
        },
        { label: "Profile & Settings", href: "/patient/profile", icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#05080d] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Sidebar Navigation */}
      <aside className="hidden w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 md:flex z-10 shrink-0">
        <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-800 px-6">
          <Link href="/patient/dashboard" className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            <span className="font-bold tracking-tight text-slate-900 dark:text-white text-base">
              HealthConnect <span className="text-teal-600 dark:text-teal-400">AI</span>
            </span>
          </Link>
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-4 text-xs font-medium">
            {navItems.map((group) => (
              <div key={group.section} className="mb-4">
                <p className="px-2 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  {group.section}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-all ${
                          isActive
                            ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-bold border border-teal-200 dark:border-teal-500/50 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.isAi ? (
                            <div className="h-4 w-4 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-[10px]">
                              AI
                            </div>
                          ) : (
                            <item.icon className={`h-4 w-4 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                          )}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="w-5 h-5 rounded-full bg-teal-600 dark:bg-teal-400 text-white dark:text-slate-950 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 p-4">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden min-w-0 bg-slate-50 dark:bg-[#05080d]">
        
        {/* Top Header */}
        <header className="flex h-16 items-center gap-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 sm:px-6 shadow-xs z-10 shrink-0 relative">
          <div className="w-full flex-1">
            <h1 className="text-sm font-bold text-slate-800 dark:text-slate-200">Patient Clinical Portal</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
            
            {/* Notification Bell */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setShowBellDropdown(!showBellDropdown);
                  setHasUnreadBell(false);
                }}
                className="relative text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {hasUnreadBell && (
                  <span className="absolute top-2 right-2 flex h-2 w-2 items-center justify-center rounded-full bg-teal-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
                <span className="sr-only">Toggle notifications</span>
              </Button>

              {/* Notification Dropdown */}
              {showBellDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-teal-500/30 shadow-2xl p-4 z-50 space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Notifications
                    </h4>
                    <Button variant="ghost" size="icon" onClick={() => setShowBellDropdown(false)} className="h-6 w-6 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white text-[11px]">Appointment Confirmed</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">Dr. Dharm Patel accepted your video consultation request.</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
                      <p className="font-bold text-slate-900 dark:text-white text-[11px]">New Clinical Message</p>
                      <p className="text-slate-500 dark:text-slate-400 text-[10px]">Dr. Dharm Patel sent you guidance on your lipid report.</p>
                    </div>
                  </div>

                  <Link href="/patient/messages" onClick={() => setShowBellDropdown(false)} className="block pt-1">
                    <Button size="sm" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-8">
                      Open Messages
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="text-right hidden sm:block">
                <p suppressHydrationWarning className="text-xs font-bold text-slate-900 dark:text-white leading-none">{patientName}</p>
                <p suppressHydrationWarning className="text-[10px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">ID: {patientId}</p>
              </div>
              <Avatar className="h-8 w-8 border border-teal-500/40">
                <AvatarFallback suppressHydrationWarning className="bg-teal-600 text-white font-bold text-xs">{initials}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
