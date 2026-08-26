"use client";

import { Save, Bell, Shield, Globe, CreditCard, LayoutTemplate } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Platform Settings</h2>
        <p className="text-gray-500">Configure global platform preferences and integrations.</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 p-1 bg-white border">
          <TabsTrigger value="general" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <LayoutTemplate className="h-4 w-4 mr-2" /> General
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <Shield className="h-4 w-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <Bell className="h-4 w-4 mr-2" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <CreditCard className="h-4 w-4 mr-2" /> Payments
          </TabsTrigger>
          <TabsTrigger value="integrations" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700">
            <Globe className="h-4 w-4 mr-2" /> Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform configuration and branding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input defaultValue="HealthConnect AI" />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input defaultValue="support@healthconnect.com" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input defaultValue="+1 (800) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input defaultValue="Asia/Kolkata (IST)" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Platform Description (Meta)</Label>
                <textarea
                  className="w-full p-3 border rounded-md text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  defaultValue="Intelligent healthcare platform connecting patients, doctors, and administrators."
                />
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="h-4 w-4 mr-2" /> Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Security & Compliance</CardTitle>
              <CardDescription>Manage HIPAA/GDPR settings and password policies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <h4 className="font-semibold text-gray-900">Require Two-Factor Authentication (2FA)</h4>
                  <p className="text-sm text-gray-500">Force all doctors and admins to use 2FA.</p>
                </div>
                <Button variant="outline" className="bg-white border-green-200 text-green-700 hover:bg-green-50">Enabled</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <h4 className="font-semibold text-gray-900">Strict Password Policy</h4>
                  <p className="text-sm text-gray-500">Require symbols, numbers, and uppercase letters.</p>
                </div>
                <Button variant="outline" className="bg-white border-green-200 text-green-700 hover:bg-green-50">Enabled</Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <h4 className="font-semibold text-gray-900">Session Timeout</h4>
                  <p className="text-sm text-gray-500">Automatically log out inactive users.</p>
                </div>
                <select className="border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white">
                  <option>15 Minutes</option>
                  <option selected>30 Minutes</option>
                  <option>1 Hour</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Payment Gateway</CardTitle>
              <CardDescription>Configure payment processing providers and fees.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Active Gateway</Label>
                  <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option selected>Razorpay (India)</option>
                    <option>Stripe (Global)</option>
                    <option>PayPal</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Platform Commission (%)</Label>
                  <Input type="number" defaultValue="15" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>API Key (Live)</Label>
                <Input type="password" value="rzp_live_xxxxxxxxxxxxx" readOnly />
              </div>
              <div className="space-y-2">
                <Label>API Secret (Live)</Label>
                <Input type="password" value="••••••••••••••••••••••••" readOnly />
              </div>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Save className="h-4 w-4 mr-2" /> Update Keys
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Placeholder for other tabs */}
        <TabsContent value="notifications" className="mt-4">
           <Card className="border-0 shadow-sm p-8 text-center text-gray-500">
             Notification templates and routing configuration.
           </Card>
        </TabsContent>
        <TabsContent value="integrations" className="mt-4">
           <Card className="border-0 shadow-sm p-8 text-center text-gray-500">
             Third-party EHR, Pharmacy, and Lab integrations.
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
