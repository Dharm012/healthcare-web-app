import Link from 'next/link';
import { 
  ShieldCheck, LayoutDashboard, Users, UserCheck, BarChart3, 
  FileEdit, ScrollText, Settings, LogOut, Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-slate-900 md:flex z-10">
        <div className="flex h-16 items-center border-b border-slate-700 px-6">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            <span className="font-bold tracking-tight text-white">HealthConnect <span className="text-indigo-400">Admin</span></span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid gap-1 px-4 text-sm font-medium">
            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">Overview</p>
            <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-lg bg-indigo-500/10 px-3 py-2 text-indigo-300 transition-all hover:text-indigo-200">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>

            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Management</p>
            <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-slate-800">
              <Users className="h-4 w-4" />
              User Management
            </Link>
            <Link href="/admin/doctor-verification" className="flex items-center justify-between rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-slate-800">
              <div className="flex items-center gap-3">
                <UserCheck className="h-4 w-4" />
                Doctor Verification
              </div>
              <Badge className="bg-amber-500 text-white text-[10px] px-1.5">4</Badge>
            </Link>

            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Insights</p>
            <Link href="/admin/analytics" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-slate-800">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
            <Link href="/admin/audit-logs" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-slate-800">
              <ScrollText className="h-4 w-4" />
              Audit Logs
            </Link>

            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Content</p>
            <Link href="/admin/content" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-slate-800">
              <FileEdit className="h-4 w-4" />
              Articles & FAQs
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-400 transition-all hover:text-white hover:bg-slate-800">
              <Settings className="h-4 w-4" />
              Platform Settings
            </Link>
          </nav>
        </div>
        <div className="border-t border-slate-700 p-4">
          <Button variant="outline" className="w-full justify-start text-red-400 border-slate-600 hover:text-red-300 hover:bg-slate-800" asChild>
            <Link href="/login">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Link>
          </Button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center gap-4 border-b bg-white px-6 shadow-sm z-10">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold text-gray-800">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-4 w-4 text-gray-600" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 ring-2 ring-white"></span>
            </Button>
            <div className="flex items-center gap-3 border-l pl-4">
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
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
