"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  Calendar,
  Video,
  FileText,
  Bot,
  MessageSquare,
  UserCircle,
  Bell,
  Search,
  LogOut,
  Menu,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/doctor/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Patients",
    href: "/doctor/patients",
    icon: Users,
  },
  {
    title: "Schedule & Availability",
    href: "/doctor/schedule",
    icon: Calendar,
  },
  {
    title: "Consultations",
    href: "/doctor/consultations",
    icon: Video,
  },
  {
    title: "Prescriptions",
    href: "/doctor/prescriptions",
    icon: FileText,
  },
  {
    title: "Clinical AI Assistant",
    href: "/doctor/ai-assistant",
    icon: Bot,
  },
  {
    title: "Messages",
    href: "/doctor/messages",
    icon: MessageSquare,
  },
  {
    title: "Profile",
    href: "/doctor/profile",
    icon: UserCircle,
  },
];

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [doctorName, setDoctorName] = useState<string>("Doctor");
  const [doctorSpecialty, setDoctorSpecialty] = useState<string>("General Physician");
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem("userName");
      const stored = localStorage.getItem("user");
      const role = localStorage.getItem("userRole");
      setCurrentUserRole(role);

      if (storedName && storedName.trim()) {
        setDoctorName(storedName);
      } else if (stored) {
        const u = JSON.parse(stored);
        if (u.doctorProfile?.fullName) setDoctorName(u.doctorProfile.fullName);
        else if (u.name) setDoctorName(u.name);
        else if (u.fullName) setDoctorName(u.fullName);
        else if (u.email) setDoctorName(u.email.split('@')[0]);

        if (u.doctorProfile?.specialization) setDoctorSpecialty(u.doctorProfile.specialization);
      }
    } catch {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    window.location.href = "/login";
  };

  const initials = doctorName
    .replace(/^Dr\.?\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'DP';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 flex-col md:flex-row text-gray-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-8">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">HealthConnect</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {sidebarNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 font-bold"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-teal-600 dark:text-teal-400" : "text-gray-400 dark:text-slate-500"}`} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-gray-200 dark:border-slate-800 pt-4">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer text-xs"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 md:px-8 shadow-xs">
          <Button variant="ghost" size="icon" className="md:hidden text-gray-700 dark:text-slate-300">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="flex-1 max-w-xl hidden md:flex items-center gap-2 bg-gray-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <Search className="h-4 w-4 text-gray-400 dark:text-slate-500" />
            <Input
              type="search"
              placeholder="Search patients, appointments, or records..."
              className="border-0 bg-transparent h-8 focus-visible:ring-0 px-2 text-xs text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <ThemeToggle />

            <Button variant="ghost" size="icon" className="relative text-gray-600 dark:text-slate-400">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-teal-600 border-2 border-white dark:border-slate-900"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-9 w-9 rounded-full outline-none hover:opacity-90 transition-opacity cursor-pointer">
                <Avatar className="h-9 w-9 border border-gray-200 dark:border-slate-700">
                  <AvatarFallback suppressHydrationWarning className="bg-teal-600 text-white font-bold text-xs">{initials}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white" align="end" sideOffset={4}>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p suppressHydrationWarning className="text-xs font-bold leading-none">{doctorName}</p>
                    <p suppressHydrationWarning className="text-[10px] leading-none text-gray-500 dark:text-slate-400">
                      {doctorSpecialty}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="border-gray-200 dark:border-slate-800" />
                <DropdownMenuItem>
                  <Link href="/doctor/profile" className="flex items-center text-xs cursor-pointer w-full">
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-xs text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/40 cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Patient Account Warning Banner */}
        {currentUserRole === 'PATIENT' && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 p-3 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-amber-800 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                <strong>Notice:</strong> You are currently logged in with a Patient account. To review and accept incoming requests for <strong>Dr. Dharm Patel</strong>, please sign in with your Doctor credentials.
              </span>
            </div>
            <Link href="/login" onClick={handleLogout}>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-7 shrink-0 cursor-pointer">
                Sign in as Doctor
              </Button>
            </Link>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
