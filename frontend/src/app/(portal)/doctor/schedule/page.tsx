"use client";

import { Clock, Calendar, Plus, Edit2, Trash2, Video, MapPin, User } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const weeklySlots = [
  { day: 'Monday', slots: ['09:00 - 12:00', '14:00 - 17:00'], status: 'active' },
  { day: 'Tuesday', slots: ['09:00 - 12:00', '14:00 - 17:00'], status: 'active' },
  { day: 'Wednesday', slots: ['09:00 - 13:00'], status: 'active' },
  { day: 'Thursday', slots: ['09:00 - 12:00', '14:00 - 17:00'], status: 'active' },
  { day: 'Friday', slots: ['09:00 - 12:00'], status: 'active' },
  { day: 'Saturday', slots: ['10:00 - 14:00'], status: 'active' },
  { day: 'Sunday', slots: [], status: 'unavailable' },
];

const todaySchedule = [
  { time: '09:00 AM', patient: 'John Doe', type: 'Video', reason: 'Follow-up: Lipid Panel Review', status: 'Completed', avatar: 'JD' },
  { time: '09:30 AM', patient: 'Priya Sharma', type: 'In-Person', reason: 'Gestational Diabetes Monitoring', status: 'Completed', avatar: 'PS' },
  { time: '10:00 AM', patient: 'Arjun Mehta', type: 'Video', reason: 'Atrial Fibrillation Check', status: 'In Progress', avatar: 'AM' },
  { time: '10:30 AM', patient: 'Meera Nair', type: 'Video', reason: 'CHF Management Review', status: 'Upcoming', avatar: 'MN' },
  { time: '11:00 AM', patient: 'Fatima Sheikh', type: 'In-Person', reason: 'MVP Annual Assessment', status: 'Upcoming', avatar: 'FS' },
  { time: '02:00 PM', patient: 'Rajesh Gupta', type: 'Video', reason: 'New Patient Consultation', status: 'Upcoming', avatar: 'RG' },
];

export default function DoctorSchedulePage() {
  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Schedule &amp; Availability</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your consultation slots, telehealth hours, and daily calendar.</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 shadow-xs cursor-pointer">
          <Plus className="h-4 w-4 mr-1.5" /> Add Time Slot
        </Button>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 mb-4">
          <TabsTrigger value="today" className="text-xs font-semibold">Today&apos;s Schedule ({todaySchedule.length})</TabsTrigger>
          <TabsTrigger value="weekly" className="text-xs font-semibold">Weekly Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-3">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden text-left">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                Live Consultation Queue
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">{todaySchedule.length} patients scheduled for today</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {todaySchedule.map((appt, i) => (
                <div key={i} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${
                  appt.status === 'In Progress' ? 'border-teal-400 bg-teal-50/60 dark:bg-teal-950/40 ring-1 ring-teal-400/50' :
                  appt.status === 'Completed' ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 opacity-80' : 
                  'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="text-center min-w-[70px]">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{appt.time}</p>
                      <p className="text-[10px] text-slate-400">30 min</p>
                    </div>
                    <div className="h-8 w-[2px] bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <Avatar className="h-9 w-9 border border-teal-200 dark:border-teal-800">
                      <AvatarFallback className="bg-teal-600 text-white text-xs font-bold">{appt.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">{appt.patient}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{appt.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Badge variant="outline" className={
                      appt.type === 'Video' ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px]' : 
                      'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px]'
                    }>
                      {appt.type === 'Video' ? <Video className="h-3 w-3 mr-1" /> : <MapPin className="h-3 w-3 mr-1" />}
                      {appt.type}
                    </Badge>
                    <Badge className={
                      appt.status === 'Completed' ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px]' :
                      appt.status === 'In Progress' ? 'bg-teal-600 text-white text-[10px]' :
                      'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px]'
                    }>{appt.status}</Badge>
                    {appt.status === 'In Progress' && (
                      <Link href="/doctor/consultations">
                        <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-7">Join Room</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-3">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl text-left">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">Recurring Weekly Schedule</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Slots visible to patients in Find a Doctor</CardDescription>
            </CardHeader>
            <CardContent className="p-4 divide-y divide-slate-100 dark:divide-slate-800">
              {weeklySlots.map((ws, i) => (
                <div key={i} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{ws.day}</h4>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                      {ws.slots.length > 0 ? ws.slots.join(' & ') : 'Off Duty / Unavailable'}
                    </p>
                  </div>
                  <Badge variant={ws.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                    {ws.status === 'active' ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
