"use client";

import { 
  Users, UserCheck, Calendar, TrendingUp, DollarSign,
  CheckCircle, XCircle, Clock, AlertTriangle, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { toast } from '@/components/ui/toast';

const registrationData = [
  { day: 'Mon', patients: 24, doctors: 3 },
  { day: 'Tue', patients: 31, doctors: 5 },
  { day: 'Wed', patients: 18, doctors: 2 },
  { day: 'Thu', patients: 42, doctors: 7 },
  { day: 'Fri', patients: 35, doctors: 4 },
  { day: 'Sat', patients: 28, doctors: 6 },
  { day: 'Sun', patients: 15, doctors: 1 },
];

const pendingDoctors = [
  { id: 1, name: 'Dr. Anika Patel', specialty: 'Dermatology', license: 'MCI-294812', submittedAt: '2 hours ago', avatar: 'AP' },
  { id: 2, name: 'Dr. Rajiv Mehta', specialty: 'Neurology', license: 'MCI-183921', submittedAt: '5 hours ago', avatar: 'RM' },
  { id: 3, name: 'Dr. Lisa Chen', specialty: 'Pediatrics', license: 'MCI-384710', submittedAt: '1 day ago', avatar: 'LC' },
  { id: 4, name: 'Dr. Omar Hassan', specialty: 'Orthopedics', license: 'MCI-192837', submittedAt: '2 days ago', avatar: 'OH' },
];

const auditLogs = [
  { action: 'Doctor Approved', actor: 'Admin', target: 'Dr. Sneha Roy', time: '10 min ago', type: 'success' },
  { action: 'User Suspended', actor: 'System', target: 'patient-9281', time: '32 min ago', type: 'warning' },
  { action: 'Article Published', actor: 'Admin', target: '"Managing Diabetes"', time: '1 hr ago', type: 'info' },
  { action: 'Failed Login Attempt', actor: 'System', target: 'unknown@mail.com', time: '2 hrs ago', type: 'error' },
  { action: 'Payment Refunded', actor: 'Admin', target: 'INV-2026-4821', time: '3 hrs ago', type: 'warning' },
];

export default function AdminDashboard() {
  const handleComingSoon = () => toast.add({ title: 'Coming Soon', description: 'This feature will be available soon.', type: 'info' });

  return (
    <div className="space-y-6">
      
      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12,847</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +12.5% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Doctors</CardTitle>
            <UserCheck className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">342</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 mr-1" /> +8 new this week
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">89</div>
            <p className="text-xs text-gray-500 mt-1">62 completed, 27 remaining</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Revenue (Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹3,48,200</div>
            <p className="text-xs text-green-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> +18.2% growth
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* User Registrations Chart */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>User Registrations (Last 7 Days)</CardTitle>
            <CardDescription>New patient and doctor sign-ups</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={registrationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="patients" fill="#0d9488" radius={[4, 4, 0, 0]} name="Patients" />
                <Bar dataKey="doctors" fill="#6366f1" radius={[4, 4, 0, 0]} name="Doctors" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Doctor Verification Queue */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-md">Doctor Verification</CardTitle>
              <CardDescription>{pendingDoctors.length} pending applications</CardDescription>
            </div>
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{pendingDoctors.length} Pending</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingDoctors.map((doc) => (
              <div key={doc.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">{doc.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">{doc.specialty} • {doc.license}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{doc.submittedAt}</p>
                </div>
                <div className="flex gap-1.5">
                  <Button onClick={handleComingSoon} size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:bg-green-50 hover:text-green-700">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleComingSoon} size="icon" variant="outline" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Audit Logs</CardTitle>
            <CardDescription>System and admin actions</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/audit-logs">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3 font-medium">Action</th>
                  <th className="pb-3 font-medium">Actor</th>
                  <th className="pb-3 font-medium">Target</th>
                  <th className="pb-3 font-medium">Time</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="py-3 font-medium text-gray-900">{log.action}</td>
                    <td className="py-3 text-gray-600">{log.actor}</td>
                    <td className="py-3 text-gray-600">{log.target}</td>
                    <td className="py-3 text-gray-500">{log.time}</td>
                    <td className="py-3">
                      <Badge className={
                        log.type === 'success' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                        log.type === 'warning' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                        log.type === 'error' ? 'bg-red-100 text-red-700 hover:bg-red-100' :
                        'bg-blue-100 text-blue-700 hover:bg-blue-100'
                      }>
                        {log.type === 'success' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                         log.type === 'warning' ? <AlertTriangle className="h-3 w-3 mr-1" /> :
                         log.type === 'error' ? <XCircle className="h-3 w-3 mr-1" /> :
                         <Clock className="h-3 w-3 mr-1" />}
                        {log.type}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
