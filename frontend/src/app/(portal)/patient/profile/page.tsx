"use client";

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Shield, Save, Camera, Settings, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { toast } from '@/components/ui/toast';

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [fullName, setFullName] = useState('Patient');
  const [email, setEmail] = useState('patient@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [patientId, setPatientId] = useState('HC-98214');

  const handleComingSoon = () => toast.add({ title: 'Coming Soon', description: 'This feature will be available soon.', type: 'info' });

  useEffect(() => {
    setMounted(true);
    try {
      const storedName = localStorage.getItem("userName");
      const storedEmail = localStorage.getItem("userEmail");
      const storedUser = localStorage.getItem("user");

      if (storedName && storedName.trim()) setFullName(storedName);
      if (storedEmail && storedEmail.trim()) setEmail(storedEmail);

      if (storedUser) {
        const u = JSON.parse(storedUser);
        if (u.name && (!storedName || !storedName.trim())) setFullName(u.name);
        if (u.email && (!storedEmail || !storedEmail.trim())) setEmail(u.email);
        if (u.phone) setPhone(u.phone);
        if (u.id) setPatientId(`HC-${u.id.substring(0, 5).toUpperCase()}`);
      }
    } catch {}
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("userName", fullName);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.name = fullName;
        u.fullName = fullName;
        localStorage.setItem("user", JSON.stringify(u));
      }
    } catch {}
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PT';

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-slate-900 dark:text-slate-100 text-left">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Profile &amp; Account Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your personal demographics, medical baseline, and security credentials.</p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800 mb-4">
          <TabsTrigger value="personal" className="text-xs font-semibold">Personal Info</TabsTrigger>
          <TabsTrigger value="medical" className="text-xs font-semibold">Medical Baseline</TabsTrigger>
          <TabsTrigger value="security" className="text-xs font-semibold">Security &amp; Auth</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <form onSubmit={handleSave}>
            <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <Avatar className="h-16 w-16 border-2 border-teal-500/40">
                      <AvatarFallback className="bg-teal-600 text-white font-bold text-xl">{initials}</AvatarFallback>
                    </Avatar>
                    <Button onClick={handleComingSoon} size="icon" variant="outline" type="button" className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <Camera className="h-3 w-3" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{fullName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Patient ID: {patientId}</p>
                    <Badge className="mt-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                      Active Patient
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Full Legal Name</Label>
                    <Input 
                      value={fullName} 
                      onChange={(e) => setFullName(e.target.value)} 
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Email Address</Label>
                    <Input 
                      value={email} 
                      disabled
                      type="email" 
                      className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 text-xs h-10 cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Phone Number</Label>
                    <Input 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Date of Birth</Label>
                    <Input defaultValue="1992-06-18" type="date" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Gender</Label>
                    <Input defaultValue="Male" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Emergency Contact</Label>
                    <Input defaultValue="Family Contact - +91 98765 00000" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-4 flex items-center justify-between">
                {saved ? (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Personal info saved!
                  </span>
                ) : <span />}
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-xs cursor-pointer">
                  <Save className="h-4 w-4 mr-1.5" /> Save Changes
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="medical">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Baseline Clinical Summary</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Essential baseline markers shared with attending doctors.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Blood Group</p>
                  <p className="text-lg font-extrabold text-teal-600 dark:text-teal-400 mt-0.5">O Positive (O+)</p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Known Allergies</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Penicillin, Peanuts</p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Primary Physician</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">Dr. Dharm Patel</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-5">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Security &amp; Authentication</CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Encrypted password and session management.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 max-w-md">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Current Password</Label>
                  <Input type="password" placeholder="••••••••" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">New Password</Label>
                  <Input type="password" placeholder="••••••••" className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs h-10" />
                </div>
                <Button onClick={handleComingSoon} className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs h-9 mt-2">
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
