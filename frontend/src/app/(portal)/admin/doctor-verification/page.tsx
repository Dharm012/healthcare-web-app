"use client";

import { useState } from 'react';
import { ShieldCheck, FileCheck, XCircle, CheckCircle, ExternalLink, Download, FileText } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const verificationRequests = [
  {
    id: 'REQ-101', name: 'Dr. Anika Patel', specialty: 'Dermatology', license: 'MCI-294812', 
    submittedAt: '2 hours ago', avatar: 'AP', status: 'Pending',
    documents: ['Medical License.pdf', 'Board Certification.pdf', 'ID Proof.pdf']
  },
  {
    id: 'REQ-102', name: 'Dr. Rajiv Mehta', specialty: 'Neurology', license: 'MCI-183921', 
    submittedAt: '5 hours ago', avatar: 'RM', status: 'Pending',
    documents: ['Medical License.pdf', 'Degree Certificate.pdf']
  },
  {
    id: 'REQ-103', name: 'Dr. Lisa Chen', specialty: 'Pediatrics', license: 'MCI-384710', 
    submittedAt: '1 day ago', avatar: 'LC', status: 'Pending',
    documents: ['Medical License.pdf', 'ID Proof.pdf']
  },
];

export default function DoctorVerificationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Doctor Verification</h2>
        <p className="text-gray-500">Review and approve doctor registrations to ensure platform quality.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Queue
            <Badge className="ml-2 bg-amber-500 text-white text-[10px]">{verificationRequests.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-4">
          {verificationRequests.map((req) => (
            <Card key={req.id} className="border-0 shadow-sm border-l-4 border-l-amber-500">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2 border-gray-100">
                        <AvatarFallback className="bg-teal-50 text-teal-700 text-lg font-bold">{req.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{req.name}</h3>
                        <p className="text-gray-500">{req.specialty}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md">
                            <ShieldCheck className="h-3 w-3" /> License: <span className="font-mono font-medium text-gray-900">{req.license}</span>
                          </span>
                          <span>Submitted: {req.submittedAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="flex-1 bg-gray-50 p-4 rounded-lg border">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <FileCheck className="h-4 w-4 text-indigo-600" /> Submitted Documents
                    </h4>
                    <div className="space-y-2">
                      {req.documents.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 border rounded-md text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <FileText className="h-4 w-4 text-gray-400" />
                            {doc}
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-indigo-600">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500">
                              <Download className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:w-48 flex flex-col justify-center gap-3">
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                    <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
                      <XCircle className="mr-2 h-4 w-4" /> Reject
                    </Button>
                    <Button variant="ghost" className="w-full text-sm text-gray-500">
                      Request More Info
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {verificationRequests.length === 0 && (
            <Card className="border-0 shadow-sm border-dashed">
              <CardContent className="p-12 text-center text-gray-500">
                <ShieldCheck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">Queue is Empty</h3>
                <p>There are no pending doctor verifications at this time.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Approved doctors list would appear here.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected" className="mt-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center text-gray-500">
              Rejected applications would appear here.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
