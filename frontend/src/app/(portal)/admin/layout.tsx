"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShieldCheck, LayoutDashboard, Users, UserCheck, BarChart3, 
  FileEdit, ScrollText, Settings, LogOut, Bell, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const sidebarNavItems = [
  { section: "Overview", items: [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  ]},
  { section: "Management", items: [
    { title: "User Management", href: "/admin/users", icon: Users },
    { title: "Doctor Verification", href: "/admin/doctor-verification", icon: UserCheck, badge: "4" },
  ]},
  { section: "Insights", items: [
    { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ]},
  { section: "Content", items: [
    { title: "Platform Settings", href: "/admin/settings", icon: Settings },
  ]},
];

function SidebarContent({ pathname, onLinkClick }: { pathname: string; onLinkClick?: () => void }) {
  return (
    <>
      <div className="flex h-16 items-center border-b border-slate-700 px-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={onLinkClick}>
          <ShieldCheck className="h-6 w-6 text-indigo-400" />
          <span className="font-bold tracking-tight text-white">HealthConnect <span className="text-indigo-400">Admin</span></span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4 text-sm font-medium">
          {sidebarNavItems.map((group) => (
            <div key={group.section}>
              <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">{group.section}</p>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onLinkClick}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-all ${
                      isActive
                        ? 'bg-indigo-500/10 text-indigo-300'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.title}
                    </div>
                    {item.badge && (
                      <Badge className="bg-amber-500 text-white text-[10px] px-1.5">{item.badge}</Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
      <div className="border-t border-slate-700 p-4">
        <Button variant="outline" className="w-full justify-start text-red-400 border-slate-600 hover:text-red-300 hover:bg-slate-800" asChild>
          <Link href="/login" onClick={onLinkClick}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Link>
        </Button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      
      {/* Desktop Sidebar — unchanged */}
      <aside className="hidden w-64 flex-col border-r bg-slate-900 md:flex z-10">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-72 flex flex-col bg-slate-900 shadow-2xl animate-in slide-in-from-left duration-300">
            {/* Close button */}
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent pathname={pathname} onLinkClick={() => setIsMobileMenuOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6 shadow-sm z-10">
          {/* Mobile hamburger */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-gray-700 shrink-0"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4 text-gray-600" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>
            </Button>
            <div className="flex items-center gap-3 border-l pl-3 sm:pl-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium leading-none">Admin User</p>
                <p className="text-xs text-gray-500 mt-1">Super Admin</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-indigo-100 text-indigo-700">AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
