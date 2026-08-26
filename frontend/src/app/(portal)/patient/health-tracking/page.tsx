"use client";

import { useState } from 'react';
import { 
  Activity, HeartPulse, Thermometer, Weight, Droplets, TrendingUp, Plus
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const heartRateData = [
  { time: '6AM', value: 62 }, { time: '8AM', value: 68 }, { time: '10AM', value: 75 },
  { time: '12PM', value: 72 }, { time: '2PM', value: 80 }, { time: '4PM', value: 76 },
  { time: '6PM', value: 70 }, { time: '8PM', value: 65 }, { time: '10PM', value: 60 },
];

const bpData = [
  { date: 'Aug 15', systolic: 122, diastolic: 78 },
  { date: 'Aug 16', systolic: 118, diastolic: 75 },
  { date: 'Aug 17', systolic: 125, diastolic: 82 },
  { date: 'Aug 18', systolic: 120, diastolic: 76 },
  { date: 'Aug 19', systolic: 116, diastolic: 74 },
  { date: 'Aug 20', systolic: 119, diastolic: 77 },
  { date: 'Aug 21', systolic: 118, diastolic: 75 },
];

const weightData = [
  { week: 'Week 1', value: 78.5 }, { week: 'Week 2', value: 78.2 },
  { week: 'Week 3', value: 77.8 }, { week: 'Week 4', value: 77.5 },
  { week: 'Week 5', value: 77.1 }, { week: 'Week 6', value: 76.8 },
  { week: 'Week 7', value: 76.5 }, { week: 'Week 8', value: 76.2 },
];

const glucoseData = [
  { time: 'Fasting', value: 95 }, { time: 'Post-Breakfast', value: 140 },
  { time: 'Pre-Lunch', value: 110 }, { time: 'Post-Lunch', value: 155 },
  { time: 'Pre-Dinner', value: 105 }, { time: 'Post-Dinner', value: 148 },
  { time: 'Bedtime', value: 120 },
];

export default function HealthTrackingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Health Tracking</h2>
          <p className="text-gray-500">Monitor your vitals and health trends over time.</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" /> Log Vitals
        </Button>
      </div>

      {/* Quick Vital Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <HeartPulse className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Heart Rate</p>
                <p className="text-2xl font-bold">72 bpm</p>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] mt-1">Normal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Activity className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Blood Pressure</p>
                <p className="text-2xl font-bold">118/75</p>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] mt-1">Optimal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                <Weight className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Weight</p>
                <p className="text-2xl font-bold">76.2 kg</p>
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[10px] mt-1">
                  <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> -2.3 kg
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <Droplets className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Blood Glucose</p>
                <p className="text-2xl font-bold">95 mg/dL</p>
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] mt-1">Normal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="heart-rate" className="w-full">
        <TabsList>
          <TabsTrigger value="heart-rate">Heart Rate</TabsTrigger>
          <TabsTrigger value="blood-pressure">Blood Pressure</TabsTrigger>
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="glucose">Blood Glucose</TabsTrigger>
        </TabsList>

        <TabsContent value="heart-rate">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Heart Rate — Today</CardTitle>
              <CardDescription>Beats per minute throughout the day</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={heartRateData}>
                  <defs>
                    <linearGradient id="hrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                  <YAxis domain={[50, 90]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#ef4444" fill="url(#hrGradient)" strokeWidth={2} name="BPM" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blood-pressure">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Blood Pressure — Last 7 Days</CardTitle>
              <CardDescription>Systolic and diastolic readings</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={bpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis domain={[60, 140]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weight">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Weight Trend — Last 8 Weeks</CardTitle>
              <CardDescription>Tracking your weight loss progress</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weightData}>
                  <defs>
                    <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                  <YAxis domain={[74, 80]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#f97316" fill="url(#weightGrad)" strokeWidth={2} name="Weight (kg)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="glucose">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Blood Glucose — Today</CardTitle>
              <CardDescription>Glucose levels throughout the day (mg/dL)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={glucoseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                  <YAxis domain={[80, 170]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} name="Glucose" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
